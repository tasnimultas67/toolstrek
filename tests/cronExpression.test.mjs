import assert from "node:assert/strict";
import test from "node:test";
import {
  describeCronExpression,
  getNextCronRuns,
  parseCronExpression,
} from "../lib/cronExpression.js";

test("parses stepped values, ranges, lists, and Sunday as 7", () => {
  const parsed = parseCronExpression("*/15 9-17 1,15 * 0,7");

  assert.deepEqual([...parsed.fields.Minute.values], [0, 15, 30, 45]);
  assert.deepEqual([...parsed.fields.Hour.values], Array.from({ length: 9 }, (_, i) => i + 9));
  assert.deepEqual([...parsed.fields["Day of month"].values], [1, 15]);
  assert.deepEqual([...parsed.fields["Day of week"].values], [0]);
  assert.deepEqual(
    [...parseCronExpression("5/2 * * * *").fields.Minute.values],
    Array.from({ length: 28 }, (_, i) => 5 + i * 2),
  );
});

test("rejects malformed expressions and out-of-range values", () => {
  assert.throws(() => parseCronExpression("* * * *"), /five fields/i);
  assert.throws(() => parseCronExpression("60 * * * *"), /between 0 and 59/i);
  assert.throws(() => parseCronExpression("*/0 * * * *"), /step/i);
});

test("returns the next matching UTC minutes, strictly after the supplied time", () => {
  const runs = getNextCronRuns("*/15 9-10 * * 1-5", {
    count: 4,
    from: new Date("2026-11-25T08:59:27.000Z"),
    timezone: "UTC",
  });

  assert.deepEqual(
    runs.map((run) => run.toISOString()),
    [
      "2026-11-25T09:00:00.000Z",
      "2026-11-25T09:15:00.000Z",
      "2026-11-25T09:30:00.000Z",
      "2026-11-25T09:45:00.000Z",
    ],
  );
});

test("uses cron OR semantics when both day selectors are restricted", () => {
  const runs = getNextCronRuns("0 9 1 * 1", {
    count: 2,
    from: new Date("2026-11-30T08:59:00.000Z"),
    timezone: "UTC",
  });

  assert.deepEqual(
    runs.map((run) => run.toISOString()),
    ["2026-11-30T09:00:00.000Z", "2026-12-01T09:00:00.000Z"],
  );
});

test("describes each cron field for the explanation panel", () => {
  const description = describeCronExpression("0 8 * * 1-5");

  assert.equal(description.length, 5);
  assert.equal(description[0].source, "0");
  assert.equal(description[1].source, "8");
  assert.equal(description[2].description, "Every day");
});
