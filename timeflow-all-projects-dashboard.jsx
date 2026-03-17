import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  ComposedChart, Line, ReferenceLine, Area, AreaChart,
  Treemap
} from "recharts";

// ── Light palette ──
const C = {
  bg: "#ffffff", card: "#ffffff", cardAlt: "#f9fafb",
  border: "#e5e7eb", borderLight: "#f3f4f6",
  text: "#111827", sub: "#374151", dim: "#6b7280", dimLight: "#9ca3af",
  accent: "#2563eb", accentBg: "#eff6ff", accentLight: "#93c5fd",
  purple: "#7c3aed", purpleBg: "#f5f3ff",
  green: "#059669", greenBg: "#ecfdf5",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  pink: "#db2777", pinkBg: "#fdf2f8",
  teal: "#0d9488", tealBg: "#f0fdfa",
  orange: "#ea580c",
  slate: "#475569",
};

// Project colors
const PROJ_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0d9488", "#db2777"];
const CAT_COLORS = { "Oficina": "#2563eb", "Planta": "#d97706", "Taller": "#059669" };

// ══════════════════════════════════════════════════════════════
// MOCK DATA: Multiple projects (MANGO is real, rest simulated)
// ══════════════════════════════════════════════════════════════
const PROJECTS = [
  { id: "3025", name: "MANGO", horas: 1950, fichajes: 323, empleados: 8, dias: 22, km: 3777, dietas: 45, cats: { Oficina: 1307, Planta: 428, Taller: 215 }, status: "En curso", distancia: 45.5 },
  { id: "3018", name: "ZARA HOME", horas: 1420, fichajes: 245, empleados: 6, dias: 22, km: 2180, dietas: 32, cats: { Oficina: 680, Planta: 520, Taller: 220 }, status: "En curso", distancia: 62 },
  { id: "3031", name: "PRIMARK BCN", horas: 890, fichajes: 148, empleados: 5, dias: 18, km: 4200, dietas: 58, cats: { Oficina: 310, Planta: 480, Taller: 100 }, status: "En curso", distancia: 120 },
  { id: "3012", name: "DECATHLON", horas: 640, fichajes: 98, empleados: 4, dias: 15, km: 980, dietas: 14, cats: { Oficina: 420, Planta: 140, Taller: 80 }, status: "Cerrado", distancia: 35 },
  { id: "3029", name: "H&M LOGISTIC", horas: 520, fichajes: 87, empleados: 4, dias: 14, km: 1560, dietas: 22, cats: { Oficina: 180, Planta: 260, Taller: 80 }, status: "En curso", distancia: 55 },
  { id: "3033", name: "INDITEX HQ", horas: 380, fichajes: 62, empleados: 3, dias: 12, km: 0, dietas: 0, cats: { Oficina: 340, Planta: 0, Taller: 40 }, status: "Inicio", distancia: 0 },
];

const TOTAL_H = PROJECTS.reduce((s, p) => s + p.horas, 0);
const TOTAL_FJ = PROJECTS.reduce((s, p) => s + p.fichajes, 0);
const TOTAL_KM = PROJECTS.reduce((s, p) => s + p.km, 0);
const TOTAL_DIETAS = PROJECTS.reduce((s, p) => s + p.dietas, 0);

// Employee hours across projects
const EMP_PROJECTS = [
  { emp: "Gemma", "MANGO": 308, "ZARA HOME": 120, "INDITEX HQ": 95 },
  { emp: "Ernesto Soriano", "MANGO": 297, "DECATHLON": 140 },
  { emp: "Pablo Cabaleiro", "MANGO": 279, "PRIMARK BCN": 180, "H&M LOGISTIC": 60 },
  { emp: "CATHAYSA", "MANGO": 257, "ZARA HOME": 210, "PRIMARK BCN": 120 },
  { emp: "Arnau", "MANGO": 210, "ZARA HOME": 180, "H&M LOGISTIC": 160 },
  { emp: "Antonio Merino", "MANGO": 209, "INDITEX HQ": 165, "DECATHLON": 80 },
  { emp: "Kevin Soriano", "MANGO": 199, "ZARA HOME": 160, "INDITEX HQ": 120 },
  { emp: "Antonio Silva", "MANGO": 191, "PRIMARK BCN": 230, "H&M LOGISTIC": 140, "DECATHLON": 80 },
  { emp: "Luis Fernández", "ZARA HOME": 280, "PRIMARK BCN": 160, "H&M LOGISTIC": 160 },
  { emp: "Sara Molina", "ZARA HOME": 190, "DECATHLON": 200, "PRIMARK BCN": 200 },
];

// Monthly trend (Jan-Mar 2026, all projects combined)
const MONTHLY_TREND = [
  { mes: "Ene 26", MANGO: 1680, "ZARA HOME": 1200, "PRIMARK BCN": 420, DECATHLON: 580, "H&M LOGISTIC": 380, "INDITEX HQ": 0 },
  { mes: "Feb 26", MANGO: 1820, "ZARA HOME": 1350, "PRIMARK BCN": 680, DECATHLON: 640, "H&M LOGISTIC": 460, "INDITEX HQ": 120 },
  { mes: "Mar 26", MANGO: 1950, "ZARA HOME": 1420, "PRIMARK BCN": 890, DECATHLON: 640, "H&M LOGISTIC": 520, "INDITEX HQ": 380 },
];

// Weekly trend March (all projects)
const WEEKLY_ALL = [
  { sem: "S10", MANGO: 376, "ZARA HOME": 280, "PRIMARK BCN": 165, DECATHLON: 130, "H&M LOGISTIC": 95, "INDITEX HQ": 60 },
  { sem: "S11", MANGO: 541, "ZARA HOME": 380, "PRIMARK BCN": 240, DECATHLON: 180, "H&M LOGISTIC": 145, "INDITEX HQ": 90 },
  { sem: "S12", MANGO: 403, "ZARA HOME": 310, "PRIMARK BCN": 195, DECATHLON: 140, "H&M LOGISTIC": 110, "INDITEX HQ": 85 },
  { sem: "S13", MANGO: 432, "ZARA HOME": 290, "PRIMARK BCN": 190, DECATHLON: 120, "H&M LOGISTIC": 105, "INDITEX HQ": 95 },
  { sem: "S14", MANGO: 198, "ZARA HOME": 160, "PRIMARK BCN": 100, DECATHLON: 70, "H&M LOGISTIC": 65, "INDITEX HQ": 50 },
];

// Category global
const GLOBAL_CATS = [
  { name: "Oficina/Diseño", value: PROJECTS.reduce((s, p) => s + p.cats.Oficina, 0) },
  { name: "Planta Cliente", value: PROJECTS.reduce((s, p) => s + p.cats.Planta, 0) },
  { name: "Taller", value: PROJECTS.reduce((s, p) => s + p.cats.Taller, 0) },
];

// Cost comparison
const COST_DATA = PROJECTS.filter(p => p.km > 0 || p.dietas > 0).map(p => ({
  name: p.name,
  kmCoste: Math.round(p.km * 0.19),
  dietaCoste: Math.round(p.dietas * 37.4),
  total: Math.round(p.km * 0.19 + p.dietas * 37.4),
}));

// Efficiency: h/empleado/día
const EFFICIENCY = PROJECTS.map(p => ({
  name: p.name,
  hPorEmpDia: parseFloat((p.horas / p.empleados / p.dias).toFixed(1)),
  hPorDia: parseFloat((p.horas / p.dias).toFixed(0)),
  fjPorDia: parseFloat((p.fichajes / p.dias).toFixed(1)),
}));

// ── Helpers ──
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ color: C.text, fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</div>
      {payload.filter(p => p.value > 0).map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, margin: "3px 0", display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>{p.name}</span>
          <b>{typeof p.value === "number" ? p.value.toLocaleString("es-ES") : p.value}</b>
        </div>
      ))}
    </div>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 20, ...style }}>{children}</div>
);

const Section = ({ num, title, sub, badge }) => (
  <div style={{ marginBottom: 14, marginTop: 28 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ background: C.text, color: "#fff", fontWeight: 800, fontSize: 10, padding: "3px 10px", borderRadius: 6, letterSpacing: 1 }}>{num}</span>
      <span style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>{title}</span>
      {badge && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentBg, padding: "3px 10px", borderRadius: 10 }}>{badge}</span>}
    </div>
    <p style={{ color: C.dim, fontSize: 12, margin: "4px 0 0 0", lineHeight: 1.5 }}>{sub}</p>
  </div>
);

const KPI = ({ label, val, unit, color, bg, sub, icon }) => (
  <div style={{ background: bg || C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", flex: 1, minWidth: 150 }}>
    <div style={{ fontSize: 10, color: C.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{icon} {label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <span style={{ fontSize: 30, fontWeight: 800, color: color || C.text, letterSpacing: "-0.03em" }}>{val}</span>
      <span style={{ fontSize: 13, color: C.dim }}>{unit}</span>
    </div>
    {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    "En curso": { color: C.green, bg: C.greenBg },
    "Cerrado": { color: C.dim, bg: C.borderLight },
    "Inicio": { color: C.accent, bg: C.accentBg },
  };
  const s = map[status] || map["En curso"];
  return <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 10 }}>{status}</span>;
};

const projNames = PROJECTS.map(p => p.name);

export default function AllProjectsDashboard() {
  const [hoveredProj, setHoveredProj] = useState(null);

  const projBarData = useMemo(() =>
    PROJECTS.map(p => ({
      name: p.name, id: p.id,
      Oficina: p.cats.Oficina, Planta: p.cats.Planta, Taller: p.cats.Taller,
      total: p.horas,
    })).sort((a, b) => b.total - a.total),
  []);

  const empBarData = useMemo(() => {
    return EMP_PROJECTS.map(e => {
      const total = Object.entries(e).filter(([k]) => k !== "emp").reduce((s, [, v]) => s + v, 0);
      return { ...e, total };
    }).sort((a, b) => b.total - a.total);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "20px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
              <span style={{ color: C.accent }}>Time</span><span>Flow</span>
              <span style={{ color: C.dim, fontSize: 13, fontWeight: 500, marginLeft: 12 }}>Panel Global</span>
            </h1>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>
              Vista consolidada · <b>{PROJECTS.length} proyectos</b> · Marzo 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PROJECTS.map(p => (
              <div key={p.id} onMouseEnter={() => setHoveredProj(p.id)} onMouseLeave={() => setHoveredProj(null)}
                style={{
                  padding: "6px 12px", borderRadius: 8, cursor: "default", transition: "all 0.2s",
                  background: hoveredProj === p.id ? C.accentBg : "transparent",
                  border: `1px solid ${hoveredProj === p.id ? C.accentLight : C.border}`,
                }}>
                <div style={{ fontSize: 10, color: C.dim, fontWeight: 600 }}>[{p.id}]</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <KPI label="Horas Totales" val={TOTAL_H.toLocaleString("es-ES")} unit="h" color={C.accent} bg={C.accentBg} icon="⏱" sub="Todos los proyectos" />
          <KPI label="Fichajes" val={TOTAL_FJ.toLocaleString("es-ES")} unit="" color={C.purple} bg={C.purpleBg} icon="📋" sub={`Ø ${(TOTAL_FJ / 22).toFixed(0)}/día`} />
          <KPI label="Proyectos" val={PROJECTS.length} unit="" color={C.green} bg={C.greenBg} icon="📁" sub={`${PROJECTS.filter(p => p.status === "En curso").length} en curso`} />
          <KPI label="KM Totales" val={TOTAL_KM.toLocaleString("es-ES")} unit="km" color={C.amber} bg={C.amberBg} icon="🚗" sub={`${Math.round(TOTAL_KM * 0.19).toLocaleString("es-ES")}€ reembolso`} />
          <KPI label="Dietas" val={TOTAL_DIETAS} unit="" color={C.pink} bg={C.pinkBg} icon="🍽" sub={`${Math.round(TOTAL_DIETAS * 37.4).toLocaleString("es-ES")}€ coste`} />
        </div>

        {/* 01: PROJECT RANKING */}
        <Section num="01" title="Ranking de Proyectos por Horas" sub="Barras apiladas por categoría. Comparar carga y composición de cada proyecto de un vistazo." badge="PRINCIPAL" />
        <Card>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={projBarData} layout="vertical" barCategoryGap="16%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} horizontal={false} />
              <XAxis type="number" stroke={C.dim} fontSize={10} unit="h" />
              <YAxis type="category" dataKey="name" stroke={C.sub} fontSize={12} width={110} fontWeight={600} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="Oficina" stackId="a" fill={CAT_COLORS.Oficina} name="Oficina/Diseño" fillOpacity={0.75} />
              <Bar dataKey="Planta" stackId="a" fill={CAT_COLORS.Planta} name="Planta Cliente" fillOpacity={0.75} />
              <Bar dataKey="Taller" stackId="a" fill={CAT_COLORS.Taller} name="Taller" fillOpacity={0.75} radius={[0, 6, 6, 0]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 02: MONTHLY EVOLUTION */}
        <Section num="02" title="Evolución Mensual por Proyecto" sub="Área apilada trimestral. Ver qué proyectos crecen, cuáles estabilizan y cuáles arrancan." badge="TENDENCIA" />
        <Card>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                {projNames.map((n, i) => (
                  <linearGradient key={n} id={`gp${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PROJ_COLORS[i]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={PROJ_COLORS[i]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="mes" stroke={C.dim} fontSize={11} />
              <YAxis stroke={C.dim} fontSize={10} unit="h" />
              <Tooltip content={<Tip />} />
              {projNames.map((n, i) => (
                <Area key={n} type="monotone" dataKey={n} stackId="1" stroke={PROJ_COLORS[i]} fill={`url(#gp${i})`} strokeWidth={2} name={n} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 03: EMPLOYEE × PROJECT MATRIX */}
        <Section num="03" title="Carga por Empleado × Proyecto" sub="Quién trabaja en qué. Detectar empleados muy concentrados en un proyecto o muy dispersos." badge="RECURSOS" />
        <Card>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={empBarData} layout="vertical" barCategoryGap="12%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} horizontal={false} />
              <XAxis type="number" stroke={C.dim} fontSize={10} unit="h" />
              <YAxis type="category" dataKey="emp" stroke={C.sub} fontSize={11} width={130} />
              <Tooltip content={<Tip />} />
              {projNames.map((n, i) => (
                <Bar key={n} dataKey={n} stackId="a" fill={PROJ_COLORS[i]} name={n} fillOpacity={0.75}
                  radius={i === projNames.length - 1 ? [0, 5, 5, 0] : undefined} />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ROW: Global categories + Efficiency */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* 04: GLOBAL CATEGORY */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <Section num="04" title="Distribución Global por Categoría" sub="¿Dónde va el esfuerzo de la empresa?" />
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap" }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={GLOBAL_CATS} cx="50%" cy="50%" innerRadius={48} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                      {GLOBAL_CATS.map((c, i) => <Cell key={i} fill={Object.values(CAT_COLORS)[i]} fillOpacity={0.8} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {GLOBAL_CATS.map((c, i) => {
                    const pct = Math.round(c.value / TOTAL_H * 100);
                    const color = Object.values(CAT_COLORS)[i];
                    return (
                      <div key={c.name}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                        </div>
                        <div style={{ marginLeft: 20, marginTop: 3 }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color }}>{c.value.toLocaleString("es-ES")}h</span>
                          <span style={{ fontSize: 12, color: C.dim, marginLeft: 6 }}>({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* 05: EFFICIENCY */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <Section num="05" title="Eficiencia: Horas por Empleado por Día" sub="¿Qué proyecto tiene más carga relativa por persona?" />
            <Card>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={EFFICIENCY.sort((a, b) => b.hPorEmpDia - a.hPorEmpDia)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis dataKey="name" stroke={C.dim} fontSize={10} />
                  <YAxis stroke={C.dim} fontSize={10} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="hPorEmpDia" name="h/empleado/día" fill={C.accent} fillOpacity={0.65} radius={[6, 6, 0, 0]} />
                  <ReferenceLine y={8} stroke={C.red} strokeDasharray="5 3" label={{ value: "Jornada 8h", fill: C.red, fontSize: 9 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* 06: WEEKLY STACKED */}
        <Section num="06" title="Carga Semanal por Proyecto" sub="Distribución del esfuerzo semana a semana. Detectar cómo evoluciona cada proyecto dentro del mes." />
        <Card>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={WEEKLY_ALL} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="sem" stroke={C.dim} fontSize={11} />
              <YAxis stroke={C.dim} fontSize={10} unit="h" />
              <Tooltip content={<Tip />} />
              {projNames.map((n, i) => (
                <Bar key={n} dataKey={n} stackId="a" fill={PROJ_COLORS[i]} name={n} fillOpacity={0.75} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 07: COST COMPARISON */}
        <Section num="07" title="Coste Logístico por Proyecto" sub="KMs (reembolso) + Dietas. Qué proyectos generan más gasto en desplazamiento." badge="COSTE" />
        <Card>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={COST_DATA.sort((a, b) => b.total - a.total)} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="name" stroke={C.dim} fontSize={11} />
              <YAxis stroke={C.dim} fontSize={10} unit="€" />
              <Tooltip content={<Tip />} />
              <Bar dataKey="kmCoste" stackId="a" fill={C.amber} name="Reembolso KM" fillOpacity={0.7} />
              <Bar dataKey="dietaCoste" stackId="a" fill={C.green} name="Coste Dietas" fillOpacity={0.7} radius={[5, 5, 0, 0]} />
              <Line type="monotone" dataKey="total" name="Total €" stroke={C.red} strokeWidth={2.5} dot={{ r: 4, fill: C.red }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, padding: "12px 16px", background: C.cardAlt, borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.dim, fontWeight: 600, textTransform: "uppercase" }}>Total Reembolso KM</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.amber }}>{Math.round(TOTAL_KM * 0.19).toLocaleString("es-ES")}€</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.dim, fontWeight: 600, textTransform: "uppercase" }}>Total Dietas</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{Math.round(TOTAL_DIETAS * 37.4).toLocaleString("es-ES")}€</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.dim, fontWeight: 600, textTransform: "uppercase" }}>Coste Logístico Total</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>{Math.round(TOTAL_KM * 0.19 + TOTAL_DIETAS * 37.4).toLocaleString("es-ES")}€</div>
            </div>
          </div>
        </Card>

        {/* 08: PROJECT SUMMARY TABLE */}
        <Section num="08" title="Tabla Resumen de Proyectos" sub="Métricas consolidadas de cada proyecto en una vista densa." />
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {["Proyecto", "Estado", "Horas", "% Oficina", "% Planta", "% Taller", "Empleados", "KM", "Dietas", "Coste Log."].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: C.dim, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTS.sort((a, b) => b.horas - a.horas).map((p, i) => {
                  const pOfi = Math.round(p.cats.Oficina / p.horas * 100);
                  const pPla = Math.round(p.cats.Planta / p.horas * 100);
                  const pTal = Math.round(p.cats.Taller / p.horas * 100);
                  const coste = Math.round(p.km * 0.19 + p.dietas * 37.4);
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? "#fff" : C.cardAlt }}>
                      <td style={{ padding: "12px", fontWeight: 700 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 4, height: 28, borderRadius: 2, background: PROJ_COLORS[i] }} />
                          <div>
                            <div>[{p.id}] {p.name}</div>
                            <div style={{ fontSize: 10, color: C.dim }}>{p.distancia > 0 ? `${p.distancia} km del taller` : "Sin desplazamiento"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}><StatusBadge status={p.status} /></td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: C.borderLight, borderRadius: 3 }}>
                            <div style={{ width: `${p.horas / 1950 * 100}%`, height: "100%", background: PROJ_COLORS[i], borderRadius: 3 }} />
                          </div>
                          <b>{p.horas.toLocaleString("es-ES")}h</b>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}><span style={{ color: CAT_COLORS.Oficina, fontWeight: 600 }}>{pOfi}%</span></td>
                      <td style={{ padding: "12px" }}><span style={{ color: CAT_COLORS.Planta, fontWeight: 600 }}>{pPla}%</span></td>
                      <td style={{ padding: "12px" }}><span style={{ color: CAT_COLORS.Taller, fontWeight: 600 }}>{pTal}%</span></td>
                      <td style={{ padding: "12px", fontWeight: 600 }}>{p.empleados}</td>
                      <td style={{ padding: "12px", color: p.km > 0 ? C.amber : C.dimLight }}>{p.km > 0 ? `${p.km.toLocaleString("es-ES")} km` : "—"}</td>
                      <td style={{ padding: "12px", color: p.dietas > 0 ? C.green : C.dimLight }}>{p.dietas > 0 ? p.dietas : "—"}</td>
                      <td style={{ padding: "12px" }}>
                        {coste > 0 ? (
                          <span style={{
                            fontWeight: 700, fontSize: 12,
                            color: coste > 2000 ? C.red : coste > 1000 ? C.amber : C.green,
                            background: coste > 2000 ? C.redBg : coste > 1000 ? C.amberBg : C.greenBg,
                            padding: "3px 10px", borderRadius: 8,
                          }}>{coste.toLocaleString("es-ES")}€</span>
                        ) : <span style={{ color: C.dimLight }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.text}`, background: C.cardAlt }}>
                  <td style={{ padding: "12px", fontWeight: 800, fontSize: 13 }} colSpan={2}>TOTAL</td>
                  <td style={{ padding: "12px", fontWeight: 800 }}>{TOTAL_H.toLocaleString("es-ES")}h</td>
                  <td colSpan={3}></td>
                  <td style={{ padding: "12px", fontWeight: 700 }}>10 únicos</td>
                  <td style={{ padding: "12px", fontWeight: 700, color: C.amber }}>{TOTAL_KM.toLocaleString("es-ES")} km</td>
                  <td style={{ padding: "12px", fontWeight: 700, color: C.green }}>{TOTAL_DIETAS}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontWeight: 800, color: C.red, background: C.redBg, padding: "4px 12px", borderRadius: 8, fontSize: 13 }}>
                      {Math.round(TOTAL_KM * 0.19 + TOTAL_DIETAS * 37.4).toLocaleString("es-ES")}€
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
