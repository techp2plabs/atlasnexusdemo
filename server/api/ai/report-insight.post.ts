import { validateReportRequest } from '../../utils/ai-request.mjs'
import { generateReportInsight } from '../../utils/ai-service.mjs'
import { createSeed } from '~~/demo/seed.mjs'

export default defineEventHandler(async (event) => {
  if (!allowAiRequest(event)) throw createError({ statusCode: 429, statusMessage: 'Too many AI requests. Try again in a minute.' })
  let request
  try { request = validateReportRequest(await readBody(event)) } catch (error: any) { throw createError({ statusCode: 400, statusMessage: error.message }) }
  const seed = createSeed()
  const report = { ...request, videos: request.videoIds.map((id: string) => seed.videos.find((video: any) => video.id === id)).filter(Boolean) }
  if (report.videos.length !== request.videoIds.length) throw createError({ statusCode: 400, statusMessage: 'Report video evidence is incomplete.' })
  const config = useRuntimeConfig(event)
  try {
    const result = await generateReportInsight({ report, config: { apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY || '', model: config.geminiModel, production: import.meta.prod }, clientFactory: async (apiKey: string) => {
      const { GoogleGenAI } = await import('@google/genai')
      return new GoogleGenAI({ apiKey, httpOptions: { timeout: 30_000 } })
    } })
    return result
  } catch (error: any) {
    if (error.statusCode) throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    console.error('Gemini report insight request failed:', error.message)
    throw createError({ statusCode: 502, statusMessage: 'Gemini could not create this insight right now.' })
  }
})
