import { validateFitRequest } from '../../utils/ai-request.mjs'
import { generateCreatorFit } from '../../utils/ai-service.mjs'
import { createSeed } from '~~/demo/seed.mjs'
import { selectCampaign } from '~~/demo/selectors.mjs'

export default defineEventHandler(async (event) => {
  if (!allowAiRequest(event)) throw createError({ statusCode: 429, statusMessage: 'Too many AI requests. Try again in a minute.' })
  let request
  try { request = validateFitRequest(await readBody(event)) } catch (error: any) { throw createError({ statusCode: 400, statusMessage: error.message }) }
  const seed = createSeed()
  const campaign = selectCampaign(seed, { role: 'admin' }, request.campaignId) || request.campaign
  if (!campaign) throw createError({ statusCode: 400, statusMessage: 'Campaign brief is unavailable.' })
  const creators = request.creatorIds.map((id: string) => {
    const creator = seed.creators.find((item: any) => item.id === id)
    return { id, channel: seed.channels.find((channel: any) => channel.id === creator.channelId), videos: seed.videos.filter((video: any) => video.channelId === creator.channelId).slice(0, 3) }
  })
  const config = useRuntimeConfig(event)
  try {
    const result = await generateCreatorFit({ campaign, creators, config: { apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY || '', model: config.geminiModel, production: import.meta.prod }, clientFactory: async (apiKey: string) => {
      const { GoogleGenAI } = await import('@google/genai')
      return new GoogleGenAI({ apiKey, httpOptions: { timeout: 30_000 } })
    } })
    return result
  } catch (error: any) {
    if (error.statusCode) throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    console.error('Gemini creator fit request failed:', error.message)
    throw createError({ statusCode: 502, statusMessage: 'Gemini could not analyze this campaign right now.' })
  }
})
