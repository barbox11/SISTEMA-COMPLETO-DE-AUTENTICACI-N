const crypto = require('crypto');

// Genera una contraseña temporal segura: 12 caracteres con mayúsculas,
// minúsculas, números y especiales. Garantiza al menos uno de cada tipo.
function generarPasswordTemporal(longitud = 12) {
  const mayus = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const minus = 'abcdefghijkmnpqrstuvwxyz';
  const numeros = '23456789';
  const especiales = '!@#$%&*?';
  const todos = mayus + minus + numeros + especiales;

  const obligatorios = [
    mayus[crypto.randomInt(mayus.length)],
    minus[crypto.randomInt(minus.length)],
    numeros[crypto.randomInt(numeros.length)],
    especiales[crypto.randomInt(especiales.length)],
  ];

  const resto = Array.from({ length: longitud - obligatorios.length }, () =>
    todos[crypto.randomInt(todos.length)]
  );

  const password = [...obligatorios, ...resto];
  // Mezcla Fisher-Yates con crypto
  for (let i = password.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }
  return password.join('');
}

module.exports = generarPasswordTemporal;
