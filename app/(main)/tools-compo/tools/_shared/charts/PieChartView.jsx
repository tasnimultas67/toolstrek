"use client";

import React, { useId } from "react";
import {
  Cell,
  Pie,
  PieChart,
  Sector,
  useChartHeight,
  useChartWidth,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartTooltipRow } from "./ChartPreview";
import { CHART_FONT, contrastColor } from "./chartTheme";

const OUTER_RADIUS_PERCENT = 78;

export default function PieChartView({ slices, total, config }) {
  const uid = useId().replace(/:/g, "");
  const {
    chartType = "pie",
    innerRadius = 58,
    startAngle = 0,
    clockwise = true,
    gapAngle = 2,
    cornerRadius = 0,
    explodeDistance = 14,
    shadow = true,
    transparentBg = false,
    bgColor = "#ffffff",
    textColor = "#0f172a",
    mutedColor = "#64748b",
    labelFormat = "percent",
    labelPosition = "inside",
    centerLabel = "Total",
    showCenterValue = true,
    formatLabelText,
    formatValue,
    formatTooltip,
  } = config;

  const data = slices.map((slice, index) => ({
    ...slice,
    angle: 1,
    __index: index,
  }));

  const rechartsStart = 90 - (Number(startAngle) || 0);
  const rechartsEnd = rechartsStart + (clockwise ? -360 : 360);
  const donut = chartType === "donut";

  return (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
      style={{ fontFamily: CHART_FONT }}
    >
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <filter
            id={`pie-shadow-${uid}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="7"
              floodColor="#0f172a"
              floodOpacity="0.18"
            />
          </filter>
        </defs>

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name, item) => {
                const payload = item?.payload ?? {};
                return (
                  <ChartTooltipRow
                    color={payload.color}
                    label={payload.label || name}
                    value={
                      formatTooltip
                        ? formatTooltip(payload.value)
                        : formatValue
                          ? formatValue(payload.value)
                          : payload.value
                    }
                    detail={`${Number(payload.percent || 0).toFixed(
                      config.decimals ?? 0
                    )}%`}
                  />
                );
              }}
            />
          }
        />

        <Pie
          data={data}
          dataKey="angle"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={`${OUTER_RADIUS_PERCENT}%`}
          innerRadius={
            donut
              ? `${(Number(innerRadius) / 100) * OUTER_RADIUS_PERCENT}%`
              : 0
          }
          startAngle={rechartsStart}
          endAngle={rechartsEnd}
          paddingAngle={data.length > 1 ? Math.max(0, gapAngle) : 0}
          cornerRadius={Math.max(0, cornerRadius)}
          minAngle={0}
          stroke={cornerRadius > 0 ? undefined : transparentBg ? "none" : bgColor}
          strokeWidth={cornerRadius > 0 ? 0 : 1}
          label={false}
          labelLine={false}
          isAnimationActive={false}
          shape={(props) => {
            const { midAngle = 0 } = props;
            const offset = props.payload?.exploded ? explodeDistance : 0;
            const dx = Math.cos((midAngle * Math.PI) / 180) * offset;
            const dy = -Math.sin((midAngle * Math.PI) / 180) * offset;
            return (
              <g
                transform={`translate(${dx}, ${dy})`}
                filter={
                  shadow ? `url(#pie-shadow-${uid})` : undefined
                }
              >
                <Sector
                  {...props}
                  cornerRadius={Math.max(0, cornerRadius)}
                  stroke={
                    cornerRadius > 0
                      ? props.payload?.color
                      : transparentBg
                        ? "none"
                        : bgColor
                  }
                  strokeWidth={cornerRadius > 0 ? cornerRadius * 1.2 : 1}
                />
              </g>
            );
          }}
        >
          {data.map((slice) => (
            <Cell key={slice.id} fill={slice.color} />
          ))}
        </Pie>

        <PieOverlay
          slices={data}
          total={total}
          donut={donut}
          innerRadius={innerRadius}
          startAngle={Number(startAngle) || 0}
          clockwise={clockwise}
          explodeDistance={explodeDistance}
          labelFormat={labelFormat}
          labelPosition={labelPosition}
          centerLabel={centerLabel}
          showCenterValue={showCenterValue}
          textColor={textColor}
          mutedColor={mutedColor}
          formatLabelText={formatLabelText}
          formatValue={formatValue}
        />
      </PieChart>
    </ChartContainer>
  );
}

function polar(cx, cy, radius, angle) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * radius,
    y: cy - Math.sin(rad) * radius,
  };
}

function PieOverlay({
  slices,
  total,
  donut,
  innerRadius,
  startAngle,
  clockwise,
  explodeDistance,
  labelFormat,
  labelPosition,
  centerLabel,
  showCenterValue,
  textColor,
  mutedColor,
  formatLabelText,
  formatValue,
}) {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  if (!width || !height || !slices.length) return null;

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2;
  const outerRadius = maxRadius * (OUTER_RADIUS_PERCENT / 100);
  const ringInner = donut
    ? (Math.min(100, Math.max(0, Number(innerRadius) || 0)) / 100) * outerRadius
    : 0;

  const n = slices.length;
  const step = 360 / n;
  const dir = clockwise ? -1 : 1;
  const midRadius = donut
    ? (ringInner + outerRadius) / 2
    : outerRadius * 0.62;

  const labelThreshold = 3;

  return (
    <g pointerEvents="none">
      {labelPosition === "inside" && labelFormat !== "none" && (
        <>
          {slices.map((slice, index) => {
            if (slice.percent < labelThreshold) return null;
            const offset = slice.exploded ? explodeDistance : 0;
            const mid = 90 - startAngle - dir * (index + 0.5) * step;
            const p = polar(cx, cy, midRadius + offset, mid);
            const text = formatLabelText ? formatLabelText(slice) : "";
            if (!text) return null;
            return (
              <text
                key={slice.id}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12.5}
                fontWeight={700}
                fill={contrastColor(slice.color)}
              >
                {text}
              </text>
            );
          })}
        </>
      )}

      {labelPosition === "outside" && labelFormat !== "none" && (
        <>
          {slices.map((slice, index) => {
            const offset = slice.exploded ? explodeDistance : 0;
            const mid = 90 - startAngle - dir * (index + 0.5) * step;
            const base = polar(cx, cy, outerRadius + 4 + offset, mid);
            const elbow = polar(cx, cy, outerRadius + 22 + offset, mid);
            const rightSide = Math.cos((mid * Math.PI) / 180) >= 0;
            const endX = elbow.x + (rightSide ? 14 : -14);
            const text = formatLabelText ? formatLabelText(slice) : "";
            if (!text) return null;

            return (
              <g key={slice.id}>
                <polyline
                  points={`${base.x},${base.y} ${elbow.x},${elbow.y} ${endX},${elbow.y}`}
                  fill="none"
                  stroke={mutedColor}
                  strokeWidth={1.2}
                />
                <circle cx={base.x} cy={base.y} r={2.4} fill={slice.color} />
                <text
                  x={endX + (rightSide ? 5 : -5)}
                  y={elbow.y + 4}
                  textAnchor={rightSide ? "start" : "end"}
                  fontSize={12}
                  fontWeight={600}
                  fill={textColor}
                >
                  {slice.label} · {text}
                </text>
              </g>
            );
          })}
        </>
      )}

      {donut && ringInner > 0 && (
        <>
          {showCenterValue && (
            <text
              x={cx}
              y={cy - (centerLabel ? 4 : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={Math.max(20, Math.min(32, outerRadius * 0.2))}
              fontWeight={800}
              fill={textColor}
            >
              {formatValue ? formatValue(total) : total}
            </text>
          )}
          {centerLabel && (
            <text
              x={cx}
              y={cy + (showCenterValue ? 24 : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={Math.max(10, Math.min(13, outerRadius * 0.09))}
              fontWeight={600}
              letterSpacing="0.6"
              fill={mutedColor}
            >
              {centerLabel}
            </text>
          )}
        </>
      )}
    </g>
  );
}
