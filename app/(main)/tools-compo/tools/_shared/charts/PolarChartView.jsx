"use client";

import React, { useId, useMemo } from "react";
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
import {
  CHART_FONT,
  contrastColor,
  lighten,
  polarPoint,
  ratioForValue,
  resolveScale,
  toNumber,
  truncateLabel,
} from "./chartTheme";

const OUTER_RADIUS_PERCENT = 64;
const CATEGORY_GAP = 18;
const VALUE_GAP = 14;
const TICK_GAP = 6;

export default function PolarChartView({ slices, metrics, config }) {
  const uid = useId().replace(/:/g, "");
  const {
    mode = "area",
    valueScale = "area",
    innerRatio = 0,
    gap = 2,
    cornerRadius = 0,
    startAngle = 0,
    direction = "cw",
    levels = 5,
    scaleMode = "auto",
    customMin = 0,
    customMax = 100,
    fillOpacity = 0.92,
    gradient = true,
    outline = true,
    strokeWidth = 1.5,
    shadow = false,
    transparentBg = false,
    bgColor = "#ffffff",
    formatValue,
    formatTooltip,
    labelTextFor,
  } = config;

  const scale = useMemo(
    () =>
      resolveScale({
        mode: scaleMode,
        levels,
        customMin,
        customMax,
        maxValue: Math.max(0, ...slices.map((s) => toNumber(s.value, 0))),
      }),
    [scaleMode, levels, customMin, customMax, slices]
  );

  const useArea = valueScale === "area";
  const total = metrics?.total ?? slices.reduce((a, s) => a + toNumber(s.value, 0), 0);

  const data = slices.map((slice, index) => ({
    ...slice,
    value: Math.max(0, toNumber(slice.value, 0)),
    angle: 1,
    __index: index,
  }));

  const rechartsStart = 90 - (Number(startAngle) || 0);
  const rechartsEnd = rechartsStart + (direction === "ccw" ? 360 : -360);
  const innerRadius = Math.max(0, Math.min(0.72, Number(innerRatio) || 0));

  const faint = transparentBg ? "none" : bgColor;

  return (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
      style={{ fontFamily: CHART_FONT }}
    >
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <filter id={`polar-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="4"
              floodColor="#0f172a"
              floodOpacity="0.22"
            />
          </filter>
          {gradient &&
            data.map((slice, index) => (
              <radialGradient
                key={slice.id}
                id={`polar-grad-${uid}-${index}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={lighten(slice.color, 0.4)} />
                <stop offset="100%" stopColor={slice.color} />
              </radialGradient>
            ))}
        </defs>

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              indicator="dot"
              formatter={(value, name, item) => {
                const payload = item?.payload ?? {};
                const percent =
                  total > 0 ? (toNumber(payload.value, 0) / total) * 100 : 0;
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
                    detail={`${percent.toFixed(1)}%`}
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
          innerRadius={`${innerRadius * 100}%`}
          startAngle={rechartsStart}
          endAngle={rechartsEnd}
          paddingAngle={data.length > 1 ? Math.max(0, Number(gap) || 0) : 0}
          cornerRadius={0}
          minAngle={0}
          stroke="none"
          label={false}
          labelLine={false}
          isAnimationActive={false}
          shape={(props) => (
            <PolarSector
              {...props}
              scale={scale}
              useArea={useArea}
              mode={mode}
              cornerRadius={cornerRadius}
              gradient={gradient}
              gradientIdPrefix={`polar-grad-${uid}`}
              fillOpacity={fillOpacity}
              outline={outline}
              strokeWidth={strokeWidth}
              shadow={shadow}
              shadowId={`polar-shadow-${uid}`}
              faint={faint}
            />
          )}
        >
          {data.map((slice) => (
            <Cell key={slice.id} fill={slice.color} />
          ))}
        </Pie>

        <PolarOverlay
          data={data}
          total={total}
          scale={scale}
          useArea={useArea}
          innerRatio={innerRadius}
          startAngle={Number(startAngle) || 0}
          direction={direction}
          showGrid={config.showGrid}
          showSpokes={config.showSpokes}
          showCategoryLabels={config.showCategoryLabels}
          showTickLabels={config.showTickLabels}
          showValueLabels={config.showValueLabels}
          showCenterTotal={config.showCenterTotal}
          labelFormat={config.labelFormat}
          labelPosition={config.labelPosition}
          textColor={config.textColor}
          mutedColor={config.mutedColor}
          gridColor={config.gridColor}
          axisColor={config.axisColor}
          bgColor={bgColor}
          transparentBg={transparentBg}
          formatTick={config.formatTick}
          formatValue={formatValue}
          labelTextFor={labelTextFor}
        />
      </PieChart>
    </ChartContainer>
  );
}

function PolarSector({
  cx,
  cy,
  innerRadius = 0,
  outerRadius = 0,
  startAngle,
  endAngle,
  payload,
  scale,
  useArea,
  mode,
  cornerRadius,
  gradient,
  gradientIdPrefix,
  fillOpacity,
  outline,
  strokeWidth,
  shadow,
  shadowId,
  faint,
}) {
  if (cx == null || cy == null || outerRadius <= 0) return null;
  const t = ratioForValue(payload?.value, scale, useArea);
  const valueRadius = innerRadius + (outerRadius - innerRadius) * t;
  const radius = Math.max(innerRadius + 0.4, valueRadius);
  const corner = mode === "bar" ? Math.max(0, Number(cornerRadius) || 0) : 0;

  return (
    <g filter={shadow ? `url(#${shadowId})` : undefined}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={radius}
        startAngle={startAngle}
        endAngle={endAngle}
        cornerRadius={corner}
        fill={
          gradient
            ? `url(#${gradientIdPrefix}-${payload?.__index ?? 0})`
            : payload?.color
        }
        fillOpacity={fillOpacity}
        stroke={outline ? lighten(payload?.color || "#64748b", 0.28) : faint}
        strokeWidth={outline ? strokeWidth : 0}
        strokeLinejoin="round"
      />
    </g>
  );
}

function PolarOverlay({
  data,
  total,
  scale,
  useArea,
  innerRatio,
  startAngle,
  direction,
  showGrid,
  showSpokes,
  showCategoryLabels,
  showTickLabels,
  showValueLabels,
  showCenterTotal,
  labelFormat,
  labelPosition,
  textColor,
  mutedColor,
  gridColor,
  axisColor,
  bgColor,
  transparentBg,
  formatTick,
  formatValue,
  labelTextFor,
}) {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  if (!width || !height || !data.length) return null;

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2;
  const outer = maxRadius * (OUTER_RADIUS_PERCENT / 100);
  const inner = Math.min(maxRadius, maxRadius * innerRatio);

  const radiusFor = (value) =>
    inner + (outer - inner) * ratioForValue(value, scale, useArea);

  const n = data.length;
  const step = 360 / n;
  const dir = direction === "ccw" ? -1 : 1;
  const midAngle = (index) => startAngle + dir * step * (index + 0.5);

  const halo = transparentBg ? "none" : bgColor;
  const rings = scale.ticks
    .map((value) => ({ value, r: radiusFor(value) }))
    .filter((ring) => ring.r > inner + 0.6);

  const maxLabelChars = Math.max(
    8,
    Math.floor((maxRadius - outer + CATEGORY_GAP * 2) / (11 * 0.56) + 6)
  );

  return (
    <g pointerEvents="none">
      {showGrid && (
        <>
          {rings.map((ring, index) => (
            <circle
              key={`ring-${index}`}
              cx={cx}
              cy={cy}
              r={ring.r}
              fill="none"
              stroke={index === rings.length - 1 ? axisColor : gridColor}
              strokeWidth={index === rings.length - 1 ? 1.4 : 1}
              strokeDasharray={index === rings.length - 1 ? undefined : "4 4"}
            />
          ))}
          {inner > 1 && (
            <circle
              cx={cx}
              cy={cy}
              r={inner}
              fill="none"
              stroke={axisColor}
              strokeWidth={1.4}
            />
          )}
        </>
      )}

      {showSpokes &&
        data.map((slice, index) => {
          const angle = startAngle + dir * step * index - (dir * step) / 2;
          const from = polarPoint(cx, cy, inner, angle);
          const to = polarPoint(cx, cy, outer, angle);
          return (
            <line
              key={`spoke-${slice.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={gridColor}
              strokeWidth={1}
            />
          );
        })}

      {showTickLabels &&
        rings.map((ring, index) => (
          <text
            key={`tick-${index}`}
            x={cx + TICK_GAP}
            y={cy - ring.r}
            textAnchor="start"
            dominantBaseline="middle"
            fontSize={10.5}
            fill={mutedColor}
            stroke={halo === "none" ? undefined : halo}
            strokeWidth={halo === "none" ? 0 : 1.25}
            paintOrder="stroke"
          >
            {formatTick ? formatTick(ring.value) : String(ring.value)}
          </text>
        ))}

      {showCategoryLabels &&
        data.map((slice, index) => {
          const angle = midAngle(index);
          const p = polarPoint(cx, cy, outer + CATEGORY_GAP, angle);
          const anchor = textAnchorFor(p.x - cx);
          const baseline = baselineFor(p.x - cx, p.y - cy);
          return (
            <text
              key={`cat-${slice.id}`}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline={baseline}
              fontSize={11.5}
              fontWeight={600}
              fill={textColor}
              stroke={halo === "none" ? undefined : halo}
              strokeWidth={halo === "none" ? 0 : 1.25}
              paintOrder="stroke"
            >
              {truncateLabel(slice.label, maxLabelChars)}
            </text>
          );
        })}

      {showValueLabels &&
        labelFormat !== "none" &&
        data.map((slice, index) => {
          const angle = midAngle(index);
          const valueRadius = Math.max(inner, radiusFor(slice.value));
          const outside = labelPosition === "outside";
          const p = outside
            ? polarPoint(cx, cy, valueRadius + VALUE_GAP, angle)
            : polarPoint(cx, cy, Math.max(inner + 10, inner + (valueRadius - inner) * 0.68), angle);
          const text = labelTextFor ? labelTextFor(slice) : "";
          if (!text) return null;
          return (
            <text
              key={`value-${slice.id}`}
              x={p.x}
              y={p.y}
              textAnchor={outside ? textAnchorFor(p.x - cx) : "middle"}
              dominantBaseline={outside ? baselineFor(p.x - cx, p.y - cy) : "middle"}
              fontSize={10.5}
              fontWeight={700}
              fill={outside ? textColor : contrastColor(slice.color)}
              stroke={outside && halo !== "none" ? halo : undefined}
              strokeWidth={outside && halo !== "none" ? 1.25 : 0}
              paintOrder="stroke"
            >
              {text}
            </text>
          );
        })}

      {showCenterTotal && innerRatio > 0.12 && (
        <g>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize={Math.min(26, Math.max(14, inner * 0.42))}
            fontWeight={800}
            fill={textColor}
          >
            {formatValue ? formatValue(total) : total}
          </text>
          <text
            x={cx}
            y={cy + Math.min(18, Math.max(12, inner * 0.26))}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            letterSpacing="0.12em"
            fill={mutedColor}
          >
            TOTAL
          </text>
        </g>
      )}

    </g>
  );
}

function textAnchorFor(dx) {
  if (dx > 6) return "start";
  if (dx < -6) return "end";
  return "middle";
}

function baselineFor(dx, dy) {
  if (Math.abs(dx) <= 6 && dy < -6) return "auto";
  if (Math.abs(dx) <= 6 && dy > 6) return "hanging";
  return "middle";
}
