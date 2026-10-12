// Alfabeto seguro para dictar o leer en pantalla (excluye O, 0, I, L, 1 para evitar errores de tipeo)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCode(attempt = 0) {
  // Longitud base: 6 caracteres (ej. 5SVJ7X)
  // Si ocurren colisiones en la BD (attempt > 0), aumentamos el tamaño para garantizar que guarde
  let length = 6;
  if (attempt >= 4) length = 7;
  if (attempt >= 8) length = 8;

  // Generamos números aleatorios criptográficamente seguros
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);

  // Mapeamos los números aleatorios a nuestro alfabeto
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[buf[i] % ALPHABET.length];
  }

  return code;
}
