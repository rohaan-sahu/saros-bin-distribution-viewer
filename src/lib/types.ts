// type used for aggregate pool info and used to display in BinDistributionChart
export interface BinLiquidityData {
  binId: number;
  price: number;
  reserveXAmount: number;
  reserveYAmount: number;
  totalLiquidity: number;
  totalSupply?: string;
  isActive: boolean;
}

export interface UserPositionData {
  binId: number;
  price: number;
  reserveXAmount: number;
  reserveYAmount: number;
  totalLiquidity: number;
  totalSupply?: string;
  isActive: boolean;
}
