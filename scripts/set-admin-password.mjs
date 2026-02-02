import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Hash the password
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Update admin account with password
  const [result] = await conn.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hashedPassword, 'admin@packgo.com']
  );
  
  console.log('Password updated for admin@packgo.com');
  console.log('Result:', result);
  
  await conn.end();
}
main().catch(console.error);
