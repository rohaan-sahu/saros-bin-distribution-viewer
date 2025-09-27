/* eslint-disable @typescript-eslint/no-unused-vars */
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { BinLiquidityData } from "./types";
import { calculateTokenAmount } from "./utils";
import {PublicKey} from '@solana/web3.js'

// 🎯 WORKSHOP POOL - USDC/USDT
const POOL_ADDRESS = "9P3N4QxjMumpTNNdvaNNskXu2t7VHMMXtePQB72kkSAk";

// Shared DLMM service instance
const dlmmService = new LiquidityBookServices({
  mode: MODE.MAINNET,
  options: {
    rpcUrl:
      process.env.NEXT_PUBLIC_RPC_URL || "http://api.mainnet-beta.solana.com",
  },
});

// helper functions we will define
export const fetchPoolInfo = async (poolAddress: string) => {
  try {
    
    const metadata = await dlmmService.fetchPoolMetadata(poolAddress);
    console.log(`${poolAddress}`, metadata);
    
    const baseAmount = calculateTokenAmount(metadata.baseReserve,metadata.extra.tokenBaseDecimal);
    const quoteAmount = calculateTokenAmount(metadata.quoteReserve,metadata.extra.tokenQuoteDecimal);

    let currentMarketPrice = 1;
    const quoteResult = await dlmmService.quote({
        amount: 1000000,
        metadata: metadata,
        optional: {
          isExactInput: true,
          swapForY: true,
          slippage: 0.5
        } 
      }
    );

    currentMarketPrice = calculateTokenAmount(quoteResult.amountOut,metadata.extra.tokenQuoteDecimal);

    const poolPubKey = new PublicKey(poolAddress);
    const pairAccount = await dlmmService.getPairAccount(poolPubKey);
    const activeBin =  pairAccount.activeId;
    const binStep = pairAccount.binStep;
    const activeBinArrayIndex = Math.floor(activeBin/256);
    //const payer:PublicKey = new PublicKey('');

    const arrayInfo = await dlmmService.getBinArrayInfo({
      binArrayIndex: activeBinArrayIndex,
      pair: poolPubKey,
      payer: poolPubKey,
    })

    return {
      metadata,
      currentMarketPrice,
      activeBin,
      binStep,
      ...arrayInfo,
    }

  } catch (error) {
    console.error("Error fetching pool data:", error);
    throw error;
  }
};

export const getBinLiquidity = async (poolAddress?:string): Promise<BinLiquidityData[]> => {
  try {
    const { metadata,
      currentMarketPrice,
      activeBin,
      binStep,
      bins,
      resultIndex
    } =  await fetchPoolInfo(poolAddress||POOL_ADDRESS);

    const binLiquidityData: BinLiquidityData[] = [];

    bins.forEach((bin: any , index: number) => {
      if (bin.reserveX > 0 || bin.reserveY > 0) {
        const binId = resultIndex*256 + index;
        const isActiveBin = binId === activeBin;

        const reserveXAmount = calculateTokenAmount(
          bin.reserveX,
          metadata.extra.tokenBaseDecimal
        );

        const reserveYAmount = calculateTokenAmount(
          bin.reserveY,
          metadata.extra.tokenQuoteDecimal
        );

        const priceDelta = Math.pow(1+ binStep/10000 , binId - activeBin);
        const binPrice  = currentMarketPrice* priceDelta;

        const totalLiquidity = (reserveXAmount * binPrice) + (reserveYAmount/binPrice);

        binLiquidityData.push({
          binId,
          price: binPrice,
          reserveXAmount,
          reserveYAmount,
          totalLiquidity,
          isActive: isActiveBin
        });
      };


    });

    return binLiquidityData;
  } catch (error) {
    console.error("❌ Workshop error:", error);
    return [];
  }
};
