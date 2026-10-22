import { jsPDF } from "jspdf";
import {
  MODES,
  formatClock,
  formatDateLabel,
  formatDistance,
  formatDuration,
  formatSpeed,
  formatTimezoneShift,
  formatUtcOffset,
} from "./flightDurationData";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function safeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2013|\u2014|\u2212/g, "-")
    .replace(/\u2192/g, "to")
    .replace(/\u00b7/g, "|")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E]/g, "");
}

function addFooter(doc, pageNumber) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Generated with ToolsTrek Flight Duration Calculator",
    MARGIN,
    PAGE_HEIGHT - 10,
  );
  doc.text(`toolstrek.vercel.app/tools/flight-duration-calculator`, MARGIN, PAGE_HEIGHT - 6);
  doc.text(`Page ${pageNumber}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 6, { align: "right" });
}

export function createFlightPdf({ result, mode, settings, tripName }) {
  if (!result?.ok) {
    throw new Error("A valid itinerary is required to create a report.");
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { legs, connections, totals, warnings } = result;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  let pageNumber = 1;
  let y = 0;

  const newPage = () => {
    addFooter(doc, pageNumber);
    doc.addPage();
    pageNumber += 1;
    y = 20;
  };

  const ensureSpace = (needed) => {
    if (y + needed > PAGE_HEIGHT - 18) newPage();
  };

  const sectionTitle = (title) => {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(safeText(title), MARGIN, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;
  };

  const labelValue = (label, value) => {
    ensureSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const labelLines = doc.splitTextToSize(safeText(label).toUpperCase(), 54);
    doc.text(labelLines, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const valueLines = doc.splitTextToSize(safeText(value), CONTENT_WIDTH - 64);
    doc.text(valueLines, MARGIN + 62, y);
    y += Math.max(5.5, labelLines.length * 3.8, valueLines.length * 4.4);
  };

  // Header banner
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, PAGE_WIDTH, 34, "F");
  doc.setFillColor(13, 148, 136);
  doc.circle(PAGE_WIDTH - 14, 8, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(224, 242, 254);
  doc.text("TOOLSTREK TRAVEL TIMING STUDIO", MARGIN, 11);
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text("Flight Duration Report", MARGIN, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(224, 242, 254);
  const routeTitle = `${firstLeg.depAirport.code} to ${lastLeg.arrAirport.code}  |  ${firstLeg.depAirport.city} to ${lastLeg.arrAirport.city}`;
  doc.text(safeText(routeTitle), MARGIN, 27);
  y = 44;

  // Trip meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const modeLabel =
    mode === MODES.ARRIVAL
      ? "Arrival time mode"
      : mode === MODES.DEPARTURE
        ? "Departure time mode"
        : "Flight duration mode";
  doc.text(safeText(`${modeLabel}  |  Generated ${new Date().toLocaleDateString("en-US")}`), MARGIN, y);
  y += 8;

  if (tripName.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(safeText(tripName.trim()), MARGIN, y);
    y += 7;
  }

  // Headline summary
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 28, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text(
    mode === MODES.ARRIVAL
      ? "LOCAL ARRIVAL TIME"
      : mode === MODES.DEPARTURE
        ? "LOCAL DEPARTURE TIME"
        : settings.includeBuffersInHeadline
          ? "DOOR-TO-DOOR JOURNEY"
          : "GATE-TO-GATE JOURNEY",
    MARGIN + 6,
    y + 7,
  );
  doc.setFontSize(21);
  doc.setTextColor(15, 23, 42);
  const headlineValue =
    mode === MODES.ARRIVAL
      ? formatClock(lastLeg.arrParts.hour, lastLeg.arrParts.minute, settings.timeFormat)
      : mode === MODES.DEPARTURE
        ? formatClock(firstLeg.depParts.hour, firstLeg.depParts.minute, settings.timeFormat)
        : formatDuration(totals.headlineMinutes);
  doc.text(safeText(headlineValue), MARGIN + 6, y + 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const subline =
    mode === MODES.ARRIVAL
      ? `${formatDateLabel(lastLeg.arrParts)} | ${lastLeg.arrAirport.city} (${lastLeg.arrAirport.timezone})`
      : mode === MODES.DEPARTURE
        ? `${formatDateLabel(firstLeg.depParts)} | ${firstLeg.depAirport.city} (${firstLeg.depAirport.timezone})`
        : `${formatDuration(totals.flightMinutes)} flying | ${
            totals.layoverMinutes > 0
              ? `${formatDuration(totals.layoverMinutes)} on the ground`
              : "direct flight"
          } | ${totals.stops} stop${totals.stops === 1 ? "" : "s"}`;
  doc.text(safeText(subline), MARGIN + 6, y + 23);
  y += 36;

  // Summary numbers
  sectionTitle("Trip summary");
  labelValue("Flight time", formatDuration(totals.flightMinutes));
  labelValue("Layover time", totals.layoverMinutes > 0 ? formatDuration(totals.layoverMinutes) : "None");
  labelValue("Gate-to-gate", formatDuration(totals.gateToGateMinutes));
  labelValue("Door-to-door", formatDuration(totals.doorToDoorMinutes));
  labelValue(
    "Time-zone shift",
    `${formatTimezoneShift(totals.timezoneShiftMinutes)} (${formatUtcOffset(
      firstLeg.depOffsetMinutes,
    )} to ${formatUtcOffset(lastLeg.arrOffsetMinutes)})`,
  );
  labelValue(
    "Calendar shift",
    totals.dayShift === 0
      ? "Same calendar day"
      : `${totals.dayShift > 0 ? "+" : ""}${totals.dayShift} day${
          Math.abs(totals.dayShift) === 1 ? "" : "s"
        }`,
  );
  if (settings.showDistance && totals.distanceKm !== null) {
    labelValue("Great-circle distance", formatDistance(totals.distanceKm, settings.units));
  }
  if (settings.showDistance && totals.averageSpeedKmh !== null) {
    labelValue("Average air speed", formatSpeed(totals.averageSpeedKmh, settings.units));
  }
  y += 2;

  // Itinerary
  sectionTitle("Itinerary");
  legs.forEach((leg, index) => {
    ensureSpace(34);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 29, 2.5, 2.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const carrier = [leg.airline, leg.flightNumber].filter(Boolean).join(" ");
    doc.text(
      safeText(`Flight ${index + 1}: ${leg.depAirport.code} to ${leg.arrAirport.code}${carrier ? ` (${carrier})` : ""}`),
      MARGIN + 4,
      y + 1,
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      safeText(
        `${formatDateLabel(leg.depParts)} | ${formatClock(
          leg.depParts.hour,
          leg.depParts.minute,
          settings.timeFormat,
        )} ${leg.depAirport.timezone} (${formatUtcOffset(leg.depOffsetMinutes)})`,
      ),
      MARGIN + 4,
      y + 7,
    );
    doc.text(
      safeText(
        `${formatDateLabel(leg.arrParts)} | ${formatClock(
          leg.arrParts.hour,
          leg.arrParts.minute,
          settings.timeFormat,
        )} ${leg.arrAirport.timezone} (${formatUtcOffset(leg.arrOffsetMinutes)})`,
      ),
      MARGIN + 4,
      y + 12.5,
    );
    doc.setFont("helvetica", "bold");
    doc.setTextColor(3, 105, 161);
    const legMeta = [
      formatDuration(leg.durationMinutes),
      settings.showDistance && leg.distanceKm !== null
        ? formatDistance(leg.distanceKm, settings.units)
        : null,
      leg.dayShift !== 0 ? `${leg.dayShift > 0 ? "+" : ""}${leg.dayShift} day` : null,
    ]
      .filter(Boolean)
      .join("  |  ");
    doc.text(safeText(legMeta), MARGIN + 4, y + 19);
    y += 32;

    if (index < connections.length) {
      const connection = connections[index];
      ensureSpace(9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text(
        safeText(
          `Layover in ${connection.airport.city} (${connection.airport.code}): ${formatDuration(
            connection.minutes,
          )} - minimum ${connection.minimumMinutes} min (${connection.isInternational ? "international" : "domestic"})`,
        ),
        MARGIN + 4,
        y,
      );
      y += 7;
    }
  });

  // Buffers & settings
  sectionTitle("Planning settings");
  labelValue("Pre-departure buffer", `${totals.preBufferMinutes} minutes at the airport`);
  labelValue("Post-arrival buffer", `${totals.postBufferMinutes} minutes after landing`);
  labelValue("Minimum domestic connection", `${settings.minDomesticConnection} minutes`);
  labelValue("Minimum international connection", `${settings.minInternationalConnection} minutes`);
  labelValue("Time format", settings.timeFormat === "12h" ? "12-hour clock" : "24-hour clock");
  labelValue("Distance units", settings.units === "mi" ? "Miles" : "Kilometres");

  // Notes
  if (warnings.length > 0) {
    sectionTitle("Notes and warnings");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15);
    warnings.forEach((warning) => {
      const lines = doc.splitTextToSize(safeText(`- ${warning.message}`), CONTENT_WIDTH);
      ensureSpace(lines.length * 4.6 + 2);
      doc.text(lines, MARGIN, y);
      y += lines.length * 4.6 + 1.5;
    });
    y += 2;
  }

  ensureSpace(22);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const disclaimer = doc.splitTextToSize(
    "All times are local to their airports. Daylight saving is applied automatically for the travel date. Distance and average speed are great-circle estimates, so actual flown tracks may be longer. Always confirm schedules, connection minimums and terminal transfer times with your airline before booking.",
    CONTENT_WIDTH,
  );
  doc.text(disclaimer, MARGIN, y);

  addFooter(doc, pageNumber);
  return doc;
}
