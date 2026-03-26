import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash('PackGo2026', 10);
console.log(hash);
