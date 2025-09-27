import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BinLiquidityData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, ReferenceLine } from "recharts";
import { useState } from "react";

const chartConfig = {
  totalLiquidity: {
    label: "Liquidity ($)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BinDistributionChart({
  binData,
  poolAddress
}: {
  binData: BinLiquidityData[];
  poolAddress?:string;
}) {

  if (binData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            bin distribution chart
          </h4>
          <div className="text-xs italic">No data available</div>
        </div>
        <div className="flex items-center justify-center h-64 border border-dashed rounded-lg bg-muted/10">
          <p className="text-muted-foreground text-sm">
            No liquidity data to display
          </p>
        </div>
      </div>
    );
  }

  // Negate the reserveYAmount - to help is rendering stacked graphs
  const binDataActual = binData.map(bin => ({
    ...bin,
    reserveYAmount: -bin.reserveYAmount,
  }));

  // Simple sort by binId - no complex processing 
  const sortedBinDataFull = [...binDataActual].sort((a, b) => a.binId - b.binId);
  const activeIndex = sortedBinDataFull.findIndex(entry =>entry.isActive);
  
  const [barsExtra, setBarsExtra] = useState(12);

  const handleZoomIn = () => {
    setBarsExtra((prev) =>{ 
      if (prev >=(sortedBinDataFull.length - activeIndex)) {
        return Math.max(activeIndex,sortedBinDataFull.length-activeIndex);
      }
      return prev + 12;
    });
  };

  const handleZoomOut = () => {
    setBarsExtra((prev) =>{
      if (prev <= 12) {
        return 12;
      }
      return prev-12;
    }
  );
  };

  const sortedBinData = sortedBinDataFull.slice(activeIndex-barsExtra,activeIndex+barsExtra);
  const activeDisplayIndex = sortedBinData.findIndex(entry =>entry.isActive);
  console.log(poolAddress,`one bin data: \n,`,sortedBinData[activeDisplayIndex])
  //console.log(poolAddress,`Sorted bin data: \n`,sortedBinData)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            bin distribution chart
          </h4>
        </div>
        <div className="text-xs italic">
          Showing {binData.length} bins with liquidity
        </div>
      </div>

      <div className="grid grid-cols-6 lg:grid-cols-9 grid-rows-16 gap-6 p-4">
      <div className="col-span-1 lg:col-span-5 row-span-10 border border-gray-300 rounded-lg min-w-[400px] h-[180px] p-4">
         {/*my-auto h-full
          
           
         min-h-[100px] max-h-[200px] 
         */}
      <ChartContainer config={chartConfig} className="min-w-xs h-[180px] w-full">
        <BarChart
          accessibilityLayer
          data={sortedBinData}
          margin={{
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="binId"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${formatNumber(value)}`}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                className="min-w-[200px]"
                formatter={(value, name, props) => {
                  const payload = props.payload;
                  const isActive = payload?.isActive;
                  return [
                    <div key="content" className="space-y-1">
                      <div
                        className={`font-semibold ${isActive ? "text-green-600" : ""}`}
                      >
                        Bin {payload?.binId} {isActive ? "(Active)" : ""}
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div>Bin Price: ${payload?.price?.toFixed(6)}</div>
                        <div>
                          Total Liquidity: $
                          {formatNumber(payload?.totalLiquidity)}
                        </div>
                        <div>
                          Base Reserve: {formatNumber(payload?.reserveXAmount)}{" "}
                          tokens
                        </div>
                        <div>
                          Quote Reserve: {formatNumber(payload?.reserveYAmount)}{" "}
                          tokens
                        </div>
                        <div>
                          Base Value: $
                          {formatNumber(
                            payload?.reserveXAmount * payload?.price
                          )}
                        </div>
                        <div>
                          Quote Value: ${formatNumber(payload?.reserveYAmount)}
                        </div>
                      </div>
                    </div>,
                  ];
                }}
              />
            }
          />
          <Bar dataKey="reserveYAmount" minPointSize={2} stackId="binId" radius={2} fill = "#3b82f6"/>
          <Bar dataKey="reserveXAmount" minPointSize={2} stackId="binId" radius={2} fill = "#22c55e"/>
          <ReferenceLine y={0} stroke="#fff" />
          
          {/* fill={entry.isActive ? "#22c55e" : "#3b82f6"} 
          
          <Bar dataKey="reserveXAmount" stackId="binId" radius={2}>
            {sortedBinData.map((entry, index) => (
              <Cell
                key={`cell-X-${index}`}
                fill={entry.isActive ? "#22c55e" : "#f6f03bff"}
              />
            ))}
          </Bar>
          <Bar dataKey="reserveYAmount" stackId="binId" radius={2}>
            {sortedBinData.map((entry, index) => (
              <Cell
                key={`cell-Y-${index}`}
                fill={entry.isActive ? "#3b82f6" : "#7122c5ff"}
              />
            ))}
          </Bar>
          */}
        </BarChart>
      </ChartContainer>
      {
          <div className="flex items-center gap-2">
            {/* Zoom Out Button */}
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Zoom out"
            >
              -
            </button>
            
            {/* Zoom In Button */}
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
      }
      </div>
      </div> 

    </div>
  );
}
