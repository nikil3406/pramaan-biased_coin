import test from "node:test";
import assert from "node:assert/strict";
import { demoExtract, isComplete } from "@/server/services/onboarding.service";
import type { ExtractedOnboardingFields } from "@/types/onboarding";

const empty: ExtractedOnboardingFields = {
  fullName: null,
  cityOrDistrict: null,
  locality: null,
  primaryTrade: null,
  yearsOfExperience: null,
  skills: [],
  uncertainFields: ["fullName", "cityOrDistrict", "locality", "primaryTrade", "yearsOfExperience", "skills"],
};

test("extracts all fields from one response", () => {
  const extracted = demoExtract("My name is Ravi Kumar. I live in Bengaluru city, in Whitefield locality. I am an Electrician with 4 years of experience. I know Wiring and Switch Installation.", empty);
  assert.equal(extracted.fullName, "Ravi Kumar");
  assert.equal(extracted.cityOrDistrict, "Bengaluru");
  assert.equal(extracted.locality, "Whitefield");
  assert.equal(extracted.primaryTrade, "Electrician");
  assert.equal(extracted.yearsOfExperience, 4);
  assert.deepEqual(extracted.skills, ["Wiring", "Switch Installation"]);
  assert.equal(extracted.uncertainFields.length, 0);
});

test("keeps missing fields unresolved", () => {
  const extracted = demoExtract("My name is Ravi. I am an Electrician.", empty);
  assert.equal(extracted.fullName, "Ravi");
  assert.equal(extracted.primaryTrade, "Electrician");
  assert.ok(extracted.uncertainFields.includes("cityOrDistrict"));
  assert.ok(extracted.uncertainFields.includes("skills"));
});

test("supports zero years of experience", () => {
  const extracted = demoExtract("I have 0 years of experience.", empty);
  assert.equal(extracted.yearsOfExperience, 0);
  assert.ok(!extracted.uncertainFields.includes("yearsOfExperience"));
});

test("preserves previously collected values", () => {
  const current = { ...empty, fullName: "Ravi Kumar", cityOrDistrict: "Bengaluru", uncertainFields: [] as ExtractedOnboardingFields["uncertainFields"] };
  const extracted = demoExtract("Please correct my name to Ravi S.", current);
  assert.equal(extracted.fullName, "Ravi S");
  assert.equal(extracted.cityOrDistrict, "Bengaluru");
});

test("recognizes complete data", () => {
  assert.equal(isComplete({ fullName: "Ravi", cityOrDistrict: "Bengaluru", locality: "Whitefield", primaryTrade: "Electrician", yearsOfExperience: 0, skills: ["Wiring"] }), true);
});
