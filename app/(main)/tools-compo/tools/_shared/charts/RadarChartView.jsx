"use client";

import React, { useId } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartTooltipRow } from "./ChartPreview";
import {
  CHART_FONT,
  lighten,
  niceMax,
  toNumber,
  truncateLabel,
} from "./chartTheme";

export default function RadarChartView({ axes, series, config }) {
  const uid = useId().replace(/:/g, "");
  const {
    filled = true,
    fillOpacity = 0.24,
    gradient = true,
    strokeWidth = 2.2,
    showPoints = true,
    pointRadius = 4,
    curved = false,
    shadow = false,
    gridShape = "polygon",
    levels = 5,
    showGrid = true,
    showOuterRing = true,
    showAxisLines = true,
    showAxisLabels = true,
    showTickLabels = true,
    startAngle = 0,
    direction = "cw",
    scaleMode = "auto",
    customMin = 0,
    customMax = 100,
    valueLabelFormat = "none",
    decimals = 0,
    textColor = "#0f172a",
    mutedColor = "#64748b",
    gridColor = "#e2e8f0",
    axisColor = "#cbd5e1",
    formatLabel,
    formatTick,
    formatTooltip,
  } = config;

  const rows = axes.map((axis, index) => {
    const row = {
      axis: typeof axis === "string" ? axis : axis?.label ?? "",
      __index: index,
    };
    series.forEach((s) => {
      row[s.id] = Math.max(0, toNumber(s.values?.[index], 0));
    });
    return row;
  });

  const values = series.flatMap((s) =>
    s.values.map((v) => Math.max(0, toNumber(v, 0)))
  );
  const valueMax = values.length ? Math.max(...values) : 0;

  const domainMax =
    scaleMode === "fixed100"
      ? 100
      : scaleMode === "custom"
        ? Math.max(Number(customMin) + 1, Number(customMax) || 100)
        : niceMax(valueMax, Math.max(2, levels));
  const domainMin = scaleMode === "custom" ? Number(customMin) || 0 : 0;

  const ringTicks = Array.from({ length: Math.max(2, levels) }, (_, index) => {
    const step = (domainMax - domainMin) / Math.max(2, levels);
    return domainMin + step * (index + 1);
  });

  const rechartsStart =
    90 - (direction === "cw" ? Number(startAngle) || 0 : -(Number(startAngle) || 0));
  const rechartsEnd = rechartsStart + (direction === "cw" ? -360 : 360);

  const angleForIndex = (index) =>
    rechartsStart + ((rechartsEnd - rechartsStart) * index) / Math.max(1, rows.length);

  return (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
      style={{ fontFamily: CHART_FONT }}
    >
      <RadarChart
        data={rows}
        cx="50%"
        cy="50%"
        outerRadius="72%"
        startAngle={rechartsStart}
        endAngle={rechartsEnd}
        margin={{ top: 24, right: 34, bottom: 20, left: 34 }}
      >
        <defs>
          <filter
            id={`radar-shadow-${uid}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="150%"
          >
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="4"
              floodColor="#0f172a"
              floodOpacity="0.22"
            />
          </filter>
          {gradient &&
            series.map((s, index) => (
              <radialGradient
                key={s.id}
                id={`radar-grad-${uid}-${index}`}
                cx="50%"
                cy="50%"
                r="60%"
              >
                <stop offset="0%" stopColor={lighten(s.color, 0.2)} />
                <stop offset="100%" stopColor={s.color} />
              </radialGradient>
            ))}
        </defs>

        {showGrid && (
          <PolarGrid
            gridType={gridShape === "circle" ? "circle" : "polygon"}
            stroke={gridColor}
            strokeDasharray="2 4"
            radialLines={showAxisLines}
          />
        )}

        <PolarAngleAxis
          dataKey="axis"
          tick={
            showAxisLabels
              ? (props) => (
                  <AngleTick
                    {...props}
                    textColor={textColor}
                  />
                )
              : false
          }
          tickLine={
            showAxisLines ? { stroke: axisColor, strokeWidth: 1 } : false
          }
          axisLine={showOuterRing ? { stroke: axisColor, strokeWidth: 1 } : false}
        />

        <PolarRadiusAxis
          angle={90}
          domain={[domainMin, domainMax]}
          ticks={ringTicks}
          tick={
            showTickLabels
              ? { fill: mutedColor, fontSize: 9.5, fontFamily: CHART_FONT }
              : false
          }
          tickFormatter={formatTick}
          axisLine={false}
          tickLine={false}
        />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name, item) => (
                <ChartTooltipRow
                  color={item?.color || item?.payload?.color}
                  label={name}
                  value={formatTooltip ? formatTooltip(value) : value}
                />
              )}
            />
          }
        />

        {series.map((s, index) => (
          <Radar
            key={s.id}
            name={s.name}
            dataKey={s.id}
            stroke={s.color}
            strokeWidth={strokeWidth}
            fill={
              filled
                ? gradient
                  ? `url(#radar-grad-${uid}-${index})`
                  : s.color
                : "none"
            }
            fillOpacity={filled ? fillOpacity : 0}
            isAnimationActive={false}
            activeDot={false}
            filter={shadow ? `url(#radar-shadow-${uid})` : undefined}
            shape={
              curved
                ? (props) => (
                    <CurvedRadarShape
                      {...props}
                      fill={
                        filled
                          ? gradient
                            ? `url(#radar-grad-${uid}-${index})`
                            : s.color
                          : "none"
                      }
                      fillOpacity={filled ? fillOpacity : 0}
                      stroke={s.color}
                      strokeWidth={strokeWidth}
                      filter={shadow ? `url(#radar-shadow-${uid})` : undefined}
                    />
                  )
                : undefined
            }
            dot={
              showPoints || valueLabelFormat !== "none"
                ? (props) => (
                    <RadarPoint
                      {...props}
                      color={s.color}
                      showPoint={showPoints && pointRadius > 0}
                      radius={pointRadius}
                      labelFormat={valueLabelFormat}
                      domainMax={domainMax}
                      decimals={decimals}
                      textColor={textColor}
                      angle={angleForIndex(props.index)}
                      formatLabel={formatLabel}
                    />
                  )
                : false
            }
          />
        ))}
      </RadarChart>
    </ChartContainer>
  );
}

function AngleTick({ x, y, cx, cy, payload, textColor }) {
  if (x == null || y == null) return null;
  const anchor =
    Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
  const label = truncateLabel(payload?.value ?? payload ?? "", 16);
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      fill={textColor}
      fontSize={11}
      fontWeight={600}
      fontFamily={CHART_FONT}
    >
      {label}
    </text>
  );
}

function RadarPoint({
  cx,
  cy,
  value,
  color,
  showPoint,
  radius,
  labelFormat,
  domainMax,
  decimals,
  textColor,
  angle,
  formatLabel,
}) {
  if (cx == null || cy == null) return null;
  const r = Math.max(1.5, radius);
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const offset = r + 9;
  const text = formatLabel ? formatLabel(value, domainMax) : "";
  const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";

  return (
    <g>
      {showPoint && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={color}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      )}
      {text && (
        <text
          x={cx + cos * offset}
          y={cy - Math.sin(rad) * offset}
          textAnchor={anchor}
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={600}
          fill={textColor}
          fontFamily={CHART_FONT}
        >
          {text}
        </text>
      )}
    </g>
  );
}

function smoothClosedPath(points) {
  if (!points?.length) return "";
  const n = points.length;
  if (n < 3) return "";
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < n; index += 1) {
    const p0 = points[(index - 1 + n) % n];
    const p1 = points[index];
    const p2 = points[(index + 1) % n];
    const p3 = points[(index + 2) % n];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return `${d} Z`;
}

function CurvedRadarShape({
  points,
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  filter,
}) {
  const path = smoothClosedPath(points);
  if (!path) return null;
  return (
    <path
      d={path}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      filter={filter}
    />
  );
}
