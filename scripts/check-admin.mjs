import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute('SELECT id, email, name, role, password, google_id FROM users WHERE role = "admin"');
  console.log(JSON.stringify(rows.map(r => ({
    id: r.id,
    email: r.email,
    name: r.name,
    hasPassword: !!r.password,
    hasGoogleId: !!r.google_id
  })), null, 2));
  await conn.end();
}
main().catch(console.error);
