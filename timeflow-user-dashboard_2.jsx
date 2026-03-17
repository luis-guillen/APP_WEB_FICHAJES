import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  ComposedChart, Line, ReferenceLine, Area
} from "recharts";

// ── Palette ──
const C = {
  bg: "#faf9f7", card: "#ffffff", border: "#e8e4df",
  text: "#1a1a1a", dim: "#8c8279", dimLight: "#b5aea6",
  accent: "#2563eb", accent2: "#7c3aed",
  green: "#059669", greenBg: "#ecfdf5",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  catOfi: "#2563eb", catPla: "#d97706", catTal: "#059669",
};

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// ── Backend API helper ──
const BASE_URL = "http://localhost:8000";

const apiFetch = async (endpoint) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
};

// ── Date / week helpers ──
const getISOWeekNum = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

const getWeekLabel = (weekNum, year) => {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4.getTime() - (dow - 1) * 86400000 + (weekNum - 1) * 7 * 86400000);
  const weekEnd   = new Date(weekStart.getTime() + 4 * 86400000);
  const fmt = (d) => `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()].slice(0, 3)}`;
  return `S${weekNum} (${fmt(weekStart)}-${fmt(weekEnd)})`;
};

const getWorkingDays = (year, month) => {
  const days = [];
  const lastDay = new Date(year, month, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(`${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
  }
  return days;
};

// ── UI components ──
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ color: C.text, fontWeight: 700, marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, margin: "2px 0" }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString("es-ES") : p.value}</b>
        </div>
      ))}
    </div>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

const Label = ({ text, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <span style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{text}</span>
    {sub && <span style={{ color: C.dim, fontSize: 11, marginLeft: 10 }}>{sub}</span>}
  </div>
);

const Stat = ({ label, val, unit, color, icon, bg }) => (
  <div style={{ background: bg || "#f8f7f5", border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{icon} {label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <span style={{ fontSize: 28, fontWeight: 800, color: color || C.text, letterSpacing: "-0.03em" }}>{val}</span>
      <span style={{ fontSize: 13, color: C.dim }}>{unit}</span>
    </div>
  </div>
);

const MiniBar = ({ pct, color }) => (
  <div style={{ width: 60, height: 6, background: `${color}22`, borderRadius: 3, display: "inline-block", verticalAlign: "middle", marginLeft: 8 }}>
    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
  </div>
);

// ── Main component ──
export default function UserDashboard() {
  const now = new Date();
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);

  const [allEntries,  setAllEntries]  = useState([]);
  const [taskMap,     setTaskMap]     = useState({});
  const [projectMap,  setProjectMap]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [refreshKey,  setRefreshKey]  = useState(0);

  // Current user stored by authService at login
  const currentUser = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  // ── Data fetch ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [entriesData, tasksData, projectsData] = await Promise.all([
          apiFetch("/time-entries/me"),
          apiFetch("/tasks/"),
          apiFetch("/projects/me"),
        ]);
        if (cancelled) return;
        setAllEntries(entriesData);
        const tMap = {};
        tasksData.forEach(t => { tMap[t.id] = t; });
        setTaskMap(tMap);
        const pMap = {};
        projectsData.forEach(p => { pMap[p.id] = p; });
        setProjectMap(pMap);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // ── Month range ──
  const monthStart = `${selYear}-${String(selMonth).padStart(2, "0")}-01`;
  const lastDayNum = new Date(selYear, selMonth, 0).getDate();
  const monthEnd   = `${selYear}-${String(selMonth).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;

  const monthEntries = useMemo(() =>
    allEntries.filter(e => {
      const d = (typeof e.date === "string" ? e.date : "").slice(0, 10);
      return d >= monthStart && d <= monthEnd;
    }),
    [allEntries, monthStart, monthEnd]
  );

  const allWorkingDays = useMemo(() => getWorkingDays(selYear, selMonth), [selYear, selMonth]);

  // ── Stats computation ──
  const stats = useMemo(() => {
    if (monthEntries.length === 0) return null;

    // Daily grouping (key = "MM-DD")
    const byDate = {};
    monthEntries.forEach(e => {
      const fullDate = (typeof e.date === "string" ? e.date : "").slice(0, 10);
      const dayKey   = fullDate.slice(5); // "MM-DD"
      if (!byDate[dayKey]) byDate[dayKey] = { h: 0, fj: 0 };
      byDate[dayKey].h  += (e.hours || 0) + (e.overtime_hours || 0);
      byDate[dayKey].fj += 1;
    });

    const daily = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([f, v]) => ({ f, h: Math.round(v.h * 10) / 10, fj: v.fj }));

    const totalH  = Math.round(daily.reduce((s, d) => s + d.h, 0) * 10) / 10;
    const totalFj = monthEntries.length;
    const dias    = daily.length;

    // Cumulative
    let acc = 0;
    const accumData = daily.map(d => {
      acc += d.h;
      return { f: d.f, acum: Math.round(acc * 10) / 10, h: d.h };
    });

    // Task grouping
    const byTask = {};
    monthEntries.forEach(e => {
      const task = taskMap[e.task_id];
      if (!task) return;
      if (!byTask[task.id]) byTask[task.id] = { t: task.name, c: task.category, h: 0 };
      byTask[task.id].h += (e.hours || 0) + (e.overtime_hours || 0);
    });
    const tasks = Object.values(byTask)
      .map(t => ({ ...t, h: Math.round(t.h * 10) / 10 }))
      .sort((a, b) => b.h - a.h)
      .slice(0, 8);

    // Category breakdown
    const cats = { Oficina: 0, Planta: 0, Taller: 0 };
    monthEntries.forEach(e => {
      const task = taskMap[e.task_id];
      if (task && cats[task.category] !== undefined) {
        cats[task.category] = Math.round((cats[task.category] + (e.hours || 0) + (e.overtime_hours || 0)) * 10) / 10;
      }
    });

    // Weekly grouping (ISO week number)
    const byWeek = {};
    monthEntries.forEach(e => {
      const fullDate = (typeof e.date === "string" ? e.date : "").slice(0, 10);
      if (!fullDate) return;
      const wk = getISOWeekNum(fullDate);
      if (!byWeek[wk]) byWeek[wk] = 0;
      byWeek[wk] += (e.hours || 0) + (e.overtime_hours || 0);
    });
    const weekly = Object.entries(byWeek)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([s, h]) => ({
        s:      Number(s),
        h:      Math.round(h * 10) / 10,
        label:  getWeekLabel(Number(s), selYear),
        target: 40,
      }));

    // Km / logistics from vehicle entries
    const kmEntries = monthEntries.filter(e => e.vehicle_type === "particular" && e.distance_origin);
    let totalKm = 0;
    const origMap = {};
    kmEntries.forEach(e => {
      const proj = projectMap[e.project_id];
      const dist = proj?.distance_from_workshop || 0;
      const km   = e.trip_type === "round" ? dist * 2 : dist;
      totalKm += km;
      const key = e.distance_origin;
      if (!origMap[key]) origMap[key] = { o: key, km: 0, n: 0 };
      origMap[key].km += km;
      origMap[key].n  += 1;
    });
    const orig = Object.values(origMap).sort((a, b) => b.km - a.km);

    // Meals: count unique days with / without
    const daysWithMeals    = new Set();
    const daysWithoutMeals = new Set();
    monthEntries.forEach(e => {
      const d = (typeof e.date === "string" ? e.date : "").slice(0, 10);
      if (e.meals === true)  daysWithMeals.add(d);
      if (e.meals === false) daysWithoutMeals.add(d);
    });

    const hasTr = kmEntries.length > 0 || daysWithMeals.size > 0 || daysWithoutMeals.size > 0;

    return {
      totalH, totalFj, dias,
      daily, accumData, tasks, cats, weekly,
      hasTr,
      kmP: Math.round(totalKm * 10) / 10,
      orig,
      dSi: daysWithMeals.size,
      dNo: daysWithoutMeals.size,
    };
  }, [monthEntries, taskMap, projectMap, selYear]);

  const avgDaily = stats ? (stats.totalH / stats.dias).toFixed(1) : "0.0";

  const dailyLookup = useMemo(() => {
    if (!stats) return {};
    const m = {};
    stats.daily.forEach(d => { m[d.f] = d; });
    return m;
  }, [stats]);

  const monthLabel = `${MONTH_NAMES[selMonth - 1]} ${selYear}`;

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⏳</div>
          <div style={{ color: C.dim, fontSize: 14, fontWeight: 600 }}>Cargando tu panel...</div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
          <div style={{ color: C.red, fontSize: 14, marginBottom: 18, fontWeight: 600 }}>
            No se pudieron cargar los datos
          </div>
          <div style={{ color: C.dim, fontSize: 12, marginBottom: 20 }}>{error}</div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ padding: "10px 24px", background: C.accent, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "18px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
              <span style={{ color: C.accent }}>Time</span>Flow
              <span style={{ color: C.dim, fontSize: 12, fontWeight: 500, marginLeft: 10 }}>Mi Panel</span>
            </h1>
            <div style={{ color: C.dim, fontSize: 12, marginTop: 3 }}>
              {currentUser.name || "—"} · {monthLabel}
            </div>
          </div>

          {/* Month / year selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={selMonth}
              onChange={e => setSelMonth(Number(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" }}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selYear}
              onChange={e => setSelYear(Number(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none", width: 88 }}
            >
              {[selYear - 1, selYear, selYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ padding: "22px 28px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Identity + KPIs ── */}
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16, minWidth: 220, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
              {(currentUser.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{currentUser.name || "—"}</div>
              <div style={{ fontSize: 12, color: C.dim }}>Cód: {currentUser.employee_code || "—"}</div>
              {currentUser.role && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{currentUser.role}</div>}
            </div>
          </div>

          <Stat label="Horas Totales"  val={stats?.totalH ?? "—"} unit="h"    color={C.accent}  icon="⏱" bg="#eff6ff" />
          <Stat label="Días Trabajados" val={stats?.dias   ?? "—"} unit={`de ${allWorkingDays.length}`} color={C.accent2} icon="📅" bg="#f5f3ff" />
          <Stat
            label="Media Diaria"
            val={stats ? avgDaily : "—"}
            unit="h/día"
            color={stats && parseFloat(avgDaily) > 12 ? C.red : C.green}
            icon="📊"
            bg={stats && parseFloat(avgDaily) > 12 ? C.redBg : C.greenBg}
          />
          {stats?.hasTr && stats.kmP > 0 && (
            <Stat label="KM Particular" val={stats.kmP.toLocaleString("es-ES")} unit="km" color={C.amber} icon="🚗" bg={C.amberBg} />
          )}
        </div>

        {/* ── Sin datos ── */}
        {!stats && (
          <Card>
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.dim }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Sin registros en {monthLabel}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Cuando registres horas este mes, aparecerán aquí.</div>
            </div>
          </Card>
        )}

        {stats && (
          <>
            {/* ── 1: DAILY HOURS BAR ── */}
            <Card>
              <Label text="Mis horas diarias" sub="Azul ≤ 10h · Rojo > 10h (revisar) · Línea punteada = jornada 8h" />
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={stats.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="f" stroke={C.dim} fontSize={10} tickFormatter={v => v.slice(3)} />
                  <YAxis stroke={C.dim} fontSize={10} unit="h" />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine y={8} stroke={C.dim} strokeDasharray="5 3" label={{ value: "8h", fill: C.dim, fontSize: 9 }} />
                  <Bar dataKey="h" name="Horas" radius={[5, 5, 0, 0]}>
                    {stats.daily.map((d, i) => (
                      <Cell key={i} fill={d.h > 10 ? C.red : C.accent} fillOpacity={d.h > 10 ? 0.7 : 0.65} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* ── 2: WEEKLY PROGRESS ── */}
            <Card>
              <Label text="Progreso semanal" sub="Barra = horas fichadas · Línea gris = jornada teórica (40h/sem)" />
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={stats.weekly} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="label" stroke={C.dim} fontSize={10} />
                  <YAxis stroke={C.dim} fontSize={10} unit="h" />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="h" name="Horas" radius={[6, 6, 0, 0]}>
                    {stats.weekly.map((w, i) => (
                      <Cell key={i} fill={w.h > w.target ? C.amber : C.accent} fillOpacity={0.7} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="target" name="Teórica" stroke={C.dimLight} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* ── ROW: TASKS + CATEGORIES ── */}
            <div style={{ display: "flex", gap: 18, marginBottom: 0, flexWrap: "wrap" }}>

              {/* 3: TASK BREAKDOWN */}
              <Card style={{ flex: 2, minWidth: 340 }}>
                <Label text="Reparto por tarea" sub="En qué he dedicado mi tiempo" />
                {stats.tasks.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={Math.max(180, stats.tasks.length * 36)}>
                      <BarChart data={[...stats.tasks].reverse()} layout="vertical" barCategoryGap="14%">
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                        <XAxis type="number" stroke={C.dim} fontSize={10} unit="h" />
                        <YAxis type="category" dataKey="t" stroke={C.dim} fontSize={10} width={160} />
                        <Tooltip content={<Tip />} />
                        <Bar dataKey="h" name="Horas" radius={[0, 5, 5, 0]}>
                          {[...stats.tasks].reverse().map((t, i) => {
                            const color = t.c === "Planta" ? C.catPla : t.c === "Taller" ? C.catTal : C.catOfi;
                            return <Cell key={i} fill={color} fillOpacity={0.7} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                      {[["Oficina", C.catOfi], ["Planta", C.catPla], ["Taller", C.catTal]].map(([n, c]) => (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: c, opacity: 0.7 }} />
                          <span style={{ fontSize: 10, color: C.dim }}>{n}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: C.dim }}>Sin datos de tareas</div>
                )}
              </Card>

              {/* 4: CATEGORY DONUT */}
              <Card style={{ flex: 1, minWidth: 260 }}>
                <Label text="Categorías" />
                {Object.values(stats.cats).some(v => v > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.cats).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4}
                          dataKey="value" nameKey="name" stroke="none"
                        >
                          {Object.entries(stats.cats).filter(([, v]) => v > 0).map(([k], i) => {
                            const color = k === "Oficina" ? C.catOfi : k === "Planta" ? C.catPla : C.catTal;
                            return <Cell key={i} fill={color} fillOpacity={0.75} />;
                          })}
                        </Pie>
                        <Tooltip content={<Tip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      {Object.entries(stats.cats).filter(([, v]) => v > 0).map(([k, v]) => {
                        const pct   = Math.round(v / stats.totalH * 100);
                        const color = k === "Oficina" ? C.catOfi : k === "Planta" ? C.catPla : C.catTal;
                        return (
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 3, background: color, opacity: 0.75 }} />
                              <span style={{ fontSize: 12 }}>{k}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color }}>{v}h ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: C.dim }}>Sin datos de categoría</div>
                )}
              </Card>
            </div>

            {/* ── 5: CUMULATIVE ── */}
            <Card>
              <Label text="Acumulado mensual" sub="Área = horas acumuladas a lo largo del mes" />
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={stats.accumData}>
                  <defs>
                    <linearGradient id="gAcum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={C.accent} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.accent} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="f" stroke={C.dim} fontSize={10} tickFormatter={v => v.slice(3)} />
                  <YAxis stroke={C.dim} fontSize={10} unit="h" />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="acum" name="Acumulado" stroke={C.accent} fill="url(#gAcum)" strokeWidth={2.5} dot={{ r: 3, fill: C.accent }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* ── 6: MINI CALENDAR ── */}
            <Card>
              <Label text="Calendario del mes" sub="Vista rápida de todos los días laborables" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allWorkingDays.map(d => {
                  const entry  = dailyLookup[d];
                  const h      = entry?.h || 0;
                  const worked = !!entry;
                  const isHigh = h > 10;
                  return (
                    <div key={d} style={{
                      width: 82, padding: "8px 10px", borderRadius: 10,
                      background: !worked ? "#f5f4f2" : isHigh ? C.redBg : "#eff6ff",
                      border: `1px solid ${!worked ? C.border : isHigh ? "#fecaca" : "#bfdbfe"}`,
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.dim }}>
                        {d.slice(3)} {MONTH_NAMES[selMonth - 1].slice(0, 3)}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: !worked ? C.dimLight : isHigh ? C.red : C.accent, marginTop: 2 }}>
                        {worked ? `${h}h` : "—"}
                      </div>
                      {worked && (
                        <div style={{ fontSize: 9, color: C.dim, marginTop: 1 }}>
                          {entry.fj} fichaje{entry.fj > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ── 7: LOGISTICS ── */}
            {stats.hasTr && (
              <Card>
                <Label text="Mi logística" sub="Desplazamientos y dietas del mes" />
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

                  {/* KM */}
                  {stats.kmP > 0 && (
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Kilómetros por origen</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {stats.orig.filter(o => o.km > 0).map(o => (
                          <div key={o.o} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#fefce8", borderRadius: 8, border: "1px solid #fef08a" }}>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{o.o}</span>
                              <span style={{ fontSize: 10, color: C.dim, marginLeft: 8 }}>{o.n} viaje{o.n > 1 ? "s" : ""}</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: C.amber }}>{o.km.toLocaleString("es-ES")} km</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, padding: "10px 14px", background: C.amberBg, borderRadius: 10, border: "1px solid #fde68a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Total KM particular</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: C.amber }}>{stats.kmP.toLocaleString("es-ES")} km</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: C.dim }}>Reembolso estimado (0.19 €/km)</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{(stats.kmP * 0.19).toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dietas */}
                  {(stats.dSi > 0 || stats.dNo > 0) && (
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Dietas</div>
                      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1, textAlign: "center", padding: "14px", background: C.greenBg, borderRadius: 10, border: "1px solid #a7f3d0" }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{stats.dSi}</div>
                          <div style={{ fontSize: 11, color: C.dim, fontWeight: 600 }}>Con dieta</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center", padding: "14px", background: "#f5f4f2", borderRadius: 10, border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: C.dim }}>{stats.dNo}</div>
                          <div style={{ fontSize: 11, color: C.dim, fontWeight: 600 }}>Sin dieta</div>
                        </div>
                      </div>
                      <div style={{ padding: "10px 14px", background: C.greenBg, borderRadius: 10, border: "1px solid #a7f3d0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Coste dietas estimado</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{(stats.dSi * 37.40).toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ── FICHAJES TABLE ── */}
            <Card>
              <Label text="Detalle de fichajes" sub={`${stats.totalFj} registros en ${stats.dias} días`} />
              <div style={{ overflowX: "auto", maxHeight: 320 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {["Día", "Horas", "Fichajes", "Estado"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.dim, fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.daily.map(d => (
                      <tr key={d.f} style={{ borderBottom: `1px solid ${C.border}44` }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                          {d.f.slice(3)} {MONTH_NAMES[selMonth - 1].slice(0, 3)}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ fontWeight: 700, color: d.h > 10 ? C.red : C.text }}>{d.h}h</span>
                          <MiniBar pct={d.h / 10 * 100} color={d.h > 10 ? C.red : C.accent} />
                        </td>
                        <td style={{ padding: "8px 12px", color: C.dim }}>{d.fj}</td>
                        <td style={{ padding: "8px 12px" }}>
                          {d.h > 10 ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.red,   background: C.redBg,   padding: "2px 8px", borderRadius: 10 }}>REVISAR</span>
                          ) : d.h >= 6 ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.green, background: C.greenBg, padding: "2px 8px", borderRadius: 10 }}>OK</span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.amber, background: C.amberBg, padding: "2px 8px", borderRadius: 10 }}>PARCIAL</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
