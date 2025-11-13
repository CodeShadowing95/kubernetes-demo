const revoked = new Map()

export function revokeToken(jti, expSeconds) {
  if (!jti) return
  const now = Math.floor(Date.now() / 1000)
  const ttl = Math.max(0, Number(expSeconds || now) - now)
  revoked.set(jti, now + ttl)
}

export function isRevoked(jti) {
  if (!jti) return false
  const exp = revoked.get(jti)
  if (!exp) return false
  const now = Math.floor(Date.now() / 1000)
  if (exp <= now) {
    revoked.delete(jti)
    return false
  }
  return true
}