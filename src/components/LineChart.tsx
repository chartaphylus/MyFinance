import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: Record<string, { income: number; expense: number; balance: number }>;
}

const formatRupiah = (value: number) =>
  "Rp " + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function FinancialLineChart({ data }: LineChartProps) {
  const chartData = Object.keys(data).map((m) => ({
    month: new Date(m + "-01").toLocaleDateString("id-ID", { month: "short" }),
    income: data[m].income,
    expense: data[m].expense,
    balance: data[m].balance,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(val) => formatRupiah(val)} />
          <Tooltip
            formatter={(value: number) => formatRupiah(value)}
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              border: "none",
              color: "white",
            }}
          />
          <Legend />

          <Line
            type="monotone"
            dataKey="income"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#06b6d4"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
