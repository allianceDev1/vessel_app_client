
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";


const STATUS_CONFIG = {
    Completed: { label: "Completed", color: "#22c55e", bg: "var(--surface-1)" },
    Working: { label: "In Progress", color: "#f97316", bg: "var(--surface-1)" },
    Traveling: { label: "Traveling", color: "#38bdf8", bg: "var(--surface-1)" },
};


const TodayWorkFlow = ({ technicians, workFlows }) => {

    const now = new Date().getHours() + Number((new Date().getMinutes() / 60).toFixed(2));
    const DAY_START = 6;
    const DAY_END = 19;
  

    function toHHMM(decimal) {
        const h = Math.floor(decimal);
        const m = (Math.round((decimal - h) * 60)).toString().padStart(2, "0");
        const ampm = h < 12 ? "AM" : "PM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${m} ${ampm}`;
    }

    function getStatus(w) {
        if (w.workClose !== null) return "Completed";
        if (w.workStart !== null) return "Working";
        return "Traveling";
    }

    function buildChartData(technicians) {
        return technicians.map((tech) => {
            const works = workFlows.filter((w) => w.techId === tech.worker_uuid);
           
            const segments = [];
            works.forEach((w) => {
                const status = getStatus(w);
                const effectiveWorkStart = w.workStart ?? now;
                const effectiveWorkClose = w.workClose ?? now;

                segments.push({
                    workId: w.id,
                    label: w.label,
                    status,
                    travelStart: w.travelStart,
                    workStart: w.workStart,
                    workClose: w.workClose,
                    travelDur: Number((effectiveWorkStart - w.travelStart).toFixed(2)),
                    workDur: status === 'Traveling' ? 0 : Number((effectiveWorkClose - w.workStart).toFixed(2)),
                });
            });
            segments.sort((a, b) => a.travelStart - b.travelStart);


            const bars = [];
            let cursor = DAY_START;
            segments.forEach((seg) => {
                if (seg.travelStart > cursor) {
                    bars.push({ type: "gap", value: seg.travelStart - cursor, workId: null });
                }
                // Travel segment
                bars.push({
                    type: "travel",
                    value: seg.travelDur,
                    workId: seg.workId,
                    label: seg.label,
                    status: seg.status,
                    travelStart: seg.travelStart,
                    workStart: seg.workStart,
                    workClose: seg.workClose,
                });
                // Work segment (only if work has started)
                if (seg.workDur > 0) {
                    bars.push({
                        type: "work",
                        value: seg.workDur,
                        workId: seg.workId,
                        label: seg.label,
                        status: seg.status,
                        travelStart: seg.travelStart,
                        workStart: seg.workStart,
                        workClose: seg.workClose,
                    });
                }
                cursor = seg.workClose ?? Math.min(now, DAY_END);
            });
            if (cursor < DAY_END) {
                bars.push({ type: "gap", value: DAY_END - cursor, workId: null });
            }

            return { techId: tech.worker_uuid, name: tech.worker_name, bars };
        });
    }

    const hoveredSegmentRef = { current: null };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const data = hoveredSegmentRef.current;
        if (!data || data.type === "gap") return null;

        const tech = technicians.find((t) => t.worker_name === label);
        const statusCfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.Completed;

        return (
            <div style={{
                background: "var(--surface)",
                border: `1px solid ${tech.color}`,
                borderRadius: 10,
                padding: "12px 16px",
                minWidth: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: tech.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {data.label}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.color}44`, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>
                        {data.status}
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: 12 }}>
                    <span style={{ color: "var(--text-secondary-3)" }}>Travel Start</span>
                    <span style={{ color: "var(--text_secondary-1)", fontWeight: 600 }}>{toHHMM(data.travelStart)}</span>
                    <span style={{ color: "var(--text-secondary-3)" }}>Work Start</span>
                    <span style={{ color: data.workStart ? "var(--text_secondary-1)" : "#38bdf8", fontWeight: 600 }}>
                        {data.workStart ? toHHMM(data.workStart) : "En route…"}
                    </span>
                    <span style={{ color: "var(--text-secondary-3)" }}>Work Close</span>
                    <span style={{ color: data.workClose ? "var(--text_secondary-1)" : "#f97316", fontWeight: 600 }}>
                        {data.workClose ? toHHMM(data.workClose) : data.workStart ? "In progress…" : "—"}
                    </span>
                    {data.workClose && (
                        <>
                            <span style={{ color: "var(--text-secondary-3)" }}>Duration</span>
                            <span style={{ color: "var(--text_secondary-1)", fontWeight: 600 }}>{Math.round((data.workClose - data.travelStart) * 60)} min</span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const CustomYAxisTick = ({ x, y, payload }) => {
        const tech = technicians.find((t) => t.worker_name === payload.value);
        if (!tech) return null;

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={-114} y={tech?.attendance_status ? -4 : 4} textAnchor="start" fontSize={12} fill="var(--text-secondary-1)" fontWeight={500} fontFamily="sans-serif">
                    {tech.worker_name}
                </text>
                {tech?.attendance_status && (
                    <text
                        x={-114} y={10}
                        textAnchor="start" fontSize={10}
                        fill={tech.status_color} fontWeight={500} fontFamily="sans-serif"
                    >
                        {tech?.attendance_status}
                    </text>
                )}
            </g>
        );
    };



    const chartData = buildChartData(technicians);
    // const now = getNowDecimal();
    const showNow = now >= DAY_START && now <= DAY_END;

    const maxBars = Math.max(...chartData.map((d) => d.bars.length));
    const BAR_KEYS = Array.from({ length: maxBars }, (_, i) => `b${i}`);

    const rows = chartData.map((tech) => {
        const row = { name: tech.name };
        tech.bars.forEach((bar, i) => {
            row[`b${i}`] = bar.value;
            row[`b${i}_meta`] = bar;
        });
        return row;
    });

    const TOTAL_HOURS = DAY_END - DAY_START;
    const xTicks = [];
    for (let h = 0; h <= TOTAL_HOURS; h++) xTicks.push(h);


    return (
        <div className="chart-controller-today-work-flow-container" >
            <div >
                <ResponsiveContainer width="100%" height={(technicians.length * 50) + 30}>
                    <BarChart
                        data={rows}
                        layout="vertical"
                        barSize={20}
                        barCategoryGap={8} >
                        <CartesianGrid
                            horizontal={false}
                            vertical={true}
                            stroke="var(--color-natural-trans-51)"
                            strokeDasharray="0"
                        />
                        <XAxis
                            type="number"
                            domain={[0, TOTAL_HOURS]}
                            ticks={xTicks}
                            tickFormatter={(v) => {
                                const realHour = v + DAY_START;
                                const ampm = realHour < 12 ? "AM" : "PM";
                                const h12 = realHour === 0 ? 12 : realHour > 12 ? realHour - 12 : realHour;
                                return `${h12}${ampm}`;
                            }}
                            tick={{ fontSize: 11, fill: "var(--text-secondary-1)", fontWeight: 500 }}
                            tickLine={false}
                            axisLine={{ stroke: "var(--border-light)" }}
                            interval={0}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={120}
                            tick={<CustomYAxisTick />}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-natural-trans-51)" }} />

                        {showNow && (
                            <ReferenceLine
                                x={now - DAY_START}
                                stroke="var(--color-warning-6)"
                                strokeWidth={1.5}
                                strokeDasharray="4 3"
                                label={false}
                            />
                        )}

                        {BAR_KEYS.map((key, i) => (
                            <Bar key={key} dataKey={key} stackId="stack" radius={i === 0 ? [3, 0, 0, 3] : i === maxBars - 1 ? [0, 3, 3, 0] : 0}
                                isAnimationActive={true} animationDuration={800 + i * 30} onMouseEnter={(data) => {
                                    const meta = data?.[`${key}_meta`];
                                    if (meta && meta.type !== "gap") hoveredSegmentRef.current = meta;
                                }}>
                                {rows.map((row, ri) => {
                                    const meta = row[`${key}_meta`];
                                    if (!meta || meta.type === "gap") {
                                        return <Cell key={ri} fill="transparent" />;
                                    }
                                    const tech = technicians.find((t) => t.worker_name === row.name);

                                    if (meta.type === "travel") {
                                        return (
                                            <Cell
                                                key={ri}
                                                fill={tech.color}
                                                opacity={0.3}
                                                stroke={tech.color}
                                                strokeWidth={0.5}
                                                strokeDasharray="3 2"
                                                radius={[10, 0, 0, 10]}
                                                height={20}
                                            />
                                        );
                                    }
                                    return (
                                        <Cell
                                            key={ri}
                                            fill={tech.color}
                                            opacity={0.85}
                                            stroke={tech.color}
                                            strokeWidth={0.5}
                                            radius={meta.status === "Completed" ? [0, 10, 10, 0] : [0, 0, 0, 0]}
                                            height={20}
                                        />
                                    );
                                })}
                            </Bar>
                        ))}

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div >
    )
}

export default TodayWorkFlow


//?  technicians array object formate
// {
//      worker_uuid,
//      worker_name,
//      attendance_status,
//      color: chartLabelColors[i],
//      status_color: w?.status === 'PENDING' ? 'yellow' : w?.status === "IN" ? 'green' : "red"
// }

//? Work array object formate
// {
//  techId: w?.technician_uuid,
//                 id: w?.customer_id,
//                 label: `${w?.customer_id} - ${w?.customer_name}`,
//                 travelStart: w?.pickup_work_at ? isoToDecimalHour(w?.pickup_work_at) : null,
//                 workStart: w?.start_work_at ? isoToDecimalHour(w?.start_work_at) : null,
//                 workClose: w?.end_work_at ? isoToDecimalHour(w?.end_work_at) : null,
// }