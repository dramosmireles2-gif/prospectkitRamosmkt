import { describe, expect, it } from "vitest";
import { validateProspectForm, validateAuthForm } from "./validation";

describe("validateProspectForm", () => {
  it("rechaza campos obligatorios vacíos", () => {
    const result = validateProspectForm({ name: "", industry: "", city: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.industry).toBeDefined();
    expect(result.errors.city).toBeDefined();
  });

  it("acepta un formulario válido mínimo", () => {
    const result = validateProspectForm({ name: "Test", industry: "Tech", city: "MTY" });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("valida URL de website", () => {
    const bad = validateProspectForm({ name: "X", industry: "Y", city: "Z", website: "no-url" });
    expect(bad.errors.website).toBeDefined();

    const good = validateProspectForm({ name: "X", industry: "Y", city: "Z", website: "ejemplo.com" });
    expect(good.errors.website).toBeUndefined();
  });

  it("valida formato de WhatsApp", () => {
    const bad = validateProspectForm({ name: "X", industry: "Y", city: "Z", whatsapp: "abc" });
    expect(bad.errors.whatsapp).toBeDefined();

    const good = validateProspectForm({ name: "X", industry: "Y", city: "Z", whatsapp: "+52 81 1234 5678" });
    expect(good.errors.whatsapp).toBeUndefined();
  });

  it("valida formato de Instagram", () => {
    const bad = validateProspectForm({ name: "X", industry: "Y", city: "Z", instagram: "sinArroba" });
    expect(bad.errors.instagram).toBeDefined();

    const good = validateProspectForm({ name: "X", industry: "Y", city: "Z", instagram: "@usuario" });
    expect(good.errors.instagram).toBeUndefined();
  });
});

describe("validateAuthForm", () => {
  it("rechaza email vacío", () => {
    const result = validateAuthForm({ email: "", password: "123456" }, false);
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("rechaza email mal formateado", () => {
    const result = validateAuthForm({ email: "noesemail", password: "123456" }, false);
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("rechaza password corta", () => {
    const result = validateAuthForm({ email: "a@b.com", password: "123" }, false);
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  it("exige nombre en signup", () => {
    const result = validateAuthForm({ email: "a@b.com", password: "123456", fullName: "" }, true);
    expect(result.valid).toBe(false);
    expect(result.errors.fullName).toBeDefined();
  });

  it("acepta formulario válido de login", () => {
    const result = validateAuthForm({ email: "a@b.com", password: "123456" }, false);
    expect(result.valid).toBe(true);
  });
});
