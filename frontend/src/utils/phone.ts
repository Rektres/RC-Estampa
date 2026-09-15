/**
 * Utilidades para formateo y validación de teléfonos móviles de Chile (+56 9)
 */

export function cleanChilePhone(value: string): string {
  if (!value) return '';
  // Extraer solo los números
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('569')) {
    return `+569${digits.slice(3, 11)}`;
  }
  if (digits.startsWith('9')) {
    return `+569${digits.slice(1, 9)}`;
  }
  return `+569${digits.slice(0, 8)}`;
}

export function formatChilePhoneDisplay(value: string): string {
  if (!value) return '+56 9 ';
  const digits = value.replace(/\D/g, '');
  let rest = '';
  if (digits.startsWith('569')) {
    rest = digits.slice(3, 11);
  } else if (digits.startsWith('9')) {
    rest = digits.slice(1, 9);
  } else {
    rest = digits.slice(0, 8);
  }

  if (rest.length <= 4) {
    return `+56 9 ${rest}`;
  }
  return `+56 9 ${rest.slice(0, 4)} ${rest.slice(4, 8)}`;
}

export function validateChilePhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  // Con código país: 569XXXXXXXX (11 dígitos)
  if (digits.length === 11 && digits.startsWith('569')) return true;
  // Sin código país: 9XXXXXXXX (9 dígitos)
  if (digits.length === 9 && digits.startsWith('9')) return true;
  // 8 dígitos ingresados tras +569
  if (digits.length === 8) return true;
  return false;
}
