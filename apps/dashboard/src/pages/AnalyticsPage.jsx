import { useEffect, useState } from "react";
import api from "../lib/axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Building2, BarChart3, Percent } from "lucide-react";
import useAuthStore from "../store/authStore";

// ── Colours ───────────────────────────────────────────────────────────────────
const SEA_COLOR = "#3b82f6";
const SKI_COLOR = "#f59e0b";
const COLORS = [SEA_COLOR, SKI_COLOR, "#8b5cf6", "#22c55e", "#ef4444"];

// ── Section Card ──────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon size={18} className="text-blue-600" />
      </div>
      <div>
        <h2 className="text-slate-800 font-semibold text-sm">{title}</h2>
        {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}:{" "}
          {entry.name.toLowerCase().includes("revenue")
            ? `€${entry.value}`
            : entry.value}
        </p>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState([]);
  const [properties, setProperties] = useState([]);
  const [byBrand, setByBrand] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p, o] = await Promise.all([
          api.get("/analytics/revenue"),
          api.get("/analytics/properties"),
          api.get("/analytics/occupancy"),
        ]);
        setRevenue(r.data);
        setProperties(p.data);
        setOccupancy(o.data);

        // Only fetch brand data if admin
        try {
          const b = await api.get("/analytics/bookings-by-brand");
          setByBrand(b.data);
        } catch {
          // Host doesn't have access — skip silently
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    );

  // Empty state helper
  const isEmpty = (arr) => !arr || arr.length === 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Performance overview across all properties
        </p>
      </div>

      <div className="space-y-6">
        {/* Revenue Over Time */}
        <ChartCard
          title="Revenue Over Time"
          subtitle="Monthly revenue and bookings"
          icon={TrendingUp}
        >
          {isEmpty(revenue) ? (
            <EmptyChart message="No revenue data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SEA_COLOR} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={SEA_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (€)"
                  stroke={SEA_COLOR}
                  fill="url(#revenueGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke={SKI_COLOR}
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Two column row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings by Brand — Pie */}
          {user?.role === "admin" && (
            <ChartCard
              title="Bookings by Brand"
              subtitle="SeaAlure vs SkiAlure"
              icon={BarChart3}
            >
              {isEmpty(byBrand) ? (
                <EmptyChart message="No booking data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={byBrand}
                      dataKey="bookings"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={4}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {byBrand.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        background: "#0f172a",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          )}

          {/* Occupancy Rate */}
          <ChartCard
            title="Occupancy Rate"
            subtitle="Last 30 days per property"
            icon={Percent}
          >
            {isEmpty(occupancy) ? (
              <EmptyChart message="No occupancy data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={occupancy} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Occupancy"]}
                    contentStyle={{
                      background: "#0f172a",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 11,
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="occupancyRate"
                    name="Occupancy %"
                    radius={[0, 6, 6, 0]}
                  >
                    {occupancy.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.brand === "seaAlure" ? SEA_COLOR : SKI_COLOR
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Top Properties */}
        <ChartCard
          title="Top Properties"
          subtitle="By total bookings and revenue"
          icon={Building2}
        >
          {isEmpty(properties) ? (
            <EmptyChart message="No property data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={properties}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  interval={0}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `€${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  yAxisId="left"
                  dataKey="totalRevenue"
                  name="Revenue (€)"
                  fill={SEA_COLOR}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="totalBookings"
                  name="Bookings"
                  fill={SKI_COLOR}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyChart = ({ message }) => (
  <div className="h-48 flex items-center justify-center">
    <p className="text-slate-400 text-sm">
      {message} — data will appear after bookings are paid.
    </p>
  </div>
);
