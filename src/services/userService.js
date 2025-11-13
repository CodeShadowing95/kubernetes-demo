import bcrypt from 'bcryptjs'
import { query } from '../db.js'

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email || '').trim())
}

export async function createUser(email, password) {
  if (!validateEmail(email)) throw new Error('INVALID_EMAIL')
  const exists = await query('SELECT 1 FROM users WHERE email=$1', [email])
  if (exists.rowCount) throw new Error('EMAIL_IN_USE')
  const hash = await bcrypt.hash(password, 10)
  const res = await query(
    'INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id, email, created_at',
    [email, hash]
  )
  return res.rows[0]
}

export async function authenticate(email, password) {
  if (!validateEmail(email)) throw new Error('INVALID_EMAIL')
  const res = await query('SELECT id, email, password_hash FROM users WHERE email=$1', [email])
  if (!res.rowCount) return null
  const u = res.rows[0]
  const ok = await bcrypt.compare(password, u.password_hash)
  if (!ok) return null
  return { id: u.id, email: u.email }
}