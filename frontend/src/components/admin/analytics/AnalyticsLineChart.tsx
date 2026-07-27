interface ChartPoint {
  label: string;
  value: number;
}

interface AnalyticsLineChartProps {
  data: ChartPoint[];
  height?: number;
  emptyMessage?: string;
}

const AnalyticsLineChart = ({
  data,
  height = 240,
  emptyMessage = "No trend data is available for this period.",
}: AnalyticsLineChartProps) => {
  if (!data.length) {
    return (
      <div
        className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center text-sm text-zinc-500"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const width = 900;
  const paddingX = 35;
  const paddingY = 24;
  const values = data.map((point) =>
    Number.isFinite(point.value) ? point.value : 0,
  );
  const maximum = Math.max(...values, 1);
  const minimum = Math.min(...values, 0);
  const range = Math.max(maximum - minimum, 1);

  const points = data.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y =
      paddingY +
      ((maximum - point.value) / range) * (height - paddingY * 2);

    return { ...point, x, y };
  });

  const polyline = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${paddingX},${height - paddingY} ${polyline} ${
    width - paddingX
  },${height - paddingY}`;

  const labelIndexes = new Set([
    0,
    Math.floor((data.length - 1) / 2),
    data.length - 1,
  ]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <svg
        role="img"
        aria-label="Analytics trend chart"
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
      >
        <defs>
          <linearGradient id="analytics-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(251 191 36)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={paddingX}
            x2={width - paddingX}
            y1={height * ratio}
            y2={height * ratio}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        <polygon points={area} fill="url(#analytics-area)" />

        <polyline
          points={polyline}
          fill="none"
          stroke="rgb(251 191 36)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="rgb(24 24 27)"
              stroke="rgb(253 224 71)"
              strokeWidth="3"
            >
              <title>
                {point.label}: {point.value.toLocaleString("en-US")}
              </title>
            </circle>

            {labelIndexes.has(index) ? (
              <text
                x={point.x}
                y={height - 7}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === data.length - 1
                      ? "end"
                      : "middle"
                }
                fill="rgb(161 161 170)"
                fontSize="14"
              >
                {point.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AnalyticsLineChart;
