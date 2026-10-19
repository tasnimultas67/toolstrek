"use client";

import React, { useId, useMemo } from "react";
import {
  Funnel,
  FunnelChart,
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
  clamp,
  contrastColor,
  labelInkFor,
  lighten,
  roundedPolygonPath,
  toNumber,
  truncateLabel,
} from "./chartTheme";

const BAND_LIGHTEN = 0.3;
const LABEL_FONT_SIZE = 11.5;
const PLOT_PAD = 14;
const CONVERSION_PILL_H = 17;

export default function FunnelChartView({ stages, config }) {
  const uid = useId().replace(/:/g, "");

  return (
    <ChartContainer
      config={{}}
      className="aspect-auto h-full w-full"
      style={{ fontFamily: CHART_FONT }}
    >
      <FunnelChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              indicator="dot"
              formatter={(value, name, item) => {
                const stage = item?.payload ?? {};
                return (
                  <ChartTooltipRow
                    color={stage.color}
                    label={stage.label || name}
                    value={config.formatValue ? config.formatValue(stage.value) : stage.value}
                    detail={
                      config.percentTextFor
                        ? config.percentTextFor(stage)
                        : `${Number(stage.percentFirst || 0).toFixed(1)}%`
                    }
                  />
                );
              }}
            />
          }
        />
        <FunnelPlot stages={stages} config={config} uid={uid} />
      </FunnelChart>
    </ChartContainer>
  );
}

function FunnelPlot({ stages, config, uid }) {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;

  const geometry = useMemo(
    () =>
      computeGeometry({
        width,
        height,
        stages,
        shape: config.shape,
        orientation: config.orientation,
        gap: config.gap,
        cornerRadius: config.cornerRadius,
        minWidthPercent: config.minWidthPercent,
        endTaper: config.endTaper,
        labelPosition: config.labelPosition,
      }),
    [
      width,
      height,
      stages,
      config.shape,
      config.orientation,
      config.gap,
      config.cornerRadius,
      config.minWidthPercent,
      config.endTaper,
      config.labelPosition,
    ]
  );

  if (!geometry) return null;

  const data = stages.map((stage, index) => ({
    ...stage,
    __index: index,
    __plotValue: Math.max(toNumber(stage.value, 0), 0.0001),
  }));

  return (
    <>
      <defs>
        <filter id={`funnel-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="7"
            floodColor="#0f172a"
            floodOpacity="0.15"
          />
        </filter>
        {stages.map((stage, index) => (
          <linearGradient
            key={stage.id}
            id={`funnel-grad-${uid}-${index}`}
            x1="0"
            y1="0"
            x2={geometry.horizontal ? "1" : "0"}
            y2={geometry.horizontal ? "0" : "1"}
          >
            <stop offset="0%" stopColor={stage.color} />
            <stop offset="100%" stopColor={lighten(stage.color, BAND_LIGHTEN)} />
          </linearGradient>
        ))}
      </defs>

      <Funnel
        data={data}
        dataKey="__plotValue"
        nameKey="label"
        isAnimationActive={false}
        stroke="none"
        filter={config.shadow ? `url(#funnel-shadow-${uid})` : undefined}
        shape={(props) => (
          <FunnelStage
            {...props}
            uid={uid}
            geometry={geometry}
            gradient={config.gradient}
            stageOpacity={config.stageOpacity}
          />
        )}
      />

      <FunnelDecor geometry={geometry} config={config} />
    </>
  );
}

function FunnelStage({ payload, uid, geometry, gradient, stageOpacity }) {
  const segment = geometry.segments[payload?.__index];
  if (!segment) return null;
  const opacity = clamp(toNumber(stageOpacity, 100) / 100, 0, 1);

  return (
    <path
      d={segment.path}
      fill={
        gradient
          ? `url(#funnel-grad-${uid}-${payload?.__index ?? 0})`
          : segment.color
      }
      fillOpacity={opacity}
      stroke={segment.highlighted ? contrastColor(segment.color) : "transparent"}
      strokeWidth={segment.highlighted ? 2.5 : 0}
      strokeLinejoin="round"
    />
  );
}

function FunnelDecor({ geometry, config }) {
  const { segments, conversions, outside, horizontal } = geometry;
  const {
    gradient = true,
    labelFormat = "nameValue",
    labelPosition = "inside",
    showConversion = true,
    textColor = "#0f172a",
    mutedColor = "#64748b",
    transparentBg = false,
    bgColor = "#ffffff",
    labelTextFor,
    conversionTextFor,
  } = config;

  return (
    <g pointerEvents="none">
      {labelFormat !== "none" && labelPosition === "inside" && (
        <g>
          {segments.map((segment) => {
            const band = gradient
              ? [segment.color, lighten(segment.color, BAND_LIGHTEN)]
              : [segment.color];
            const { fill, halo } = labelInkFor(band);
            const text = labelTextFor ? labelTextFor(segment) : "";
            if (!text) return null;
            return (
              <text
                key={`label-${segment.id}`}
                x={segment.center.x}
                y={segment.center.y + 4}
                textAnchor="middle"
                fontSize={LABEL_FONT_SIZE}
                fontWeight={700}
                fill={fill}
                stroke={halo || undefined}
                strokeWidth={halo ? 1.5 : 0}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {truncateLabel(text, segment.insideMaxChars)}
              </text>
            );
          })}
        </g>
      )}

      {labelFormat !== "none" && outside && (
        <g>
          {segments.map((segment) => {
            const text = labelTextFor ? labelTextFor(segment) : "";
            if (!text) return null;
            const label = segment.labelOutside;
            const end = horizontal
              ? `${label.x},${label.y - 8}`
              : `${label.x - 6},${label.y}`;
            const maxChars = horizontal
              ? Math.max(
                  8,
                  Math.floor(((segment.endLen - segment.startLen) * 1.7) / 6.3)
                )
              : Math.max(8, Math.floor((geometry.width - label.x - 8) / 6.3));
            return (
              <g key={`outside-${segment.id}`}>
                <polyline
                  points={`${label.edge.x},${label.edge.y} ${end}`}
                  fill="none"
                  stroke={mutedColor}
                  strokeWidth={1.2}
                />
                <circle
                  cx={label.edge.x}
                  cy={label.edge.y}
                  r={2.4}
                  fill={segment.color}
                />
                <text
                  x={label.x}
                  y={label.y + 4}
                  textAnchor={label.anchor}
                  fontSize={12}
                  fontWeight={600}
                  fill={textColor}
                >
                  {truncateLabel(text, maxChars)}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {showConversion &&
        conversions.map((conversion) => {
          const text = conversionTextFor ? conversionTextFor(conversion.stage) : "";
          if (!text) return null;
          const pillW = Math.max(38, text.length * 6.2 + 16);
          return (
            <g key={`conversion-${conversion.index}`}>
              <rect
                x={conversion.x - pillW / 2}
                y={conversion.y - CONVERSION_PILL_H / 2}
                width={pillW}
                height={CONVERSION_PILL_H}
                rx={CONVERSION_PILL_H / 2}
                fill={transparentBg ? "rgba(148,163,184,0.24)" : bgColor}
                stroke="rgba(100,116,139,0.45)"
                strokeWidth={1}
              />
              <text
                x={conversion.x}
                y={conversion.y + 3.5}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight={700}
                fill={mutedColor}
              >
                {text}
              </text>
            </g>
          );
        })}
    </g>
  );
}

function computeGeometry({
  width,
  height,
  stages = [],
  shape = "funnel",
  orientation = "vertical",
  gap = 6,
  cornerRadius = 6,
  minWidthPercent = 12,
  endTaper = 0.6,
  labelPosition = "inside",
}) {
  const n = stages.length;
  if (!(width > 0) || !(height > 0) || !n) return null;

  const horizontal = orientation === "horizontal";
  const effectiveGap = shape === "steps" ? 0 : Math.max(0, toNumber(gap, 0));
  const outside = labelPosition === "outside";
  const rightGutter =
    outside && !horizontal ? Math.min(180, Math.max(96, width * 0.32)) : 0;
  const bottomGutter = outside && horizontal ? 54 : 0;

  const plotLeft = PLOT_PAD;
  const plotTop = PLOT_PAD;
  const plotWidth = Math.max(60, width - PLOT_PAD * 2 - rightGutter);
  const plotHeight = Math.max(60, height - PLOT_PAD * 2 - bottomGutter);

  const maxAcross = Math.max(40, horizontal ? plotHeight : plotWidth);
  const lengthAvailable = horizontal ? plotWidth : plotHeight;
  const bandLen = Math.max(5, (lengthAvailable - effectiveGap * (n - 1)) / n);
  const acrossCenter = horizontal
    ? plotTop + plotHeight / 2
    : plotLeft + plotWidth / 2;
  const lengthStart = horizontal ? plotLeft : plotTop;

  const minFrac = clamp(toNumber(minWidthPercent, 12) / 100, 0, 0.9);
  const taper = clamp(toNumber(endTaper, 0.6), 0.05, 1);
  const radius = Math.max(0, toNumber(cornerRadius, 0));

  const sizeOf = (stage) =>
    maxAcross * (minFrac + (1 - minFrac) * clamp(toNumber(stage.norm, 0), 0, 1));

  const segments = stages.map((stage, index) => {
    const size = sizeOf(stage);
    const nextSize =
      index < n - 1
        ? sizeOf(stages[index + 1])
        : size * (shape === "funnel" ? taper : 1);

    const startLen = lengthStart + index * (bandLen + effectiveGap);
    const endLen = startLen + bandLen;
    const midLen = (startLen + endLen) / 2;

    const startSize = size;
    const endSize = shape === "funnel" ? nextSize : size;
    const halfStart = startSize / 2;
    const halfEnd = endSize / 2;
    const halfAtMid = (halfStart + halfEnd) / 2;

    const points = horizontal
      ? [
          { x: startLen, y: acrossCenter - halfStart },
          { x: endLen, y: acrossCenter - halfEnd },
          { x: endLen, y: acrossCenter + halfEnd },
          { x: startLen, y: acrossCenter + halfStart },
        ]
      : [
          { x: acrossCenter - halfStart, y: startLen },
          { x: acrossCenter + halfStart, y: startLen },
          { x: acrossCenter + halfEnd, y: endLen },
          { x: acrossCenter - halfEnd, y: endLen },
        ];

    const center = horizontal
      ? { x: midLen, y: acrossCenter }
      : { x: acrossCenter, y: midLen };

    const insideWidth = horizontal ? bandLen : (startSize + endSize) / 2;

    const labelOutside = horizontal
      ? {
          x: midLen,
          y: Math.min(height - PLOT_PAD - 6, plotTop + plotHeight + 18 + (index % 2) * 16),
          anchor: "middle",
          edge: { x: midLen, y: acrossCenter + halfAtMid },
        }
      : {
          x: Math.min(width - PLOT_PAD - 4, plotLeft + plotWidth + 14),
          y: midLen,
          anchor: "start",
          edge: { x: acrossCenter + halfAtMid, y: midLen },
        };

    return {
      ...stage,
      index,
      points,
      path: roundedPolygonPath(points, radius),
      center,
      startLen,
      endLen,
      midLen,
      labelInside: center,
      labelOutside,
      insideMaxChars: Math.max(
        6,
        Math.floor((insideWidth - 12) / (LABEL_FONT_SIZE * 0.56))
      ),
    };
  });

  const conversions = segments.slice(0, -1).map((segment, index) => ({
    index,
    stage: stages[index + 1],
    x: horizontal ? segment.endLen + effectiveGap / 2 : acrossCenter,
    y: horizontal ? acrossCenter : segment.endLen + effectiveGap / 2,
  }));

  return {
    width,
    height,
    horizontal,
    outside,
    plotLeft,
    plotTop,
    plotWidth,
    plotHeight,
    segments,
    conversions,
  };
}
