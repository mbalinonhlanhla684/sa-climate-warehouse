import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cloud, Home, TrendingUp, BarChart3, Database, FileText, Info, Thermometer, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

const API_BASE = "http://localhost:8002";

const navItems = [
  { icon: Home, label: "Overview", active: true },
  { icon: TrendingUp, label: "Temperature Trends" },
  { icon: BarChart3, label: "Month Analysis" },
  { icon: Database, label: "Data Quality" },
  { icon: FileText, label: "Reports" },
  { icon: Info, label: "About" },
];

const COLORS = ["#3b82f6", "#10b981", "#22c55e", "#f59e0b", "#ef4444", "#dc2626"];

export default function App() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/stats`).then(r => r.json()),
      fetch(`${API_BASE}/api/temperature`).then(r => r.json()),
      fetch(`${API_BASE}/api/yearly-trend`).then(r => r.json()),
    ]).then(([s, m, y]) => {
      setStats(s);
      setMonthly(m.map(d => ({ ...d, y2019: parseFloat(d.y2019) })));
      setYearly(y);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  // Distribution buckets for donut chart
  const distribution = () => {
    if (!monthly.length) return [];
    const buckets = { "0-1°C": 0, "1-1.5°C": 0, "1.5-2°C": 0, "2-2.5°C": 0, "2.5-3°C": 0 };
    monthly.forEach(m => {
      const v = m.y2019;
      if (v < 1) buckets["0-1°C"]++;
      else if (v < 1.5) buckets["1-1.5°C"]++;
      else if (v < 2) buckets["1.5-2°C"]++;
      else if (v < 2.5) buckets["2-2.5°C"]++;
      else buckets["2.5-3°C"]++;
    });
    const total = monthly.length;
    return Object.entries(buckets).map(([name, count]) => ({
      name, value: Math.round((count / total) * 1000) / 10
    })).filter(d => d.value > 0);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', Inter, sans-serif", background: "#f8fafc" }}>
      
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", color: "white", padding: "24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
          <Cloud size={28} color="#60a5fa" />
          <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>Climate<br/>Warehouse</div>
        </div>
        {navItems.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 8,
            marginBottom: 4, cursor: "pointer", fontSize: 14, fontWeight: item.active ? 700 : 500,
            background: item.active ? "#2563eb" : "transparent", color: item.active ? "white" : "#94a3b8"
          }}>
            <item.icon size={18} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "28px 32px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Temperature Analytics Dashboard</h1>
            <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 15 }}>South Africa Climate Data Warehouse on AWS</p>
          </div>
          <button onClick={fetchData} style={{
            display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0",
            borderRadius: 8, padding: "10px 18px", fontWeight: 600, fontSize: 14, color: "#2563eb", cursor: "pointer"
          }}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            <KPICard icon={<Thermometer size={22} color="#2563eb" />} bg="#dbeafe" label="Average Change" value={`+${stats.average_change}°C`} sub="Across South Africa, 2019" />
            <KPICard icon={<ArrowUp size={22} color="#16a34a" />} bg="#dcfce7" label="Hottest Month" value={`${stats.hottest_month}`} sub={`+${stats.hottest_value}°C recorded`} />
            <KPICard icon={<ArrowDown size={22} color="#7c3aed" />} bg="#ede9fe" label="Coldest Month" value={`${stats.coldest_month}`} sub={`+${stats.coldest_value}°C recorded`} />
            <KPICard icon={<BarChart3 size={22} color="#ea580c" />} bg="#ffedd5" label="Dataset Span" value="1961–2019" sub="59 years tracked" />
          </div>
        )}

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 24 }}>
          
          {/* Line Chart */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Temperature Change Over Time (2000–2019)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} unit="°C" />
                <Tooltip />
                <Line type="monotone" dataKey="change" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Temperature Change by Month (2019)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} unit="°C" />
                <YAxis dataKey="month" type="category" tick={{ fill: "#475569", fontSize: 11 }} width={70} tickFormatter={m => m.slice(0,3)} />
                <Tooltip />
                <Bar dataKey="y2019" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table + Donut Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 24 }}>
          
          {/* Table */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Temperature Change by Month</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                  {["Month", "2000", "2010", "2015", "2017", "2018", "2019"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#94a3b8", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#0f172a" }}>{row.month}</td>
                    <td style={{ padding: "8px 10px", color: "#475569" }}>{row.y2000}</td>
                    <td style={{ padding: "8px 10px", color: "#475569" }}>{row.y2010}</td>
                    <td style={{ padding: "8px 10px", color: "#475569" }}>{row.y2015}</td>
                    <td style={{ padding: "8px 10px", color: "#475569" }}>{row.y2017}</td>
                    <td style={{ padding: "8px 10px", color: "#475569" }}>{row.y2018}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: "#2563eb" }}>{row.y2019}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Donut Chart */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Temperature Change Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={distribution()} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {distribution().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 12 }}>
              {distribution().map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: "#475569" }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "12px 0" }}>
          Data Pipeline: AWS S3 → AWS Glue → Amazon Athena → React Dashboard
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, bg, label, value, sub }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0", display: "flex", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}