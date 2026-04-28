import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface Props {
  prices: number[];
  strikePrice: number;
  spotPrice: number;
}

const PriceDistributionChart = ({ prices, strikePrice, spotPrice }: Props) => {
  const chartData = useMemo(() => {
    const numBins = 60;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const binWidth = (max - min) / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count: 0,
    }));

    prices.forEach((p) => {
      const idx = Math.min(Math.floor((p - min) / binWidth), numBins - 1);
      if (idx >= 0) bins[idx].count++;
    });

    return bins.map((b) => ({
      price: ((b.binStart + b.binEnd) / 2).toFixed(1),
      count: b.count,
      priceMid: (b.binStart + b.binEnd) / 2,
    }));
  }, [prices]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap={0} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
          <XAxis
            dataKey="price"
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(220, 15%, 16%)" }}
            interval={Math.floor(chartData.length / 8)}
            label={{ value: "Simulated Price ($)", position: "insideBottom", offset: -5, fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(220, 15%, 16%)" }}
            label={{ value: "Frequency", angle: -90, position: "insideLeft", fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 8%)",
              border: "1px solid hsl(220, 15%, 16%)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(200, 20%, 92%)",
            }}
            labelFormatter={(val) => `Price: $${val}`}
            formatter={(val: number) => [val, "Count"]}
          />
          <ReferenceLine
            x={chartData.reduce((closest, d) =>
              Math.abs(parseFloat(d.price) - strikePrice) < Math.abs(parseFloat(closest.price) - strikePrice) ? d : closest
            ).price}
            stroke="hsl(0, 84%, 60%)"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{ value: "Strike", position: "top", fill: "hsl(0, 84%, 60%)", fontSize: 11 }}
          />
          <ReferenceLine
            x={chartData.reduce((closest, d) =>
              Math.abs(parseFloat(d.price) - spotPrice) < Math.abs(parseFloat(closest.price) - spotPrice) ? d : closest
            ).price}
            stroke="hsl(175, 85%, 50%)"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{ value: "Spot", position: "top", fill: "hsl(175, 85%, 50%)", fontSize: 11 }}
          />
          <Bar dataKey="count" fill="hsl(175, 85%, 50%)" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceDistributionChart;
