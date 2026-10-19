"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { CHART_FONT, dashArray } from "./chartTheme";

// A small, dependency-free legend that gives us reliable placement on every
// screen size (Recharts' own legend cannot sit outside the responsive
// container). The same item data is reused by the SVG/PNG export helpers.
export function ChartLegendList({
  items = [],
  position = "bottom",
  textColor = "#0f172a",
  mutedColor = "#64748b",
  showValues = false,
  className,
  onItemMouseEnter,
  onItemMouseLeave,
}) {
  const visible = items.filter((item) => item.visible !== false);
  if (!visible.length) return null;

  const vertical = position === "left" || position === "right";

  return (
    <ul
      className={cn(
        "flex list-none gap-x-4 gap-y-2",
        vertical
          ? "flex-col items-stretch"
          : "flex-row flex-wrap items-center justify-center",
        className
      )}
    >
      {visible.map((item) => (
        <li
          key={item.id ?? item.label}
          className={cn(
            "flex min-w-0 items-center gap-2 text-[11.5px] leading-none",
            vertical && "w-full"
          )}
          onMouseEnter={
            onItemMouseEnter ? () => onItemMouseEnter(item.id) : undefined
          }
          onMouseLeave={onItemMouseLeave ? () => onItemMouseLeave() : undefined}
        >
          <LegendMarker item={item} />
          <span
            className={cn(
              "truncate font-medium",
              vertical ? "min-w-0 flex-1" : "max-w-[180px]"
            )}
            style={{ color: mutedColor }}
            title={String(item.label ?? "")}
          >
            {item.label}
          </span>
          {showValues && item.value != null && (
            <span
              className="ml-auto shrink-0 font-mono text-[11px] font-semibold tabular-nums"
              style={{ color: textColor }}
            >
              {item.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function LegendMarker({ item }) {
  const color = item.color || "#64748b";
  const isLine = item.kind === "line" || (item.dash && item.dash !== "solid");

  if (isLine) {
    return (
      <svg
        width="15"
        height="8"
        viewBox="0 0 15 8"
        aria-hidden="true"
        className="shrink-0"
      >
        <line
          x1="1"
          y1="4"
          x2="14"
          y2="4"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray={dashArray(item.dash)}
        />
        {item.kind === "line" && (
          <circle cx="7.5" cy="4" r="2.1" fill={color} />
        )}
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
      style={{ backgroundColor: color }}
    />
  );
}

// Row used inside shadcn's ChartTooltipContent. Returning the complete row
// from the formatter keeps every tooltip aligned across all six tools.
export function ChartTooltipRow({ color, label, value, detail }) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color || "#64748b" }}
      />
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      {detail ? (
        <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground/80">
          {detail}
        </span>
      ) : null}
      <span
        className={cn(
          "shrink-0 font-mono text-[11px] font-semibold tabular-nums text-foreground",
          !detail && "ml-auto"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function EmptyChart({ children, label = "No data to display yet" }) {
  return (
    <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      {children}
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

const ChartPreview = forwardRef(function ChartPreview(
  {
    title,
    subtitle,
    legendItems = [],
    legendPosition = "bottom",
    showLegendValues = false,
    bgColor = "#ffffff",
    transparentBg = false,
    textColor = "#0f172a",
    mutedColor = "#64748b",
    width = 760,
    height = 520,
    empty = false,
    emptyLabel,
    emptyIcon,
    children,
    className,
    contentClassName,
  },
  ref
) {
  const hasLegend = legendPosition !== "none" && legendItems.length > 0;
  const sideLegend = legendPosition === "left" || legendPosition === "right";
  const hasHeader = Boolean(title || subtitle);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden transition-colors",
        className
      )}
      style={{
        backgroundColor: transparentBg ? "transparent" : bgColor,
        fontFamily: CHART_FONT,
        color: textColor,
      }}
    >
      {hasHeader && (
        <div className="px-4 pb-1 pt-4 text-center sm:px-6 sm:pt-5">
          {title ? (
            <h3 className="text-base font-bold tracking-tight sm:text-lg">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p
              className="mt-0.5 text-[11px] leading-snug sm:text-xs"
              style={{ color: mutedColor }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      )}

      {hasLegend && legendPosition === "top" && (
        <div className="px-4 pb-1 pt-3 sm:px-6">
          <ChartLegendList
            items={legendItems}
            position="top"
            textColor={textColor}
            mutedColor={mutedColor}
            showValues={showLegendValues}
          />
        </div>
      )}

      <div
        className={cn(
          "px-3 pb-3 sm:px-5 sm:pb-4",
          hasHeader ? "pt-2" : "pt-4"
        )}
      >
        {sideLegend ? (
          // Only one chart instance may be mounted here: a second, CSS-hidden
          // canvas measures 0x0 and makes Recharts warn on every render. The
          // legend is cheap, so it can be duplicated per breakpoint instead.
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {legendPosition === "left" && (
              <div className="hidden w-[170px] shrink-0 sm:block">
                <ChartLegendList
                  items={legendItems}
                  position="left"
                  textColor={textColor}
                  mutedColor={mutedColor}
                  showValues={showLegendValues}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <ChartCanvas
                width={width}
                height={height}
                empty={empty}
                emptyLabel={emptyLabel}
                emptyIcon={emptyIcon}
                className={contentClassName}
              >
                {children}
              </ChartCanvas>
            </div>
            {legendPosition === "right" && (
              <div className="hidden w-[170px] shrink-0 sm:block">
                <ChartLegendList
                  items={legendItems}
                  position="right"
                  textColor={textColor}
                  mutedColor={mutedColor}
                  showValues={showLegendValues}
                />
              </div>
            )}
            <div className="sm:hidden">
              <ChartLegendList
                items={legendItems}
                position="bottom"
                textColor={textColor}
                mutedColor={mutedColor}
                showValues={showLegendValues}
              />
            </div>
          </div>
        ) : (
          <ChartCanvas
            width={width}
            height={height}
            empty={empty}
            emptyLabel={emptyLabel}
            emptyIcon={emptyIcon}
            className={contentClassName}
          >
            {children}
          </ChartCanvas>
        )}
      </div>

      {hasLegend && legendPosition === "bottom" && (
        <div className="px-4 pb-4 pt-0 sm:px-6">
          <ChartLegendList
            items={legendItems}
            position="bottom"
            textColor={textColor}
            mutedColor={mutedColor}
            showValues={showLegendValues}
          />
        </div>
      )}
    </div>
  );
});

function ChartCanvas({
  width,
  height,
  empty,
  emptyLabel,
  emptyIcon,
  children,
  className,
}) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        aspectRatio: `${Math.max(1, width)} / ${Math.max(1, height)}`,
        minHeight: 250,
      }}
    >
      {empty ? (
        <EmptyChart label={emptyLabel}>{emptyIcon}</EmptyChart>
      ) : (
        children
      )}
    </div>
  );
}

export default ChartPreview;
