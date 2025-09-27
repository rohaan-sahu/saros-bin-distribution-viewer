"use client";

import { BinDistributionChart } from "@/components/bin-distribution/chart";
import { getBinLiquidity } from "@/lib/dlmm";
import { BinLiquidityData, UserPositionData } from "@/lib/types";
import { useEffect, useState } from "react";

export default function LiveWorkshopDemo() {
  const [binDataMap, setBinDataMap] = useState<Record<string, BinLiquidityData[]>>({});
  const [loading, setLoading] = useState(true);
  const [binData, setBinData] = useState<UserPositionData[]>([]);


  const POOL_ADDRESS_1 = '7hc6hXjDPcFnhGBPBGTKUtViFsQuyWw8ph4ePHF1aTYG';
  const POOL_ADDRESS_2 = 'DHXKB9fSff4LjubMFieKxaBrvNY6AzXVwaRLk5N2vs87';
  const POOL_ADDRESS_3 = '9P3N4QxjMumpTNNdvaNNskXu2t7VHMMXtePQB72kkSAk';
  const POOL_ADDRESS_4 = 'AfR7SmvprgWK1e7c6VNYi7mLfcNgRgZjJ5yhxoSbJx5W';

  const pool_address = [POOL_ADDRESS_1,POOL_ADDRESS_2,POOL_ADDRESS_3,POOL_ADDRESS_4];

  const getAllBinData = async () => {
    setLoading(true);
    try {
      for (const address of pool_address) {
        const data = await getBinLiquidity(address);
        setBinDataMap(prev => ({
          ...prev,
          [address]: data
        }));
      }
    } catch (error) {
      console.error('Error fetching bin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBinData();
  }, []);

  if (loading) {
    return <div>Loading charts...</div>;
  }

  return (
   <div className="w-full my-auto h-full rounded-lg border border-gray-300">
     <div className="space-y-6 px-4 sm:px-6 rounded-lg">
        {
        pool_address.map((address, index) => (
          <div key={address} >
            <h3 className="text-lg font-semibold mb-2">
              Pool {index + 1}: {address}
            </h3>
            <BinDistributionChart 
              binData={binDataMap[address] || []} 
              poolAddress={address}
            />
          </div>
        ))
        }
      </div>
    </div>
  );
}
