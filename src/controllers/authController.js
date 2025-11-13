import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { createUser, authenticate } from '../services/userService.js'
import { requireAuth } from '../middleware/auth.js'
import { revokeToken } from '../services/tokenService.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password || String(password).length < 6) return res.status(400).json({ error: 'INVALID_INPUT' })
  try {
    const user = await createUser(String(email).toLowerCase(), String(password))
    return res.status(201).json({ id: user.id, email: user.email, created_at: user.created_at })
  } catch (e) {
    if (e.message === 'INVALID_EMAIL') return res.status(400).json({ error: 'INVALID_EMAIL' })
    if (e.message === 'EMAIL_IN_USE') return res.status(409).json({ error: 'EMAIL_IN_USE' })
    return res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'INVALID_INPUT' })
  try {
    const user = await authenticate(String(email).toLowerCase(), String(password))
    if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    const token = jwt.sign({ email: user.email, jti: uuidv4() }, process.env.JWT_SECRET || 'dev-secret', {
      subject: String(user.id),
      expiresIn: '1h'
    })
    return res.json({ token })
  } catch (e) {
    if (e.message === 'INVALID_EMAIL') return res.status(400).json({ error: 'INVALID_EMAIL' })
    return res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

router.post('/logout', requireAuth, async (req, res) => {
  const payload = req.tokenPayload
  revokeToken(payload.jti, payload.exp)
  return res.status(204).end()
})

export default router