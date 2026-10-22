import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isPlan,
  safeNext,
  canOpenLesson,
  canCheckout,
  paidSubscription,
} from "../lib/academy/policy.ts";
test("VIP cannot purchase without approval", () => {
  assert.equal(canCheckout("elite", false), false);
  assert.equal(canCheckout("elite", true), true);
  assert.equal(canCheckout("academy", false), true);
});
test("access requires explicit plan grant", () => {
  assert.equal(canOpenLesson(["starter"], ["pro", "elite"]), false);
  assert.equal(canOpenLesson([], ["academy"]), false);
  assert.equal(canOpenLesson(["academy"], ["academy", "pro"]), true);
});
test("unpaid, expired, canceled and refunded subscriptions do not grant access", () => {
  assert.equal(paidSubscription("active", 200, true, false, 100), true);
  for (const status of [
    "past_due",
    "unpaid",
    "trialing",
    "canceled",
    "incomplete",
    "paused",
  ]) {
    assert.equal(paidSubscription(status, 200, true, false, 100), false);
  }
  assert.equal(paidSubscription("active", 99, true, false, 100), false);
  assert.equal(paidSubscription("active", 200, false, false, 100), false);
  assert.equal(paidSubscription("active", 200, true, true, 100), false);
});
test("redirects stay within this site", () => {
  for (const path of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/x\r\nLocation:x",
  ]) {
    assert.equal(safeNext(path), "/mi-cuenta");
  }
  assert.equal(safeNext("/vip"), "/vip");
});
test("only configured plans can be purchased", () => {
  assert.equal(isPlan("admin"), false);
  assert.equal(isPlan("elite"), true);
  assert.equal(isPlan(null), false);
});
