// Gera o valor de ADMIN_PASSWORD_HASH (scrypt) e um SESSION_SECRET aleatório.
// Uso: npm run admin:hash -- "sua-senha-forte"
import crypto from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Informe uma senha com pelo menos 10 caracteres: npm run admin:hash -- "sua-senha"');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
console.log(`ADMIN_PASSWORD_HASH=${salt.toString("hex")}:${hash.toString("hex")}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString("base64url")}`);
