"use client";

import React, { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartTooltipRow } from "./ChartPreview";
import { CHART_FONT, contrastColor, lighten } from "./chartTheme";

export default function BarChartView({ categories, series, config, grandTotal }) {
  const uid = useId().replace(/:/g, "");
  const {
    orientation = "vertical",
    mode = "grouped",
    barWidthPct = 66,
    groupGap = 6,
    cornerRadius = 4,
    gradient = true,
    barOpacity = 1,
    shadow = false,
    showValueAxis = true,
    showCategoryAxis = true,
    showGridlines = true,
    zeroBaseline = true,
    tickCount = 5,
    categoryLabelAngle = 0,
    axisTitleCategory = "",
    axisTitleValue = "",
    labelFormat = "value",
    labelPosition = "outside",
    textColor = "#0f172a",
    mutedColor = "#64748b",
    gridColor = "#e2e8f0",
    axisColor = "#94a3b8",
    bgColor = "#ffffff",
    formatLabel,
    formatTick,
    formatTooltip,
  } = config;

  const vertical = orientation === "vertical";
  const values = series.flatMap((s) =>
    s.values.map((v) => Number(v) || 0)
  );
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const domainMin = zeroBaseline ? Math.min(0, minValue) : "auto";
  const domainMax = maxValue > 0 ? "auto" : 1;

  const data = categories.map((category, index) => {
    const label =
      typeof category === "string"
        ? category
        : category?.label ?? category?.name ?? "";
    const row = { category: label, __index: index };
    series.forEach((s) => {
      row[s.id] = Number(s.values?.[index]) || 0;
    });
    return row;
  });

  const xTick = {
    fill: mutedColor,
    fontSize: 11,
    fontFamily: CHART_FONT,
  };
  const yTick = { ...xTick };

  const tickAngle = vertical ? -Math.abs(categoryLabelAngle) : 0;
  const tickAnchor =
    tickAngle !== 0
      ? categoryLabelAngle > 0
        ? "end"
        : "start"
      : "middle";

  return (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
      style={{ fontFamily: CHART_FONT }}
    >
      <BarChart
        data={data}
        layout={vertical ? "horizontal" : "vertical"}
        margin={{
          top: labelPosition === "outside" ? 24 : 12,
          right: 18,
          bottom: tickAngle ? 48 : 12,
          left: axisTitleValue ? 8 : 0,
        }}
        barCategoryGap={`${Math.max(4, 100 - barWidthPct)}%`}
        barGap={Math.max(0, groupGap)}
      >
        <defs>
          <filter
            id={`bar-shadow-${uid}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="150%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              floodColor="#0f172a"
              floodOpacity="0.18"
            />
          </filter>
          {gradient &&
            series.map((s, index) => (
              <linearGradient
                key={s.id}
                id={`bar-grad-${uid}-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={lighten(s.color, 0.3)} />
                <stop offset="100%" stopColor={s.color} />
              </linearGradient>
            ))}
        </defs>

        {vertical ? (
          <>
            <CartesianGrid
              horizontal={showGridlines}
              vertical={false}
              stroke={gridColor}
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="category"
              hide={!showCategoryAxis}
              tick={xTick}
              tickLine={false}
              axisLine={{ stroke: axisColor, strokeWidth: 1 }}
              interval={data.length > 12 ? "preserveStartEnd" : 0}
              angle={tickAngle}
              textAnchor={tickAnchor}
              height={tickAngle ? 54 : 30}
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
              domain={[domainMin, domainMax]}
              tickCount={tickCount}
              tick={yTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatTick}
              width={56}
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
          </>
        ) : (
          <>
            <CartesianGrid
              horizontal={false}
              vertical={showGridlines}
              stroke={gridColor}
              strokeDasharray="3 4"
            />
            <XAxis
              type="number"
              hide={!showValueAxis}
              domain={[domainMin, domainMax]}
              tickCount={tickCount}
              tick={xTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatTick}
              height={30}
              label={
                axisTitleValue
                  ? {
                      value: axisTitleValue,
                      position: "insideBottom",
                      offset: -6,
                      fill: mutedColor,
                      fontSize: 11,
                    }
                  : undefined
              }
            />
            <YAxis
              dataKey="category"
              type="category"
              hide={!showCategoryAxis}
              tick={yTick}
              tickLine={false}
              axisLine={{ stroke: axisColor, strokeWidth: 1 }}
              interval={data.length > 14 ? "preserveStartEnd" : 0}
              width={90}
              label={
                axisTitleCategory
                  ? {
                      value: axisTitleCategory,
                      angle: -90,
                      position: "insideLeft",
                      fill: mutedColor,
                      fontSize: 11,
                      style: { textAnchor: "middle" },
                    }
                  : undefined
              }
            />
          </>
        )}

        <ChartTooltip
          cursor={{ fill: gridColor, opacity: 0.35 }}
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

        {series.map((s, seriesIndex) => (
          <Bar
            key={s.id}
            dataKey={s.id}
            name={s.name}
            fill={s.color}
            stackId={mode === "stacked" ? "stack" : undefined}
            radius={Math.max(0, cornerRadius)}
            maxBarSize={64}
            isAnimationActive={false}
            shape={(props) => (
              <BarShape
                {...props}
                uid={uid}
                seriesIndex={seriesIndex}
                color={s.color}
                gradient={gradient}
                opacity={barOpacity}
                shadow={shadow}
                radius={cornerRadius}
              />
            )}
          >
            {labelFormat !== "none" && (
              <LabelList
                dataKey={s.id}
                content={(props) => (
                  <BarValueLabel
                    {...props}
                    vertical={vertical}
                    color={s.color}
                    position={labelPosition}
                    textColor={textColor}
                    formatLabel={formatLabel}
                  />
                )}
              />
            )}
          </Bar>
        ))}
        {!series.length || !categories.length ? null : null}
      </BarChart>
    </ChartContainer>
  );
}

function BarShape({
  x,
  y,
  width,
  height,
  uid,
  seriesIndex,
  color,
  gradient,
  opacity,
  shadow,
  radius,
}) {
  if (width == null || height == null || width <= 0 || height <= 0) {
    return null;
  }

  return (
    <g
      opacity={opacity}
      filter={shadow ? `url(#bar-shadow-${uid})` : undefined}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={Math.max(0, radius)}
        ry={Math.max(0, radius)}
        fill={
          gradient ? `url(#bar-grad-${uid}-${seriesIndex})` : color
        }
      />
    </g>
  );
}

function BarValueLabel({
  viewBox,
  value,
  vertical,
  color,
  position,
  textColor,
  formatLabel,
}) {
  if (!viewBox || value == null) return null;
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox;
  const negative = Number(value) < 0;
  const text = formatLabel ? formatLabel(value) : String(value);
  if (!text) return null;

  let labelX;
  let labelY;
  let anchor = "middle";
  let baseline = "auto";

  if (vertical) {
    if (position === "inside") {
      labelX = x + width / 2;
      labelY = negative ? y + 9 : y + height - 7;
    } else if (position === "center") {
      labelX = x + width / 2;
      labelY = y + height / 2;
      baseline = "middle";
    } else {
      labelX = x + width / 2;
      labelY = negative ? y + height + 14 : y - 7;
    }
  } else if (position === "inside") {
    labelX = negative ? x + 7 : x + width - 7;
    labelY = y + height / 2;
    anchor = negative ? "start" : "end";
    baseline = "middle";
  } else if (position === "center") {
    labelX = x + width / 2;
    labelY = y + height / 2;
    baseline = "middle";
  } else {
    labelX = negative ? x - 7 : x + width + 7;
    labelY = y + height / 2;
    anchor = negative ? "end" : "start";
    baseline = "middle";
  }

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor={anchor}
      dominantBaseline={baseline}
      fill={position === "outside" ? textColor : contrastColor(color)}
      fontSize={10.5}
      fontWeight={700}
      fontFamily={CHART_FONT}
    >
      {text}
    </text>
  );
}
