"use client";

import React, { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartTooltipRow } from "./ChartPreview";
import {
  CHART_FONT,
  dashArray,
  gridDashArray,
  toNumber,
} from "./chartTheme";

const CURVE_TYPES = {
  straight: "linear",
  smooth: "monotone",
  stepAfter: "stepAfter",
  stepBefore: "stepBefore",
  stepMiddle: "stepMiddle",
};

export default function LineChartView({ categories, series, config }) {
  const uid = useId().replace(/:/g, "");
  const {
    lineStyle = "smooth",
    lineWidth = 2.5,
    lineOpacity = 1,
    showMarkers = true,
    markerShape = "circle",
    markerSize = 4,
    markerFilled = true,
    markerBorderWidth = 2,
    showArea = true,
    areaOpacity = 0.16,
    areaGradient = true,
    stacked = false,
    pointPadding = 5,
    showValueAxis = true,
    showCategoryAxis = true,
    showGridlines = true,
    gridStyle = "dashed",
    zeroBaseline = true,
    tickCount = 5,
    autoScale = true,
    manualMin = 0,
    manualMax = 150,
    categoryLabelAngle = 0,
    axisTitleCategory = "",
    axisTitleValue = "",
    labelFormat = "none",
    labelPosition = "above",
    textColor = "#0f172a",
    mutedColor = "#64748b",
    gridColor = "#e2e8f0",
    axisColor = "#94a3b8",
    bgColor = "#ffffff",
    transparentBg = false,
    formatLabel,
    formatTick,
    formatTooltip,
  } = config;

  const data = categories.map((category, index) => {
    const label =
      typeof category === "string"
        ? category
        : category?.label ?? category?.name ?? "";
    const row = { category: label, __index: index };
    series.forEach((s) => {
      const raw = s.values?.[index];
      const number = toNumber(raw, null);
      row[s.id] = number == null ? (stacked ? 0 : null) : number;
    });
    return row;
  });

  const allValues = series.flatMap((s) =>
    s.values.map((v) => toNumber(v, null)).filter((v) => v != null)
  );
  const minValue = allValues.length ? Math.min(...allValues) : 0;
  const maxValue = allValues.length ? Math.max(...allValues) : 0;

  const domain = (() => {
    if (!autoScale) {
      const low = Number(manualMin);
      const high = Number(manualMax);
      if (Number.isFinite(low) && Number.isFinite(high) && high > low) {
        return [low, high];
      }
    }
    const low = zeroBaseline ? Math.min(0, minValue) : minValue < 0 ? minValue : 0;
    const high = maxValue > 0 ? maxValue * 1.04 : minValue < 0 ? 0 : 1;
    return [low, high];
  })();

  const curve = CURVE_TYPES[lineStyle] ?? "monotone";
  const tickAngle = -Math.abs(categoryLabelAngle);
  const tickAnchor =
    tickAngle !== 0
      ? categoryLabelAngle > 0
        ? "end"
        : "start"
      : "middle";

  function makeMarkerDot(seriesItem) {
    function MarkerDotForSeries(props) {
      return (
        <MarkerDot
          {...props}
          color={seriesItem.color}
          shape={markerShape}
          size={markerSize}
          filled={markerFilled}
          borderWidth={markerBorderWidth}
          backgroundColor={transparentBg ? "#ffffff" : bgColor}
        />
      );
    }
    return MarkerDotForSeries;
  }

  return (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
      style={{ fontFamily: CHART_FONT }}
    >
      <ComposedChart
        data={data}
        margin={{
          top: labelFormat !== "none" && labelPosition === "above" ? 24 : 12,
          right: 18,
          bottom: tickAngle ? 48 : 12,
          left: axisTitleValue ? 8 : 0,
        }}
      >
        <defs>
          {showArea &&
            series.map((s, index) =>
              areaGradient ? (
                <linearGradient
                  key={s.id}
                  id={`line-area-${uid}-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ) : null
            )}
        </defs>

        <CartesianGrid
          horizontal={showGridlines}
          vertical={showGridlines}
          stroke={gridColor}
          strokeDasharray={gridDashArray(gridStyle)}
        />

        <XAxis
          dataKey="category"
          hide={!showCategoryAxis}
          tick={{ fill: mutedColor, fontSize: 11, fontFamily: CHART_FONT }}
          tickLine={false}
          axisLine={{ stroke: axisColor, strokeWidth: 1 }}
          interval={data.length > 12 ? "preserveStartEnd" : 0}
          angle={tickAngle}
          textAnchor={tickAnchor}
          height={tickAngle ? 54 : 30}
          padding={{ left: pointPadding * 2, right: pointPadding * 2 }}
          label={
            axisTitleCategory
              ? {
                  value: axisTitleCategory,
                  position: "insideBottom",
                  offset: tickAngle ? -42 : -4,
                  fill: mutedColor,
                  fontSize: 11,
                }
              : undefined
          }
        />
        <YAxis
          hide={!showValueAxis}
          domain={domain}
          tickCount={tickCount}
          tick={{ fill: mutedColor, fontSize: 11, fontFamily: CHART_FONT }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatTick}
          width={62}
          label={
            axisTitleValue
              ? {
                  value: axisTitleValue,
                  angle: -90,
                  position: "insideLeft",
                  fill: mutedColor,
                  fontSize: 11,
                  style: { textAnchor: "middle" },
                }
              : undefined
          }
        />

        <ChartTooltip
          cursor={{ stroke: axisColor, strokeDasharray: "4 4", opacity: 0.7 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name, item) => (
                <ChartTooltipRow
                  color={item?.color || item?.stroke || item?.payload?.color}
                  label={name}
                  value={formatTooltip ? formatTooltip(value) : value}
                />
              )}
            />
          }
        />

        {series.map((s, index) => {
          const common = {
            dataKey: s.id,
            name: s.name,
            type: curve,
            stroke: s.color,
            strokeWidth: lineWidth,
            strokeOpacity: lineOpacity,
            strokeDasharray: dashArray(s.dash || "solid"),
            stackId: stacked ? "line-stack" : undefined,
            connectNulls: false,
            isAnimationActive: false,
            activeDot: false,
          };

          const label =
            labelFormat !== "none" ? (
              <LabelList
                dataKey={s.id}
                position="top"
                content={(props) => (
                  <LineValueLabel
                    {...props}
                    position={labelPosition}
                    textColor={textColor}
                    formatLabel={formatLabel}
                  />
                )}
              />
            ) : null;

          if (showArea) {
            return (
              <Area
                key={s.id}
                {...common}
                fill={
                  areaGradient
                    ? `url(#line-area-${uid}-${index})`
                    : s.color
                }
                fillOpacity={areaOpacity}
                dot={
                  showMarkers && markerShape !== "none"
                    ? makeMarkerDot(s)
                    : false
                }
              >
                {label}
              </Area>
            );
          }

          return (
            <Line
              key={s.id}
              {...common}
              fill="none"
              dot={
                showMarkers && markerShape !== "none"
                  ? makeMarkerDot(s)
                  : false
              }
            >
              {label}
            </Line>
          );
        })}
      </ComposedChart>
    </ChartContainer>
  );
}

function MarkerDot({
  cx,
  cy,
  color,
  shape,
  size,
  filled,
  borderWidth,
  backgroundColor,
}) {
  if (cx == null || cy == null) return null;
  const fill = filled ? color : backgroundColor;
  const stroke = color;
  const strokeWidth = Math.max(0, borderWidth);
  const r = Math.max(1.5, size);

  if (shape === "square") {
    return (
      <rect
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        rx={1.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape === "diamond") {
    return (
      <polygon
        points={`${cx},${cy - r * 1.35} ${cx + r * 1.35},${cy} ${cx},${
          cy + r * 1.35
        } ${cx - r * 1.35},${cy}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape === "triangle") {
    return (
      <polygon
        points={`${cx},${cy - r * 1.25} ${cx + r * 1.15},${cy + r * 0.9} ${
          cx - r * 1.15
        },${cy + r * 0.9}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape === "cross") {
    return (
      <g stroke={stroke} strokeWidth={Math.max(1.5, strokeWidth)}>
        <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
        <line x1={cx - r} y1={cy + r} x2={cx + r} y2={cy - r} />
      </g>
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

function LineValueLabel({ viewBox, value, position, textColor, formatLabel }) {
  if (!viewBox || value == null) return null;
  const { x = 0, y = 0 } = viewBox;
  const text = formatLabel ? formatLabel(value) : String(value);
  if (!text) return null;

  const offset = position === "below" ? 15 : position === "center" ? 4 : -8;

  return (
    <text
      x={x}
      y={y + offset}
      textAnchor="middle"
      dominantBaseline={position === "center" ? "middle" : "auto"}
      fill={textColor}
      fontSize={10.5}
      fontWeight={700}
      fontFamily={CHART_FONT}
    >
      {text}
    </text>
  );
}
