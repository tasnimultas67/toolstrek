export const KM_PER_MILE = 1.609344;
export const LITRES_PER_US_GALLON = 3.785411784;
export const LITRES_PER_UK_GALLON = 4.54609;

export const UNIT_SYSTEMS = {
  metric: {
    label: "Metric",
    distanceLabel: "km",
    volumeLabel: "L",
    speedLabel: "km/h",
    efficiencyUnits: ["l100", "kml"],
  },
  imperial: {
    label: "Imperial",
    distanceLabel: "mi",
    volumeLabel: "gal",
    speedLabel: "mph",
    efficiencyUnits: ["mpgus", "mpguk"],
  },
};

export const EFFICIENCY_UNITS = {
  l100: {
    label: "L / 100 km",
    short: "L/100km",
    system: "metric",
    toL100: (value) => value,
    fromL100: (value) => value,
  },
  kml: {
    label: "km / L",
    short: "km/L",
    system: "metric",
    toL100: (value) => 100 / value,
    fromL100: (value) => 100 / value,
  },
  mpgus: {
    label: "MPG (US)",
    short: "mpg US",
    system: "imperial",
    toL100: (value) => 235.214583 / value,
    fromL100: (value) => 235.214583 / value,
  },
  mpguk: {
    label: "MPG (UK)",
    short: "mpg UK",
    system: "imperial",
    toL100: (value) => 282.480936 / value,
    fromL100: (value) => 282.480936 / value,
  },
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British pound" },
  { code: "CAD", symbol: "CA$", label: "Canadian dollar" },
  { code: "AUD", symbol: "A$", label: "Australian dollar" },
  { code: "INR", symbol: "₹", label: "Indian rupee" },
  { code: "JPY", symbol: "¥", label: "Japanese yen" },
  { code: "BRL", symbol: "R$", label: "Brazilian real" },
  { code: "ZAR", symbol: "R", label: "South African rand" },
  { code: "MXN", symbol: "MX$", label: "Mexican peso" },
];

export const VEHICLE_PRESETS = [
  { id: "compact", label: "Compact hatchback", l100: 5.8, tankLitres: 45 },
  { id: "sedan", label: "Family sedan", l100: 7.5, tankLitres: 50 },
  { id: "suv", label: "SUV / crossover", l100: 9.5, tankLitres: 65 },
  { id: "hybrid", label: "Hybrid", l100: 4.6, tankLitres: 50 },
  { id: "van", label: "Van / people carrier", l100: 11.5, tankLitres: 75 },
  { id: "motorcycle", label: "Motorcycle", l100: 3.8, tankLitres: 18 },
];

export const FUEL_TYPES = [
  { id: "petrol", label: "Petrol / gasoline", co2PerLitre: 2.31 },
  { id: "diesel", label: "Diesel", co2PerLitre: 2.68 },
  { id: "e10", label: "E10 petrol", co2PerLitre: 2.08 },
  { id: "e85", label: "E85 ethanol blend", co2PerLitre: 1.51 },
  { id: "lpg", label: "LPG / autogas", co2PerLitre: 1.63 },
];

export const DRIVING_STYLES = [
  { id: "economy", label: "Economy / gentle", adjustment: -10 },
  { id: "steady", label: "Steady highway", adjustment: 0 },
  { id: "spirited", label: "Spirited / hilly", adjustment: 12 },
  { id: "heavy", label: "Heavy traffic", adjustment: 20 },
];

export const LOAD_OPTIONS = [
  { id: "light", label: "Light load", adjustment: 0 },
  { id: "full", label: "Full car", adjustment: 5 },
  { id: "roofbox", label: "Roof box or rack", adjustment: 15 },
  { id: "trailer", label: "Small trailer", adjustment: 25 },
];

export const DEFAULT_TRIP = {
  tripName: "Coastal weekend",
  from: "Home",
  to: "Seaside",
  unitSystem: "metric",
  distance: 500,
  roundTrip: true,
  efficiency: 7.5,
  efficiencyUnit: "l100",
  fuelPrice: 1.65,
  currency: "USD",
  vehiclePreset: "sedan",
  fuelType: "petrol",
  passengers: 2,
  budget: 250,
  tolls: 0,
  parking: 0,
  accommodation: 0,
  food: 0,
  tankSize: 50,
  startingFuel: 100,
  reserve: 5,
  drivingStyle: "steady",
  load: "light",
  averageSpeed: 80,
  breakMinutes: 0,
};

export const EXTRA_COST_FIELDS = [
  { key: "tolls", label: "Tolls & road fees", placeholder: "0" },
  { key: "parking", label: "Parking", placeholder: "0" },
  { key: "accommodation", label: "Accommodation", placeholder: "0" },
  { key: "food", label: "Food & activities", placeholder: "0" },
];

function finiteNumber(value) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCurrency(value, currency = "USD") {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${formatNumber(value)}`;
  }
}

export function formatDurationMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const minutes = Math.round(totalMinutes);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function convertEfficiency(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  const l100 = EFFICIENCY_UNITS[fromUnit]?.toL100(value);
  return EFFICIENCY_UNITS[toUnit]?.fromL100(l100) ?? value;
}

export function efficiencyForPreset(l100, unit) {
  return round(EFFICIENCY_UNITS[unit]?.fromL100(l100) ?? l100, 2);
}

export function convertTripForUnitSystem(trip, nextSystem) {
  const current = UNIT_SYSTEMS[trip.unitSystem] ? trip.unitSystem : "metric";
  if (current === nextSystem) return trip;
  const toImperial = nextSystem === "imperial";
  const distance = finiteNumber(trip.distance) ?? 0;
  const price = finiteNumber(trip.fuelPrice) ?? 0;
  const speed = finiteNumber(trip.averageSpeed) ?? 0;
  const tank = finiteNumber(trip.tankSize) ?? 0;
  const efficiency = finiteNumber(trip.efficiency) ?? 0;
  const nextEfficiencyUnit = UNIT_SYSTEMS[nextSystem].efficiencyUnits[0];

  return {
    ...trip,
    unitSystem: nextSystem,
    distance: round(distance * (toImperial ? 1 / KM_PER_MILE : KM_PER_MILE), 2),
    fuelPrice: round(
      price * (toImperial ? LITRES_PER_US_GALLON : 1 / LITRES_PER_US_GALLON),
      3,
    ),
    averageSpeed: round(speed * (toImperial ? 1 / KM_PER_MILE : KM_PER_MILE), 1),
    tankSize: round(tank * (toImperial ? 1 / LITRES_PER_US_GALLON : LITRES_PER_US_GALLON), 2),
    efficiency:
      efficiency > 0
        ? round(
            convertEfficiency(
              efficiency,
              trip.efficiencyUnit,
              nextEfficiencyUnit,
            ),
            2,
          )
        : efficiency,
    efficiencyUnit: nextEfficiencyUnit,
  };
}

function parseExtraCosts(trip) {
  return EXTRA_COST_FIELDS.reduce((total, field) => {
    const value = finiteNumber(trip[field.key]);
    return total + (value && value > 0 ? value : 0);
  }, 0);
}

export function calculateTrip(trip) {
  const errors = {};
  const unitSystem = UNIT_SYSTEMS[trip.unitSystem] ? trip.unitSystem : "metric";
  const distanceUnit = UNIT_SYSTEMS[unitSystem].distanceLabel;
  const volumeUnit = UNIT_SYSTEMS[unitSystem].volumeLabel;
  const speedUnit = UNIT_SYSTEMS[unitSystem].speedLabel;
  const efficiencyUnit =
    EFFICIENCY_UNITS[trip.efficiencyUnit]?.system === unitSystem
      ? trip.efficiencyUnit
      : UNIT_SYSTEMS[unitSystem].efficiencyUnits[0];

  const distance = finiteNumber(trip.distance);
  if (distance === null || distance <= 0) {
    errors.distance = "Enter a one-way distance greater than zero.";
  } else if (distance > (unitSystem === "metric" ? 50000 : 31069)) {
    errors.distance = `Keep the one-way distance under ${formatNumber(
      unitSystem === "metric" ? 50000 : 31069,
    )} ${distanceUnit}.`;
  }

  const efficiency = finiteNumber(trip.efficiency);
  const efficiencyL100 = efficiency ? EFFICIENCY_UNITS[efficiencyUnit].toL100(efficiency) : null;
  if (efficiency === null || efficiency <= 0 || !Number.isFinite(efficiencyL100)) {
    errors.efficiency = "Enter a fuel efficiency greater than zero.";
  } else if (efficiencyL100 < 0.5 || efficiencyL100 > 100) {
    errors.efficiency = "That efficiency looks unrealistic. Check the value and its unit.";
  }

  const fuelPrice = finiteNumber(trip.fuelPrice);
  const pricePerLitre = fuelPrice !== null ? fuelPrice / (unitSystem === "imperial" ? LITRES_PER_US_GALLON : 1) : null;
  if (fuelPrice === null || fuelPrice < 0) {
    errors.fuelPrice = "Enter a fuel price of zero or more.";
  } else if (pricePerLitre > 100) {
    errors.fuelPrice = "Fuel price looks too high. Check the amount and currency.";
  }

  const passengers = finiteNumber(trip.passengers);
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 12) {
    errors.passengers = "Passengers must be a whole number from 1 to 12.";
  }

  const tankSize = finiteNumber(trip.tankSize);
  if (tankSize === null || tankSize <= 0) {
    errors.tankSize = "Enter a tank size greater than zero.";
  } else if (tankSize > (unitSystem === "metric" ? 1000 : 264.17)) {
    errors.tankSize = "Tank size looks too large for a road vehicle.";
  }

  const startingFuel = finiteNumber(trip.startingFuel);
  if (startingFuel === null || startingFuel < 0 || startingFuel > 100) {
    errors.startingFuel = "Starting fuel must be between 0 and 100%.";
  }

  const reserve = finiteNumber(trip.reserve);
  if (reserve === null || reserve < 0 || reserve > 50) {
    errors.reserve = "Reserve must be between 0 and 50%.";
  }

  const averageSpeed = finiteNumber(trip.averageSpeed);
  if (averageSpeed === null || averageSpeed <= 0) {
    errors.averageSpeed = "Enter an average speed greater than zero.";
  } else if (averageSpeed > (unitSystem === "metric" ? 200 : 124)) {
    errors.averageSpeed = "Average speed looks too high for a road trip.";
  }

  const breakMinutes = finiteNumber(trip.breakMinutes);
  if (breakMinutes === null || breakMinutes < 0 || breakMinutes > 10080) {
    errors.breakMinutes = "Break time must be between 0 and 10,080 minutes.";
  }

  const budget = finiteNumber(trip.budget);
  if (budget === null || budget < 0) {
    errors.budget = "Budget must be zero or more.";
  }

  EXTRA_COST_FIELDS.forEach((field) => {
    const value = finiteNumber(trip[field.key]);
    if (value === null || value < 0) {
      errors[field.key] = "Cost cannot be negative.";
    }
  });

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      unitSystem,
      distanceUnit,
      volumeUnit,
      speedUnit,
      efficiencyUnit,
    };
  }

  const oneWayKm = unitSystem === "metric" ? distance : distance * KM_PER_MILE;
  const totalKm = oneWayKm * (trip.roundTrip ? 2 : 1);
  const totalDistance = totalKm / (unitSystem === "metric" ? 1 : KM_PER_MILE);
  const styleAdjustment =
    DRIVING_STYLES.find((style) => style.id === trip.drivingStyle)?.adjustment ?? 0;
  const loadAdjustment =
    LOAD_OPTIONS.find((load) => load.id === trip.load)?.adjustment ?? 0;
  const adjustmentPercent = styleAdjustment + loadAdjustment;
  const adjustedL100 = efficiencyL100 * (1 + adjustmentPercent / 100);
  const litres = (totalKm / 100) * adjustedL100;
  const gallons = litres / (unitSystem === "imperial" ? LITRES_PER_US_GALLON : 1);
  const fuelCost = litres * pricePerLitre;
  const extraCosts = parseExtraCosts(trip);
  const totalCost = fuelCost + extraCosts;
  const perPerson = totalCost / passengers;
  const fuelPerPerson = fuelCost / passengers;
  const costPerDistance = totalCost / totalDistance;
  const fuelCostPerDistance = fuelCost / totalDistance;
  const costPer100Km = (totalCost / totalKm) * 100;
  const costPer100Miles = costPer100Km * KM_PER_MILE;
  const fuelEconomy =
    unitSystem === "metric"
      ? adjustedL100
      : EFFICIENCY_UNITS.mpgus.fromL100(adjustedL100);
  const usableLitres = tankSize * (1 - reserve / 100);
  const usableGallons = usableLitres / (unitSystem === "imperial" ? LITRES_PER_US_GALLON : 1);
  const startingLitres = tankSize * (startingFuel / 100);
  const startingUsableLitres = usableLitres * (startingFuel / 100);
  const fuelToBuy = Math.max(0, litres - startingUsableLitres);
  const refuelStops = fuelToBuy <= 0 ? 0 : Math.ceil(fuelToBuy / usableLitres);
  const fullTankRangeKm = (usableLitres / adjustedL100) * 100;
  const startingRangeKm = (startingUsableLitres / adjustedL100) * 100;
  const driveMinutes =
    (totalKm / (unitSystem === "metric" ? averageSpeed : averageSpeed * KM_PER_MILE)) * 60 +
    breakMinutes;
  const fuelType = FUEL_TYPES.find((type) => type.id === trip.fuelType) || FUEL_TYPES[0];
  const co2Kg = litres * fuelType.co2PerLitre;
  const budgetNumber = budget > 0 ? budget : 0;
  const budgetDifference = budgetNumber > 0 ? budgetNumber - totalCost : null;
  const budgetPercent = budgetNumber > 0 ? (totalCost / budgetNumber) * 100 : null;
  const reserveLitres = tankSize * (reserve / 100);

  return {
    ok: true,
    errors: {},
    unitSystem,
    distanceUnit,
    volumeUnit,
    speedUnit,
    efficiencyUnit,
    totalDistance,
    oneWayKm,
    totalKm,
    efficiencyL100,
    adjustedL100,
    adjustmentPercent,
    fuelEconomy,
    litres,
    gallons,
    fuelCost,
    extraCosts,
    totalCost,
    perPerson,
    fuelPerPerson,
    costPerDistance,
    fuelCostPerDistance,
    costPer100Km,
    costPer100Miles,
    usableLitres,
    usableGallons,
    startingLitres,
    fuelToBuy,
    refuelStops,
    fullTankRangeKm,
    startingRangeKm,
    fullTankRange:
      unitSystem === "metric" ? fullTankRangeKm : fullTankRangeKm / KM_PER_MILE,
    startingRange:
      unitSystem === "metric" ? startingRangeKm : startingRangeKm / KM_PER_MILE,
    driveMinutes,
    co2Kg,
    reserveLitres,
    budget: budgetNumber,
    budgetDifference,
    budgetPercent,
    fuelType,
    roundTrip: Boolean(trip.roundTrip),
    passengers,
  };
}

export function tripSummary(trip, result) {
  const currency = trip.currency || "USD";
  const title = trip.tripName?.trim() || "Road trip";
  const route = [trip.from?.trim(), trip.to?.trim()].filter(Boolean).join(" → ") || "Route not named";
  const lines = [
    "FUEL COST & ROAD TRIP SUMMARY — TOOLSTREK",
    title,
    route,
    "----------------------------------------",
    `Distance: ${formatNumber(result.totalDistance)} ${result.distanceUnit}${result.roundTrip ? " (round trip)" : " (one way)"}`,
    `Fuel used: ${formatNumber(result.litres)} L (${formatNumber(result.gallons)} US gal)`,
    `Fuel economy: ${formatNumber(result.fuelEconomy)} ${
      result.unitSystem === "metric" ? "L/100 km" : "mpg US"
    } after driving adjustments`,
    `Fuel price: ${formatCurrency(Number(trip.fuelPrice) || 0, currency)} per ${
      result.unitSystem === "metric" ? "litre" : "US gallon"
    }`,
    `Fuel cost: ${formatCurrency(result.fuelCost, currency)}`,
    `Extra costs: ${formatCurrency(result.extraCosts, currency)}`,
    `Total trip cost: ${formatCurrency(result.totalCost, currency)}`,
    `Cost per person (${result.passengers}): ${formatCurrency(result.perPerson, currency)}`,
    `Cost per ${result.distanceUnit}: ${formatCurrency(result.costPerDistance, currency)}`,
    `Driving time including breaks: ${formatDurationMinutes(result.driveMinutes)}`,
    `Estimated CO₂: ${formatNumber(result.co2Kg, 1)} kg`,
    `Fuel stops planned: ${result.refuelStops}`,
    `Full-tank range: ${formatNumber(result.fullTankRange)} ${result.distanceUnit}`,
  ];
  if (result.budget > 0) {
    lines.push(
      `Budget: ${formatCurrency(result.budget, currency)} (${
        result.budgetDifference >= 0 ? "under by " : "over by "
      }${formatCurrency(Math.abs(result.budgetDifference), currency)})`,
    );
  }
  lines.push("", "Generated with ToolsTrek Fuel Cost & Road Trip Calculator");
  lines.push("https://toolstrek.vercel.app/tools/fuel-cost-calculator");
  return lines.join("\n");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function tripCsv(trip, result) {
  const currency = trip.currency || "USD";
  const rows = [
    ["Metric", "Value"],
    ["Trip", trip.tripName || "Road trip"],
    ["From", trip.from || ""],
    ["To", trip.to || ""],
    ["Distance", `${formatNumber(result.totalDistance)} ${result.distanceUnit}`],
    ["Round trip", result.roundTrip ? "Yes" : "No"],
    ["Fuel used (L)", round(result.litres, 3)],
    ["Fuel cost", round(result.fuelCost, 2)],
    ["Extra costs", round(result.extraCosts, 2)],
    ["Total cost", round(result.totalCost, 2)],
    ["Currency", currency],
    ["Passengers", result.passengers],
    ["Cost per person", round(result.perPerson, 2)],
    ["Cost per distance unit", round(result.costPerDistance, 3)],
    ["Driving minutes", Math.round(result.driveMinutes)],
    ["CO2 kg", round(result.co2Kg, 2)],
    ["Fuel stops", result.refuelStops],
    ["Full tank range", `${formatNumber(result.fullTankRange)} ${result.distanceUnit}`],
    ["Budget", result.budget > 0 ? round(result.budget, 2) : ""],
    ["Budget difference", result.budgetDifference === null ? "" : round(result.budgetDifference, 2)],
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export const FUEL_TIPS = [
  {
    title: "Use a realistic highway figure",
    body: "Official economy figures are measured in ideal conditions. Add 5–15% for a loaded car, air-conditioning, steady motorway speeds or hilly roads. The driving and load selectors already apply a sensible allowance.",
  },
  {
    title: "Fill up where fuel is cheaper",
    body: "A small detour can cost more than it saves. Compare the price per litre, the extra distance and the value of your time before leaving the motorway; a 20 km detour at 8 L/100 km uses 1.6 L before you even reach the pump.",
  },
  {
    title: "Keep a reserve, not a gamble",
    body: "Plan to arrive at a station with at least 10–15% of the tank left. Fuel stations can be sparse at night or in rural areas, and running low can damage a modern fuel pump. The reserve setting is excluded from your usable range.",
  },
];

export const FUEL_FAQS = [
  {
    question: "How is the fuel cost calculated?",
    answer:
      "The calculator converts your distance and efficiency into a single metric fuel figure, then applies your driving-style and load adjustments. For example, 1,000 km at 7.5 L/100 km uses 75 litres. Multiplying 75 litres by the price per litre gives the fuel cost. Tolls, parking, accommodation and food are added afterwards to produce the complete trip cost.",
  },
  {
    question: "Does the calculator account for a round trip?",
    answer:
      "Yes. Turn on Round trip and the one-way distance is doubled. The fuel, cost, driving time and emissions figures all use the full distance, while the distance field stays as the one-way value so it is easy to compare routes.",
  },
  {
    question: "Why is my real-world fuel use higher than the result?",
    answer:
      "No calculator can predict traffic, weather, tyre pressure, air-conditioning, altitude or driving style exactly. Use the advanced driving-style and load selectors to add a realistic allowance, and treat the answer as a planning estimate. Keeping a small cash buffer is always sensible on a long drive.",
  },
  {
    question: "How does the cost-per-person split work?",
    answer:
      "The total of fuel and every extra cost is divided by the number of passengers. It assumes an even split. If one person is driving more, or someone joins for only part of the trip, use the per-person figure as a starting point and adjust the split manually.",
  },
  {
    question: "What do the fuel stops and range figures mean?",
    answer:
      "Full-tank range is the distance you can cover on the usable part of a full tank, after excluding your reserve. The fuel-stop estimate starts from your chosen starting fuel level and assumes each stop fills the usable tank. It is a planning aid, not a guarantee that stations will be available exactly where you need them.",
  },
  {
    question: "Is the trip data private?",
    answer:
      "Yes. Every calculation happens in your browser and no route, price, budget or personal detail is uploaded. There is no account, no tracking pixel and no server-side storage. Closing or refreshing the page clears the trip.",
  },
  {
    question: "Can I export the estimate?",
    answer:
      "Yes. Copy a plain-text summary for a message or notes app, or download a CSV file that opens in Excel, Numbers or Google Sheets. The CSV includes the distance, fuel use, costs, per-person split, drive time, emissions, fuel stops and budget comparison.",
  },
];
