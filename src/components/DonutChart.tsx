import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DonutChartProps {
  data: Record<string, number>; // { category: totalAmount }
  type: "income" | "expense";
}

const COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#22C55E"
];

export default function DonutChart({ data, type }: DonutChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="70%"
          dataKey="value"
          labelLine={false} // hilangkan garis label
          label={false} // hilangkan label agar tidak tumpang tindih
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        {/* Legend tampil di bawah untuk mobile */}
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            fontSize: "12px",
            paddingTop: "10px",
          }}
        />

        <Tooltip
          formatter={(value: number) =>
            value.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            })
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
