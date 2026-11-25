const FIELD_DEFINITIONS = [
  { name: "Minute", min: 0, max: 59, unit: "minute" },
  { name: "Hour", min: 0, max: 23, unit: "hour" },
  { name: "Day of month", min: 1, max: 31, unit: "day" },
  { name: "Month", min: 1, max: 12, unit: "month" },
  { name: "Day of week", min: 0, max: 7, unit: "weekday", sundayIsSeven: true },
];

function parseField(source, definition) {
  const values = new Set();
  const segments = source.split(",");

  if (segments.some((segment) => segment.length === 0)) {
    throw new Error(`${definition.name} contains an empty list item.`);
  }

  for (const segment of segments) {
    const [rangeSource, stepSource, ...extra] = segment.split("/");
    if (extra.length > 0) throw new Error(`${definition.name} has too many step separators.`);

    const step = stepSource === undefined ? 1 : Number(stepSource);
    if (!Number.isInteger(step) || step < 1) {
      throw new Error(`${definition.name} steps must be positive whole numbers.`);
    }

    let start = definition.min;
    let end = definition.max;

    if (rangeSource !== "*") {
      const range = rangeSource.split("-");
      if (range.length > 2) throw new Error(`${definition.name} has an invalid range.`);
      start = Number(range[0]);
      end = range.length === 2
        ? Number(range[1])
        : stepSource === undefined
          ? start
          : definition.max;

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < definition.min ||
        end > definition.max ||
        start > end
      ) {
        throw new Error(`${definition.name} values must be between ${definition.min} and ${definition.max}.`);
      }
    }

    for (let value = start; value <= end; value += step) {
      values.add(definition.sundayIsSeven && value === 7 ? 0 : value);
    }
  }

  return {
    values,
    unrestricted: source === "*",
  };
}

export function parseCronExpression(expression) {
  if (typeof expression !== "string") {
    throw new Error("Enter a five-field cron expression.");
  }

  const fields = expression.trim().split(/\s+/);
  if (fields.length !== FIELD_DEFINITIONS.length) {
    throw new Error("Use five fields: minute hour day-of-month month day-of-week.");
  }

  const parsedFields = fields.map((field, index) => parseField(field, FIELD_DEFINITIONS[index]));

  return {
    expression: fields.join(" "),
    fields: Object.fromEntries(
      FIELD_DEFINITIONS.map((definition, index) => [definition.name, parsedFields[index]]),
    ),
    definitions: FIELD_DEFINITIONS,
  };
}

function matchesDay(cron, date, utc) {
  const dayOfMonth = utc ? date.getUTCDate() : date.getDate();
  const dayOfWeek = utc ? date.getUTCDay() : date.getDay();
  const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  const dom = cron.fields["Day of month"];
  const dow = cron.fields["Day of week"];
  const dayOfMonthMatches = dom.values.has(dayOfMonth);
  const dayOfWeekMatches = dow.values.has(dayOfWeek);

  // Standard cron uses OR when both day selectors are restricted.
  const dayMatches =
    !dom.unrestricted && !dow.unrestricted
      ? dayOfMonthMatches || dayOfWeekMatches
      : dayOfMonthMatches && dayOfWeekMatches;

  return dayMatches && cron.fields.Month.values.has(month);
}

export function getNextCronRuns(expression, { count = 5, from = new Date(), timezone = "local" } = {}) {
  const cron = typeof expression === "string" ? parseCronExpression(expression) : expression;
  const utc = timezone === "UTC";
  const limit = Math.max(1, Math.min(20, Number(count) || 5));
  const start = Math.floor(from.getTime() / 60_000) * 60_000 + 60_000;
  const maxMinutes = 5 * 366 * 24 * 60;
  const matches = [];

  for (let offset = 0; offset < maxMinutes && matches.length < limit; offset += 1) {
    const candidate = new Date(start + offset * 60_000);
    const minute = utc ? candidate.getUTCMinutes() : candidate.getMinutes();
    const hour = utc ? candidate.getUTCHours() : candidate.getHours();

    if (
      cron.fields.Minute.values.has(minute) &&
      cron.fields.Hour.values.has(hour) &&
      matchesDay(cron, candidate, utc)
    ) {
      matches.push(candidate);
    }
  }

  return matches;
}

export function describeCronExpression(expression) {
  const cron = typeof expression === "string" ? parseCronExpression(expression) : expression;

  return cron.definitions.map((definition) => {
    const field = cron.fields[definition.name];
    const values = [...field.values].sort((left, right) => left - right);

    let description;
    if (field.unrestricted) {
      description = `Every ${definition.unit}`;
    } else if (values.length <= 8) {
      description = `At ${values.join(", ")}`;
    } else {
      description = `At ${values.length} selected ${definition.unit} values`;
    }

    return { name: definition.name, source: cron.expression.split(" ")[cron.definitions.indexOf(definition)], description };
  });
}
