/**
 * Utilidades para formateo y validación de RUT chileno (Módulo 11)
 */

export function cleanRut(rut: string): string {
  return typeof rut === 'string' ? rut.replace(/[^0-9kK]/g, '').toUpperCase() : '';
}

export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (!clean) return '';
  if (clean.length === 1) return clean;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Formato con puntos y guión: 12.345.678-9
  let formatted = '';
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formatted = cuerpo[i] + formatted;
    count++;
    if (count === 3 && i > 0) {
      formatted = '.' + formatted;
      count = 0;
    }
  }

  return `${formatted}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 7 || clean.length > 9) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = '';
  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
}
