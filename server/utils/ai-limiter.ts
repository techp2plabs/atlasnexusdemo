import { createWindowLimiter } from './ai-request.mjs'

const limiter = createWindowLimiter({ limit: 8, windowMs: 60_000 })

export function allowAiRequest(event: any) {
  const address = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return limiter.take(address)
}
