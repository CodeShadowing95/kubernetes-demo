import jwt from 'jsonwebtoken'
import { isRevoked } from '../services/tokenService.js'

export function requireAuth(req, res, next) {
  const h = req.headers['authorization'] || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    if (isRevoked(payload.jti)) return res.status(401).json({ error: 'Token revoked' })
    req.user = { id: Number(payload.sub), email: payload.email }
    req.token = token
    req.tokenPayload = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}