import test from "node:test";
import assert from "node:assert/strict";
import { readLead } from "../lib/lead.ts";
const valid = {name:"Prueba",whatsapp:"+18135550100",email:"qa@example.com",location:"Florida",objective:"Reventa",experience:"Ninguna",capital:"Menos de $3,000",timeline:"Este mes",consent:"on"};
test("leads require valid contact details and explicit consent",()=>{assert.equal(readLead({...valid,consent:""}),null);assert.equal(readLead({...valid,email:"wrong"}),null);assert.equal(readLead({...valid,name:"x".repeat(121)}),null);assert.equal(readLead(null),null);});
test("lead payload only forwards approved fields and fixes source",()=>{const parsed=readLead({...valid,source:"attacker",secret:"excluded"});assert.equal(parsed?.source,"dealerpass-website");assert.equal(parsed?.consent,true);assert.equal("secret" in parsed!,false);});
