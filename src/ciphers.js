// Cipher Functions

export function caesarCipher(str, shift) {
  return str.replace(/[a-z]/gi, c => {
    let base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}

export function atbashCipher(str) {
  return str.replace(/[a-z]/gi, c => {
    let base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
  });
}

export function rot13(str) {
  return caesarCipher(str, 13);
}

export function vigenereCipher(str, key, decrypt = false) {
  if (!key) return str;
  key = key.toLowerCase();
  let j = 0;
  return str.replace(/[a-z]/gi, c => {
    let base = c === c.toUpperCase() ? 65 : 97;
    let k = key.charCodeAt(j % key.length) - 97;
    if (decrypt) k = -k;
    j++;
    return String.fromCharCode(((c.charCodeAt(0) - base + k + 26) % 26) + base);
  });
}
