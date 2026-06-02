import { VALIDATION } from "../app/constants";

export function validateProspectForm(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = "El nombre es obligatorio";
  } else if (form.name.trim().length < VALIDATION.NAME_MIN) {
    errors.name = `Mínimo ${VALIDATION.NAME_MIN} caracteres`;
  }

  if (!form.industry?.trim()) {
    errors.industry = "La industria es obligatoria";
  }

  if (!form.city?.trim()) {
    errors.city = "La ciudad es obligatoria";
  }

  if (form.website?.trim() && !VALIDATION.URL_PATTERN.test(form.website.trim())) {
    errors.website = "URL no válida (ej: ejemplo.com)";
  }

  if (form.whatsapp?.trim() && !VALIDATION.PHONE_PATTERN.test(form.whatsapp.trim())) {
    errors.whatsapp = "Formato no válido (ej: +52 81 1234 5678)";
  }

  if (form.instagram?.trim() && !form.instagram.trim().startsWith("@") && form.instagram.trim().length > 0) {
    errors.instagram = "Debe empezar con @ (ej: @usuario)";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateAuthForm(form, isSignUp) {
  const errors = {};

  if (!form.email?.trim()) {
    errors.email = "El email es obligatorio";
  } else if (!VALIDATION.EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Email no válido";
  }

  if (!form.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (form.password.length < VALIDATION.PASSWORD_MIN) {
    errors.password = `Mínimo ${VALIDATION.PASSWORD_MIN} caracteres`;
  }

  if (isSignUp && !form.fullName?.trim()) {
    errors.fullName = "El nombre es obligatorio";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
