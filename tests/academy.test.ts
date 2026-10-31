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

import { learningSummary, purchaseBudget } from "../lib/academy/dashboard.ts";
test("dashboard counts only published inputs available to current plans",()=>{
 const lessons=[{id:"a",title:"A",module_title:"M",allowed_plans:["academy"]},{id:"b",title:"B",module_title:"M",allowed_plans:["elite"]}];
 const state=learningSummary(lessons,["a","b","a"],["academy"]);
 assert.equal(state.completed,1);assert.equal(state.percent,100);assert.equal(state.next,null);
 assert.equal(learningSummary(lessons,[],[]).available.length,0);
 assert.equal(learningSummary(lessons,[],["academy"]).next?.id,"a");
});
test("calculator subtracts all costs and preserves an unviable budget",()=>{
 assert.deepEqual(purchaseBudget([10000,500,200,1000,300,500,2000]),{costs:2500,maximum:5500});
 assert.equal(purchaseBudget([0,500,0,0,0,0,0])?.maximum,-500);
 assert.equal(purchaseBudget([NaN,0,0,0,0,0,0]),null);
 assert.equal(purchaseBudget([-1,0,0,0,0,0,0]),null);
});

import {isTeamRole,isAdminRole,validRecordId,directoryPage} from "../lib/academy/team-policy.ts";
test("team policies deny unknown roles and restrict student data to admins",()=>{
 for(const role of [undefined,null,"student","owner",""]) {assert.equal(isTeamRole(role),false);assert.equal(isAdminRole(role),false);}
 assert.equal(isTeamRole("collaborator"),true);assert.equal(isAdminRole("collaborator"),false);assert.equal(isAdminRole("admin"),true);
});
test("directory pagination and record identifiers are bounded",()=>{
 for(const n of ["0","-1","NaN","Infinity","1.5","100001"])assert.equal(directoryPage(n),1);
 assert.equal(directoryPage("2"),2);assert.equal(validRecordId("../students"),false);assert.equal(validRecordId("12345678-1234-1234-1234-123456789abc"),true);
});

import { passwordError } from "../lib/academy/password.ts";
test("password change validates confirmation and length on both boundaries", () => {
  assert.ok(passwordError("short", "short"));
  assert.ok(passwordError("a".repeat(257), "a".repeat(257)));
  assert.ok(passwordError("a".repeat(12), "b".repeat(12)));
  assert.equal(passwordError("a".repeat(12), "a".repeat(12)), null);
  assert.equal(passwordError("a".repeat(256), "a".repeat(256)), null);
});

import { greetingName } from "../lib/academy/profile.ts";
test("greeting uses chosen nickname, falls back to name, never email", () => {
  assert.equal(greetingName({nickname:" Jota ",first_name:"Juan",email:"private@example.com"}),"Jota");
  assert.equal(greetingName({nickname:" ",first_name:"Juan"}),"Juan");
  assert.equal(greetingName({email:"private@example.com"}),"");
  assert.equal(greetingName({nickname:42}),"");
});
test("profile accepts optional nicknames and rejects oversized or markup names", () => {
  const form = new FormData();
  for (const [k,v] of Object.entries({first_name:"Juan",last_name:"Peña",country:"USA",region:"FL",nickname:" Jota "})) form.set(k,v);
  assert.equal(readProfile(form).data?.nickname,"Jota");
  for (const value of ["a".repeat(41),"<script>"]) { form.set("nickname",value); assert.ok(readProfile(form).error); }
  form.set("nickname",""); assert.equal(readProfile(form).data?.nickname,"");
});
