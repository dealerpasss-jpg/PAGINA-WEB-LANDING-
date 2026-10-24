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

import { readProfile } from "../lib/academy/profile.ts";
function sampleProfile() {
  const form = new FormData();
  for (const [key,value] of Object.entries({first_name:"Juan",last_name:"Peña",country:"Estados Unidos",region:"Florida"})) form.set(key,value);
  return form;
}
test("profile fields are required and opt-ins default off", () => {
  const form=sampleProfile();
  assert.equal(readProfile(form).data?.marketing_email,false);
  assert.equal(readProfile(form).data?.marketing_whatsapp,false);
  form.delete("first_name"); assert.ok(readProfile(form).error);
});
test("WhatsApp opt-in requires an international phone", () => {
  const form=sampleProfile();form.set("marketing_whatsapp","yes");
  assert.ok(readProfile(form).error);
  form.set("phone","8135551234");assert.ok(readProfile(form).error);
  form.set("phone","+1 (813) 555-1234");assert.equal(readProfile(form).data?.phone,"+18135551234");
});
test("profile ignores privilege fields and rejects unknown learning choices", () => {
  const form=sampleProfile();form.set("role","admin");form.set("plan","elite");
  assert.equal("role" in readProfile(form).data!,false);
  assert.ok(readProfile(form,true).error);
  form.set("experience","beginner");form.set("goal","personal");form.set("language","es");
  assert.ok(readProfile(form,true).data);
});
