import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  ComposedChart, Line, ReferenceLine,
  Treemap
} from "recharts";

// ── Palette ──
const C = {
  bg: "#0a0e1a", card: "#0f1628", cardAlt: "#131b30", border: "#1c2744",
  text: "#d8deeb", dim: "#5a6b8a", accent: "#3b9eff", accent2: "#7c6cff",
  green: "#22c997", amber: "#f5a623", pink: "#e8577a", red: "#ef4455",
  orange: "#fb923c", teal: "#2dd4bf",
  catOficina: "#3b9eff", catPlanta: "#f5a623", catTaller: "#22c997",
};

// ── RAW DATA from Excel: Proyecto 3025 - MANGO, Marzo 2026 ──
const HEATMAP_RAW = [{"n":"Antonio Merino","d":"03-02","h":10},{"n":"Antonio Merino","d":"03-03","h":4},{"n":"Antonio Merino","d":"03-04","h":6},{"n":"Antonio Merino","d":"03-05","h":10},{"n":"Antonio Merino","d":"03-06","h":10},{"n":"Antonio Merino","d":"03-09","h":8},{"n":"Antonio Merino","d":"03-10","h":20},{"n":"Antonio Merino","d":"03-11","h":24},{"n":"Antonio Merino","d":"03-13","h":20},{"n":"Antonio Merino","d":"03-16","h":10},{"n":"Antonio Merino","d":"03-17","h":4},{"n":"Antonio Merino","d":"03-18","h":4},{"n":"Antonio Merino","d":"03-19","h":18},{"n":"Antonio Merino","d":"03-20","h":8},{"n":"Antonio Merino","d":"03-24","h":16},{"n":"Antonio Merino","d":"03-25","h":2},{"n":"Antonio Merino","d":"03-26","h":23},{"n":"Antonio Merino","d":"03-27","h":8},{"n":"Antonio Merino","d":"03-31","h":4},{"n":"Antonio Silva","d":"03-03","h":2},{"n":"Antonio Silva","d":"03-04","h":8},{"n":"Antonio Silva","d":"03-05","h":2},{"n":"Antonio Silva","d":"03-06","h":2},{"n":"Antonio Silva","d":"03-09","h":28},{"n":"Antonio Silva","d":"03-10","h":2},{"n":"Antonio Silva","d":"03-11","h":12},{"n":"Antonio Silva","d":"03-12","h":8},{"n":"Antonio Silva","d":"03-13","h":12},{"n":"Antonio Silva","d":"03-16","h":8},{"n":"Antonio Silva","d":"03-18","h":8},{"n":"Antonio Silva","d":"03-19","h":8},{"n":"Antonio Silva","d":"03-20","h":21},{"n":"Antonio Silva","d":"03-23","h":14},{"n":"Antonio Silva","d":"03-24","h":4},{"n":"Antonio Silva","d":"03-25","h":16},{"n":"Antonio Silva","d":"03-26","h":18},{"n":"Antonio Silva","d":"03-27","h":4},{"n":"Antonio Silva","d":"03-30","h":4},{"n":"Antonio Silva","d":"03-31","h":10},{"n":"Arnau","d":"03-03","h":12},{"n":"Arnau","d":"03-04","h":8},{"n":"Arnau","d":"03-05","h":2},{"n":"Arnau","d":"03-06","h":2},{"n":"Arnau","d":"03-09","h":8},{"n":"Arnau","d":"03-11","h":20},{"n":"Arnau","d":"03-12","h":18},{"n":"Arnau","d":"03-13","h":12},{"n":"Arnau","d":"03-16","h":2},{"n":"Arnau","d":"03-17","h":14},{"n":"Arnau","d":"03-18","h":8},{"n":"Arnau","d":"03-19","h":14},{"n":"Arnau","d":"03-20","h":18},{"n":"Arnau","d":"03-23","h":10},{"n":"Arnau","d":"03-24","h":20},{"n":"Arnau","d":"03-25","h":8},{"n":"Arnau","d":"03-27","h":24},{"n":"Arnau","d":"03-31","h":10},{"n":"CATHAYSA","d":"03-02","h":8},{"n":"CATHAYSA","d":"03-03","h":16},{"n":"CATHAYSA","d":"03-04","h":2},{"n":"CATHAYSA","d":"03-05","h":18},{"n":"CATHAYSA","d":"03-06","h":14},{"n":"CATHAYSA","d":"03-09","h":6},{"n":"CATHAYSA","d":"03-10","h":8},{"n":"CATHAYSA","d":"03-11","h":12},{"n":"CATHAYSA","d":"03-12","h":16},{"n":"CATHAYSA","d":"03-13","h":12},{"n":"CATHAYSA","d":"03-16","h":10},{"n":"CATHAYSA","d":"03-17","h":11},{"n":"CATHAYSA","d":"03-18","h":22},{"n":"CATHAYSA","d":"03-19","h":12},{"n":"CATHAYSA","d":"03-20","h":4},{"n":"CATHAYSA","d":"03-23","h":16},{"n":"CATHAYSA","d":"03-24","h":9},{"n":"CATHAYSA","d":"03-25","h":18},{"n":"CATHAYSA","d":"03-27","h":14},{"n":"CATHAYSA","d":"03-30","h":23},{"n":"CATHAYSA","d":"03-31","h":6},{"n":"Ernesto Soriano","d":"03-02","h":8},{"n":"Ernesto Soriano","d":"03-03","h":8},{"n":"Ernesto Soriano","d":"03-05","h":34},{"n":"Ernesto Soriano","d":"03-06","h":8},{"n":"Ernesto Soriano","d":"03-09","h":54},{"n":"Ernesto Soriano","d":"03-10","h":18},{"n":"Ernesto Soriano","d":"03-11","h":6},{"n":"Ernesto Soriano","d":"03-12","h":14},{"n":"Ernesto Soriano","d":"03-13","h":5},{"n":"Ernesto Soriano","d":"03-16","h":10},{"n":"Ernesto Soriano","d":"03-17","h":6},{"n":"Ernesto Soriano","d":"03-18","h":8},{"n":"Ernesto Soriano","d":"03-19","h":26},{"n":"Ernesto Soriano","d":"03-20","h":2},{"n":"Ernesto Soriano","d":"03-23","h":12},{"n":"Ernesto Soriano","d":"03-24","h":2},{"n":"Ernesto Soriano","d":"03-25","h":20},{"n":"Ernesto Soriano","d":"03-26","h":8},{"n":"Ernesto Soriano","d":"03-27","h":14},{"n":"Ernesto Soriano","d":"03-30","h":18},{"n":"Ernesto Soriano","d":"03-31","h":16},{"n":"Gemma","d":"03-02","h":12},{"n":"Gemma","d":"03-03","h":4},{"n":"Gemma","d":"03-04","h":14},{"n":"Gemma","d":"03-05","h":32},{"n":"Gemma","d":"03-06","h":10},{"n":"Gemma","d":"03-10","h":16},{"n":"Gemma","d":"03-11","h":20},{"n":"Gemma","d":"03-12","h":6},{"n":"Gemma","d":"03-13","h":40},{"n":"Gemma","d":"03-16","h":10},{"n":"Gemma","d":"03-17","h":12},{"n":"Gemma","d":"03-18","h":4},{"n":"Gemma","d":"03-19","h":18},{"n":"Gemma","d":"03-20","h":12},{"n":"Gemma","d":"03-23","h":12},{"n":"Gemma","d":"03-24","h":8},{"n":"Gemma","d":"03-25","h":2},{"n":"Gemma","d":"03-26","h":10},{"n":"Gemma","d":"03-27","h":18},{"n":"Gemma","d":"03-30","h":18},{"n":"Gemma","d":"03-31","h":30},{"n":"Kevin Soriano","d":"03-02","h":12},{"n":"Kevin Soriano","d":"03-03","h":12},{"n":"Kevin Soriano","d":"03-04","h":4},{"n":"Kevin Soriano","d":"03-05","h":8},{"n":"Kevin Soriano","d":"03-06","h":4},{"n":"Kevin Soriano","d":"03-09","h":8},{"n":"Kevin Soriano","d":"03-10","h":16},{"n":"Kevin Soriano","d":"03-11","h":6},{"n":"Kevin Soriano","d":"03-13","h":10},{"n":"Kevin Soriano","d":"03-16","h":6},{"n":"Kevin Soriano","d":"03-17","h":8},{"n":"Kevin Soriano","d":"03-18","h":11},{"n":"Kevin Soriano","d":"03-19","h":8},{"n":"Kevin Soriano","d":"03-20","h":6},{"n":"Kevin Soriano","d":"03-23","h":12},{"n":"Kevin Soriano","d":"03-24","h":10},{"n":"Kevin Soriano","d":"03-25","h":8},{"n":"Kevin Soriano","d":"03-26","h":16},{"n":"Kevin Soriano","d":"03-27","h":12},{"n":"Kevin Soriano","d":"03-30","h":8},{"n":"Kevin Soriano","d":"03-31","h":14},{"n":"Pablo Cabaleiro","d":"03-02","h":16},{"n":"Pablo Cabaleiro","d":"03-03","h":6},{"n":"Pablo Cabaleiro","d":"03-04","h":14},{"n":"Pablo Cabaleiro","d":"03-05","h":16},{"n":"Pablo Cabaleiro","d":"03-06","h":18},{"n":"Pablo Cabaleiro","d":"03-09","h":36},{"n":"Pablo Cabaleiro","d":"03-10","h":20},{"n":"Pablo Cabaleiro","d":"03-11","h":8},{"n":"Pablo Cabaleiro","d":"03-13","h":14},{"n":"Pablo Cabaleiro","d":"03-16","h":18},{"n":"Pablo Cabaleiro","d":"03-17","h":22},{"n":"Pablo Cabaleiro","d":"03-18","h":4},{"n":"Pablo Cabaleiro","d":"03-20","h":8},{"n":"Pablo Cabaleiro","d":"03-24","h":8},{"n":"Pablo Cabaleiro","d":"03-25","h":18},{"n":"Pablo Cabaleiro","d":"03-26","h":13},{"n":"Pablo Cabaleiro","d":"03-27","h":2},{"n":"Pablo Cabaleiro","d":"03-30","h":12},{"n":"Pablo Cabaleiro","d":"03-31","h":26}];

const DAILY_CAT = [{"f":"03-02","ofi":42,"pla":16,"tal":8},{"f":"03-03","ofi":32,"pla":14,"tal":18},{"f":"03-04","ofi":26,"pla":30,"tal":0},{"f":"03-05","ofi":94,"pla":26,"tal":2},{"f":"03-06","ofi":52,"pla":12,"tal":4},{"f":"03-09","ofi":116,"pla":26,"tal":6},{"f":"03-10","ofi":88,"pla":8,"tal":4},{"f":"03-11","ofi":74,"pla":16,"tal":18},{"f":"03-12","ofi":28,"pla":18,"tal":16},{"f":"03-13","ofi":89,"pla":12,"tal":24},{"f":"03-16","ofi":50,"pla":16,"tal":8},{"f":"03-17","ofi":48,"pla":14,"tal":15},{"f":"03-18","ofi":31,"pla":18,"tal":20},{"f":"03-19","ofi":70,"pla":34,"tal":0},{"f":"03-20","ofi":39,"pla":40,"tal":0},{"f":"03-23","ofi":44,"pla":24,"tal":8},{"f":"03-24","ofi":44,"pla":24,"tal":9},{"f":"03-25","ofi":48,"pla":38,"tal":6},{"f":"03-26","ofi":88,"pla":0,"tal":0},{"f":"03-27","ofi":54,"pla":10,"tal":32},{"f":"03-30","ofi":50,"pla":24,"tal":9},{"f":"03-31","ofi":100,"pla":8,"tal":8}];

const EMP_HOURS = [{"n":"Antonio Silva","h":191},{"n":"Kevin Soriano","h":199},{"n":"Antonio Merino","h":209},{"n":"Arnau","h":210},{"n":"CATHAYSA","h":257},{"n":"Pablo Cabaleiro","h":279},{"n":"Ernesto Soriano","h":297},{"n":"Gemma","h":308}];

const TASK_HOURS = [{"l":"121 - Gest. Téc. Eléctrica","h":274},{"l":"122 - Diseño Eléctrico","h":233},{"l":"111 - Gest. Téc. Mecánica","h":182},{"l":"113 - Diseño 2D","h":106},{"l":"421 - Montaje Elec. PeM","h":106},{"l":"422 - Montaje Flu. PeM","h":96},{"l":"123 - Prog. PLC Off-line","h":96},{"l":"321 - Armarios y cajas","h":84},{"l":"114 - Doc. Mecánica","h":82},{"l":"431 - PeM y Soft Cliente","h":80},{"l":"112 - Diseño 3D","h":68},{"l":"115 - Estudio ofertas","h":68},{"l":"313 - Montaje y PaP","h":67},{"l":"322 - Montaje Elec. Taller","h":64},{"l":"125 - PeM PLC Newval","h":64}];

const DAILY_TL = [{"f":"03-02","h":66,"fj":10,"e":6},{"f":"03-03","h":64,"fj":15,"e":8},{"f":"03-04","h":56,"fj":11,"e":7},{"f":"03-05","h":122,"fj":17,"e":8},{"f":"03-06","h":68,"fj":12,"e":8},{"f":"03-09","h":148,"fj":20,"e":7},{"f":"03-10","h":100,"fj":16,"e":7},{"f":"03-11","h":108,"fj":18,"e":8},{"f":"03-12","h":62,"fj":13,"e":5},{"f":"03-13","h":125,"fj":15,"e":8},{"f":"03-16","h":74,"fj":16,"e":8},{"f":"03-17","h":77,"fj":14,"e":7},{"f":"03-18","h":69,"fj":12,"e":8},{"f":"03-19","h":104,"fj":13,"e":7},{"f":"03-20","h":79,"fj":16,"e":8},{"f":"03-23","h":76,"fj":12,"e":6},{"f":"03-24","h":77,"fj":16,"e":8},{"f":"03-25","h":92,"fj":19,"e":8},{"f":"03-26","h":88,"fj":12,"e":6},{"f":"03-27","h":96,"fj":18,"e":8},{"f":"03-30","h":83,"fj":13,"e":6},{"f":"03-31","h":116,"fj":14,"e":8}];

const CAT_DIST = [{"c":"Oficina/Diseño","h":1307},{"c":"Planta Cliente","h":428},{"c":"Taller","h":215}];

const KM_EMP = [{"n":"Antonio Silva","km":773.5},{"n":"Arnau","km":955.5},{"n":"CATHAYSA","km":1456},{"n":"Pablo Cabaleiro","km":591.5}];

const DIETAS = [{"n":"Antonio Silva","si":10,"no":8},{"n":"Arnau","si":15,"no":13},{"n":"CATHAYSA","si":13,"no":13},{"n":"Pablo Cabaleiro","si":7,"no":11}];

const TREEMAP_DATA = [
  {name:"Gest. Téc. Elec.",size:274,cat:"Oficina"},{name:"Diseño Elec.",size:233,cat:"Oficina"},
  {name:"Gest. Téc. Mec.",size:182,cat:"Oficina"},{name:"Diseño 2D",size:106,cat:"Oficina"},
  {name:"Prog. PLC",size:96,cat:"Oficina"},{name:"Doc. Mecánica",size:82,cat:"Oficina"},
  {name:"Diseño 3D",size:68,cat:"Oficina"},{name:"Estudio ofertas",size:68,cat:"Oficina"},
  {name:"PeM PLC Newval",size:64,cat:"Oficina"},{name:"PeM Robot Newval",size:61,cat:"Oficina"},
  {name:"Montaje Elec. PeM",size:106,cat:"Planta"},{name:"Montaje Flu. PeM",size:96,cat:"Planta"},
  {name:"PeM y Soft Cli.",size:80,cat:"Planta"},{name:"Formación PeM",size:60,cat:"Planta"},
  {name:"Montaje PeM Cli.",size:50,cat:"Planta"},{name:"PeM Robot Cli.",size:36,cat:"Planta"},
  {name:"Armarios/cajas",size:84,cat:"Taller"},{name:"Montaje Elec.",size:64,cat:"Taller"},
  {name:"Montaje y PaP",size:67,cat:"Taller"},
];

const EMPLOYEES = ["Antonio Merino","Antonio Silva","Arnau","CATHAYSA","Ernesto Soriano","Gemma","Kevin Soriano","Pablo Cabaleiro"];
const DATES = ["03-02","03-03","03-04","03-05","03-06","03-09","03-10","03-11","03-12","03-13","03-16","03-17","03-18","03-19","03-20","03-23","03-24","03-25","03-26","03-27","03-30","03-31"];

// ── Helpers ──
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,14,26,0.96)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ color: C.text, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, margin: "2px 0" }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString("es-ES") : p.value}</b>
        </div>
      ))}
    </div>
  );
};

const Badge = ({ children, color }) => (
  <span style={{ fontSize: 10, fontWeight: 700, color, border: `1px solid ${color}33`, borderRadius: 10, padding: "2px 10px", letterSpacing: 0.5 }}>{children}</span>
);

const Section = ({ num, title, sub, badge, badgeColor }) => (
  <div style={{ marginBottom: 16, marginTop: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, color: "#fff", fontWeight: 800, fontSize: 11, padding: "3px 10px", borderRadius: 5 }}>{num}</span>
      <span style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>{title}</span>
      {badge && <Badge color={badgeColor || C.green}>{badge}</Badge>}
    </div>
    <p style={{ color: C.dim, fontSize: 12, margin: "4px 0 0 0" }}>{sub}</p>
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 20, ...style }}>{children}</div>
);

const KPI = ({ label, val, unit, color, sub }) => (
  <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 130 }}>
    <div style={{ color: C.dim, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ color: color || C.text, fontSize: 26, fontWeight: 800 }}>{val}</span>
      <span style={{ color: C.dim, fontSize: 12 }}>{unit}</span>
    </div>
    {sub && <div style={{ color: C.dim, fontSize: 10, marginTop: 4 }}>{sub}</div>}
  </div>
);

// Heatmap component
const Heatmap = () => {
  const lookup = useMemo(() => {
    const m = {};
    HEATMAP_RAW.forEach(r => { m[`${r.n}_${r.d}`] = r.h; });
    return m;
  }, []);
  const maxH = Math.max(...HEATMAP_RAW.map(r => r.h));

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 3, fontSize: 10 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", color: C.dim, fontWeight: 600, padding: "0 8px 6px 0", fontSize: 10, minWidth: 110 }}>Empleado</th>
            {DATES.map(d => (
              <th key={d} style={{ color: C.dim, fontWeight: 600, padding: "0 0 6px 0", fontSize: 9, width: 38, textAlign: "center" }}>{d.slice(3)}</th>
            ))}
            <th style={{ color: C.dim, fontWeight: 700, padding: "0 0 6px 8px", fontSize: 10 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {EMPLOYEES.map(emp => {
            const total = DATES.reduce((s, d) => s + (lookup[`${emp}_${d}`] || 0), 0);
            return (
              <tr key={emp}>
                <td style={{ color: C.text, fontWeight: 600, paddingRight: 8, whiteSpace: "nowrap", fontSize: 11 }}>{emp.length > 14 ? emp.slice(0,12) + "…" : emp}</td>
                {DATES.map(d => {
                  const h = lookup[`${emp}_${d}`];
                  if (!h) return <td key={d} style={{ width: 38, height: 32, borderRadius: 4, background: `${C.border}44`, textAlign: "center" }}><span style={{ color: C.dim, fontSize: 9 }}>—</span></td>;
                  const ratio = h / maxH;
                  const isHigh = h > 10;
                  const bg = isHigh
                    ? `rgba(239,68,85,${0.2 + ratio * 0.6})`
                    : `rgba(59,158,255,${0.1 + ratio * 0.5})`;
                  return (
                    <td key={d} style={{ width: 38, height: 32, borderRadius: 4, background: bg, textAlign: "center", border: isHigh ? "1px solid rgba(239,68,85,0.3)" : "1px solid transparent" }}>
                      <span style={{ color: isHigh ? "#fca5a5" : C.text, fontWeight: 700, fontSize: 11 }}>{h}</span>
                    </td>
                  );
                })}
                <td style={{ color: C.text, fontWeight: 800, paddingLeft: 8, fontSize: 12 }}>{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(59,158,255,0.4)" }} /><span style={{ fontSize: 10, color: C.dim }}>≤ 10h (normal)</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(239,68,85,0.5)" }} /><span style={{ fontSize: 10, color: C.dim }}>&gt; 10h (revisar)</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: `${C.border}44` }} /><span style={{ fontSize: 10, color: C.dim }}>Sin fichaje</span></div>
      </div>
    </div>
  );
};

const TreemapCell = ({ x, y, width, height, name, size, cat }) => {
  if (width < 35 || height < 28) return null;
  const color = cat === "Oficina" ? C.catOficina : cat === "Planta" ? C.catPlanta : C.catTaller;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4} style={{ fill: color, fillOpacity: 0.22, stroke: color, strokeWidth: 1, strokeOpacity: 0.4 }} />
      {width > 55 && <text x={x + 6} y={y + 15} style={{ fill: C.text, fontSize: 10, fontWeight: 600 }}>{name}</text>}
      {width > 45 && height > 30 && <text x={x + 6} y={y + 28} style={{ fill: C.dim, fontSize: 9 }}>{size}h</text>}
    </g>
  );
};

const tabs = [
  { id: "primary", label: "Principales", icon: "◉" },
  { id: "secondary", label: "Secundarias", icon: "◎" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("primary");

  const taskHoursReversed = useMemo(() => [...TASK_HOURS].reverse(), []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "20px 28px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em" }}>
              <span style={{ color: C.accent }}>Time</span>Flow
              <span style={{ color: C.dim, fontSize: 12, fontWeight: 500, marginLeft: 10 }}>Dashboard Analytics</span>
            </h1>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>
              Proyecto <span style={{ color: C.amber, fontWeight: 700 }}>[3025] MANGO</span> — Marzo 2026 — 323 fichajes · 8 empleados
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: tab === t.id ? C.accent : C.dim, padding: "10px 20px", fontSize: 13, fontWeight: 600,
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 1200 }}>

        {/* ══════════════════════════════════════════════ */}
        {/* PRIMARY CHARTS */}
        {/* ══════════════════════════════════════════════ */}
        {tab === "primary" && (
          <>
            {/* KPIs */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              <KPI label="Total Horas" val="1.950" unit="h" color={C.accent} sub="Marzo 2026" />
              <KPI label="Fichajes" val="323" unit="" color={C.accent2} sub="Ø 14.7 / día" />
              <KPI label="Empleados" val="8" unit="" color={C.green} sub="Activos" />
              <KPI label="KM Particular" val="3.777" unit="km" color={C.amber} sub="Reembolsables" />
              <KPI label="Dietas SÍ" val="45" unit="" color={C.pink} sub="de 90 registros logíst." />
            </div>

            {/* 1: HEATMAP */}
            <Section num="01" title="Heatmap Empleado × Día" sub="Control diario de fichajes. Rojo = día con más de 10h sumadas (puede indicar error de fichaje o sobrecarga real)." badge="CONTROL Nº1" badgeColor={C.pink} />
            <Card><Heatmap /></Card>

            {/* 2: DAILY STACKED BY CATEGORY */}
            <Section num="02" title="Carga Diaria por Categoría" sub="Distribución Oficina / Planta Cliente / Taller cada día. Detecta cambios de fase en el proyecto." badge="TENDENCIA" badgeColor={C.accent} />
            <Card>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={DAILY_CAT}>
                  <defs>
                    <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.catOficina} stopOpacity={0.5} /><stop offset="100%" stopColor={C.catOficina} stopOpacity={0.05} /></linearGradient>
                    <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.catPlanta} stopOpacity={0.5} /><stop offset="100%" stopColor={C.catPlanta} stopOpacity={0.05} /></linearGradient>
                    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.catTaller} stopOpacity={0.5} /><stop offset="100%" stopColor={C.catTaller} stopOpacity={0.05} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="f" stroke={C.dim} fontSize={10} tickFormatter={v => v.slice(3)} />
                  <YAxis stroke={C.dim} fontSize={10} unit="h" />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="ofi" stackId="1" stroke={C.catOficina} fill="url(#gO)" name="Oficina/Diseño" strokeWidth={2} />
                  <Area type="monotone" dataKey="pla" stackId="1" stroke={C.catPlanta} fill="url(#gP)" name="Planta Cliente" strokeWidth={2} />
                  <Area type="monotone" dataKey="tal" stackId="1" stroke={C.catTaller} fill="url(#gT)" name="Taller" strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* 3: HOURS PER EMPLOYEE */}
            <Section num="03" title="Horas Totales por Empleado" sub="Comparación directa de carga. La línea marca la media del equipo (244h)." badge="CARGA" badgeColor={C.accent2} />
            <Card>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={EMP_HOURS} layout="vertical" barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis type="number" stroke={C.dim} fontSize={10} unit="h" />
                  <YAxis type="category" dataKey="n" stroke={C.dim} fontSize={11} width={120} />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine x={244} stroke={C.amber} strokeDasharray="5 3" label={{ value: "Media 244h", fill: C.amber, fontSize: 10, position: "top" }} />
                  <Bar dataKey="h" name="Horas" radius={[0, 6, 6, 0]} fill={C.accent}>
                    {EMP_HOURS.map((e, i) => <Cell key={i} fill={e.h > 260 ? C.pink : C.accent} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 4: HOURS PER TASK */}
            <Section num="04" title="Horas por Tarea (Top 15)" sub="Dónde va el esfuerzo del proyecto. Coloreado por serie: azul = Oficina (1XX), naranja = Planta (4XX), verde = Taller (3XX)." badge="DESGLOSE" badgeColor={C.green} />
            <Card>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={taskHoursReversed} layout="vertical" barCategoryGap="12%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis type="number" stroke={C.dim} fontSize={10} unit="h" />
                  <YAxis type="category" dataKey="l" stroke={C.dim} fontSize={10} width={180} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="h" name="Horas" radius={[0, 5, 5, 0]}>
                    {taskHoursReversed.map((t, i) => {
                      const code = parseInt(t.l);
                      const color = code >= 400 ? C.catPlanta : code >= 300 ? C.catTaller : C.catOficina;
                      return <Cell key={i} fill={color} fillOpacity={0.75} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {[["1XX Oficina/Diseño", C.catOficina], ["3XX Taller", C.catTaller], ["4XX Planta Cliente", C.catPlanta]].map(([n, c]) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: 0.75 }} /><span style={{ fontSize: 10, color: C.dim }}>{n}</span></div>
                ))}
              </div>
            </Card>

            {/* 5: DAILY TIMELINE */}
            <Section num="05" title="Línea Temporal: Horas + Fichajes + Empleados" sub="Barras = horas totales, línea azul = nº fichajes, línea verde = empleados activos. Picos = días intensos." badge="ACTIVIDAD" badgeColor={C.teal} />
            <Card>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={DAILY_TL}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="f" stroke={C.dim} fontSize={10} tickFormatter={v => v.slice(3)} />
                  <YAxis yAxisId="h" stroke={C.dim} fontSize={10} />
                  <YAxis yAxisId="fj" orientation="right" stroke={C.accent2} fontSize={10} />
                  <Tooltip content={<Tip />} />
                  <Bar yAxisId="h" dataKey="h" name="Horas" fill={C.accent} fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="fj" type="monotone" dataKey="fj" name="Fichajes" stroke={C.accent2} strokeWidth={2.5} dot={{ r: 3, fill: C.accent2 }} />
                  <Line yAxisId="fj" type="monotone" dataKey="e" name="Empleados" stroke={C.green} strokeWidth={2} dot={{ r: 3, fill: C.green }} strokeDasharray="5 3" />
                  <ReferenceLine yAxisId="h" y={88.6} stroke={C.amber} strokeDasharray="4 4" label={{ value: "Media 88.6h", fill: C.amber, fontSize: 9 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* SECONDARY CHARTS */}
        {/* ══════════════════════════════════════════════ */}
        {tab === "secondary" && (
          <>
            {/* 6: DONUT Category */}
            <Section num="06" title="Distribución Oficina / Planta / Taller" sub="Vista macro del esfuerzo. El 67% del tiempo va a Oficina/Diseño." />
            <Card>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
                <ResponsiveContainer width={260} height={220}>
                  <PieChart>
                    <Pie data={CAT_DIST} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="h" nameKey="c" stroke="none">
                      {CAT_DIST.map((_, i) => <Cell key={i} fill={[C.catOficina, C.catPlanta, C.catTaller][i]} fillOpacity={0.8} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CAT_DIST.map((c, i) => {
                    const pct = Math.round(c.h / 1950 * 100);
                    const colors = [C.catOficina, C.catPlanta, C.catTaller];
                    return (
                      <div key={c.c} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: colors[i] }} />
                        <span style={{ fontSize: 13, color: C.text, minWidth: 120 }}>{c.c}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: colors[i] }}>{c.h}h</span>
                        <span style={{ fontSize: 11, color: C.dim }}>({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* 7: KMs per employee */}
            <Section num="07" title="KMs Reembolsables por Empleado" sub="Solo vehículo particular. CATHAYSA lidera con 1.456 km. Clave para el cálculo de reembolso del Excel." />
            <Card>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={KM_EMP} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis type="number" stroke={C.dim} fontSize={10} unit=" km" />
                  <YAxis type="category" dataKey="n" stroke={C.dim} fontSize={12} width={130} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="km" name="KM Particular" fill={C.amber} fillOpacity={0.75} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 8, padding: "8px 12px", background: `${C.amber}11`, borderRadius: 6, border: `1px solid ${C.amber}22` }}>
                <span style={{ fontSize: 11, color: C.amber }}>Reembolso estimado (0.19€/km):</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.amber, marginLeft: 8 }}>{(3776.5 * 0.19).toFixed(0)}€</span>
              </div>
            </Card>

            {/* 8: Dietas */}
            <Section num="08" title="Dietas por Empleado" sub="Solo los 4 empleados que van a Planta Cliente. Arnau y CATHAYSA lideran." />
            <Card>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={DIETAS} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="n" stroke={C.dim} fontSize={11} />
                  <YAxis stroke={C.dim} fontSize={10} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="si" name="Con dieta" fill={C.green} fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="no" name="Sin dieta" fill={C.dim} fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 9: Treemap */}
            <Section num="09" title="Treemap: Categoría → Tarea" sub="Proporción visual del esfuerzo. El tamaño del bloque = horas. Útil para presentaciones y reporting." />
            <Card>
              <ResponsiveContainer width="100%" height={260}>
                <Treemap data={TREEMAP_DATA} dataKey="size" nameKey="name" content={<TreemapCell />} animationDuration={400} />
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                {[["Oficina/Diseño", C.catOficina], ["Planta Cliente", C.catPlanta], ["Taller", C.catTaller]].map(([n, c]) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: 0.6 }} /><span style={{ fontSize: 10, color: C.dim }}>{n}</span></div>
                ))}
              </div>
            </Card>

            {/* 10: Summary table */}
            <Section num="10" title="Tabla Resumen: Empleado × Métricas" sub="Vista consolidada para el informe mensual." />
            <Card>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Empleado", "Horas", "Fichajes", "KM Part.", "Dietas SÍ", "h/día Ø"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.dim, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EMP_HOURS.slice().reverse().map(e => {
                      const km = KM_EMP.find(k => k.n === e.n);
                      const dieta = DIETAS.find(d => d.n === e.n);
                      const fichajes = HEATMAP_RAW.filter(r => r.n === e.n).length;
                      const dias = new Set(HEATMAP_RAW.filter(r => r.n === e.n).map(r => r.d)).size;
                      const avg = (e.h / dias).toFixed(1);
                      return (
                        <tr key={e.n} style={{ borderBottom: `1px solid ${C.border}22` }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>{e.n}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 70, height: 5, background: `${C.accent}22`, borderRadius: 3 }}>
                                <div style={{ width: `${e.h / 308 * 100}%`, height: "100%", background: C.accent, borderRadius: 3 }} />
                              </div>
                              <span>{e.h}h</span>
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px", color: C.dim }}>{fichajes}</td>
                          <td style={{ padding: "8px 10px", color: km ? C.amber : C.dim }}>{km ? `${km.km} km` : "—"}</td>
                          <td style={{ padding: "8px 10px", color: dieta ? C.green : C.dim }}>{dieta ? dieta.si : "—"}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{
                              background: parseFloat(avg) > 14 ? `${C.red}22` : `${C.green}22`,
                              color: parseFloat(avg) > 14 ? C.red : C.green,
                              padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700
                            }}>{avg}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
