import assert from "node:assert/strict";
import test from "node:test";

import {
  DAY_BATCH_SIZE,
  createDateBatch,
  getBatchStartForOffset,
  getCenteredBatchStart,
  isSameDay,
  shiftBatchStart,
} from "../utils/dashboardCalendar";

test("createDateBatch returns the next five consecutive days from the visible start date", () => {
  const batch = createDateBatch(new Date(2026, 3, 24));

  assert.equal(batch.length, DAY_BATCH_SIZE);
  assert.equal(batch[0]?.toISOString(), new Date(2026, 3, 24).toISOString());
  assert.equal(batch[4]?.toISOString(), new Date(2026, 3, 28).toISOString());
});

test("createDateBatch continues cleanly across month boundaries", () => {
  const batch = createDateBatch(new Date(2026, 0, 30));

  assert.equal(batch[2]?.toISOString(), new Date(2026, 1, 1).toISOString());
  assert.equal(batch[4]?.toISOString(), new Date(2026, 1, 3).toISOString());
});

test("shiftBatchStart moves the visible window by exactly five days", () => {
  const currentStart = new Date(2026, 3, 24);
  const nextStart = shiftBatchStart(currentStart, 1);
  const previousStart = shiftBatchStart(currentStart, -1);

  assert.ok(isSameDay(nextStart, new Date(2026, 3, 29)));
  assert.ok(isSameDay(previousStart, new Date(2026, 3, 19)));
});

test("getCenteredBatchStart places the selected date in the middle slot of a five-day batch", () => {
  const selectedDate = new Date(2026, 3, 24);
  const centeredStart = getCenteredBatchStart(selectedDate);
  const batch = createDateBatch(centeredStart);

  assert.equal(batch.length, DAY_BATCH_SIZE);
  assert.ok(isSameDay(centeredStart, new Date(2026, 3, 22)));
  assert.ok(isSameDay(batch[2]!, selectedDate));
});

test("getBatchStartForOffset derives stable previous and next batch starts from a fixed anchor", () => {
  const anchorStart = new Date(2026, 3, 22);

  assert.ok(isSameDay(getBatchStartForOffset(anchorStart, -1), new Date(2026, 3, 17)));
  assert.ok(isSameDay(getBatchStartForOffset(anchorStart, 0), new Date(2026, 3, 22)));
  assert.ok(isSameDay(getBatchStartForOffset(anchorStart, 1), new Date(2026, 3, 27)));
});
