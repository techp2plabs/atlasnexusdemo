<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'
import { selectCampaign, selectCampaignMatches } from '~/demo/selectors.mjs'

definePageMeta({ layout: 'workspace' })

const route = useRoute()
const demo = useDemoStore()
const session = useSessionStore()
const campaign = computed(() => selectCampaign(demo.data, session.session || {}, String(route.params.id)))
const matches = computed(() => selectCampaignMatches(demo.data, session.session || {}, String(route.params.id)))
const busy = ref(false)
const mode = ref('')
const error = ref('')
const results = computed(() => campaign.value?.fitResults || [])
const shortlisted = computed(() => demo.data.shortlists.filter((item: any) => item.campaignId === campaign.value?.id))
const sortedMatches = computed(() => [...matches.value].sort((a: any, b: any) =>
  (results.value.find((item: any) => item.creatorId === b.id)?.fitScore || 0)
  - (results.value.find((item: any) => item.creatorId === a.id)?.fitScore || 0),
))
const fitResult = (id: string) => results.value.find((item: any) => item.creatorId === id)
const isShortlisted = (id: string) => shortlisted.value.some((item: any) => item.creatorId === id)
const formatCount = (value: number) => Number(value || 0).toLocaleString()

async function analyze() {
  if (!campaign.value) return
  busy.value = true
  error.value = ''
  try {
    const body = {
      campaignId: campaign.value.id,
      campaign: {
        name: campaign.value.name,
        brandName: campaign.value.brandName,
        product: campaign.value.product,
        objective: campaign.value.objective,
        audience: campaign.value.audience,
        languages: campaign.value.languages,
        formats: campaign.value.formats,
      },
      creators: matches.value.map((creator: any) => ({ id: creator.id })),
    }
    const response: any = await $fetch('/api/ai/creator-fit', { method: 'POST', body })
    mode.value = response.mode
    demo.run({ type: 'campaign:save-fit', campaignId: campaign.value.id, results: response.results }, session.session || {})
  } catch (cause: any) {
    error.value = cause?.data?.statusMessage || 'Could not analyze creator fit. Try again.'
  } finally {
    busy.value = false
  }
}

function toggleShortlist(id: string) {
  demo.run({ type: isShortlisted(id) ? 'shortlist:remove' : 'shortlist:add', campaignId: campaign.value.id, creatorId: id }, session.session || {})
}
</script>

<template>
  <main v-if="campaign" class="matching-page">
    <NuxtLink class="campaign-back-link" to="/app/campaigns"><span aria-hidden="true">←</span> Campaigns</NuxtLink>

    <header class="campaign-heading">
      <div class="campaign-heading-copy">
        <p class="campaign-brand">{{ campaign.brandName }} <span aria-hidden="true">/</span> {{ campaign.product }}</p>
        <h1>{{ campaign.name }}</h1>
      </div>
      <button class="analyze-primary" type="button" :disabled="busy || !matches.length" @click="analyze">
        <svg v-if="!busy" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" /></svg>
        {{ busy ? 'Analyzing creators…' : results.length ? 'Refresh creator fit' : 'Analyze creator fit' }}
      </button>
    </header>

    <section class="brief-strip" aria-labelledby="brief-title">
      <div class="brief-copy"><h2 id="brief-title">Creator brief</h2><p>{{ campaign.objective }}</p></div>
      <div class="brief-tags" aria-label="Campaign audience and formats">
        <span class="brief-audience">{{ campaign.audience }}</span>
        <span v-for="language in campaign.languages" :key="`language-${language}`" class="brief-tag">{{ language }}</span>
        <span v-for="format in campaign.formats" :key="`format-${format}`" class="brief-tag brief-tag-format">{{ format }}</span>
      </div>
    </section>

    <p v-if="error" class="match-error" role="alert">{{ error }}</p>

    <div class="matching-layout">
      <section class="creator-panel" aria-labelledby="creator-fit-title">
        <header class="panel-heading">
          <div><h2 id="creator-fit-title">Creator fit</h2><p>Compare channels against the campaign brief.</p></div>
          <span class="match-count">{{ matches.length }} creators</span>
        </header>
        <p v-if="mode" class="analysis-note">{{ mode === 'gemini' ? 'Fit results generated with Gemini' : 'Sample fit preview' }} <span>·</span> Based on public channel and video evidence</p>

        <div v-if="sortedMatches.length" class="creator-list">
          <article v-for="creator in sortedMatches" :key="creator.id" class="creator-entry">
            <div class="creator-row">
              <span class="creator-avatar" aria-hidden="true">{{ creator.name.slice(0, 1) }}</span>
              <div class="creator-identity"><strong>{{ creator.name }}</strong><span>{{ creator.niche }} <i>·</i> {{ formatCount(creator.channel.subscriberCount) }} subscribers</span></div>
              <div class="creator-evidence"><span>{{ creator.videos.length }} public videos</span><span class="evidence-track" aria-hidden="true"><i /></span></div>
              <span v-if="fitResult(creator.id)" class="fit-score" :aria-label="`Fit score ${fitResult(creator.id).fitScore} out of 100`">{{ fitResult(creator.id).fitScore }}<small>fit</small></span>
              <button v-else class="analyze-row" type="button" :disabled="busy" @click="analyze">{{ busy ? 'Working…' : 'Analyze' }}</button>
            </div>
            <div v-if="fitResult(creator.id)" class="creator-insight">
              <div class="insight-copy"><strong>{{ fitResult(creator.id).summary }}</strong><p>{{ fitResult(creator.id).recommendation }}</p><ul><li v-for="reason in fitResult(creator.id).reasons" :key="reason">{{ reason }}</li></ul></div>
              <button class="shortlist-action" :class="{ 'is-saved': isShortlisted(creator.id) }" type="button" @click="toggleShortlist(creator.id)">{{ isShortlisted(creator.id) ? '✓ In shortlist' : '+ Add to shortlist' }}</button>
            </div>
          </article>
        </div>
        <div v-else class="empty-creators"><strong>No matching creators yet</strong><p>Creator matches for this campaign will appear here.</p></div>
        <p class="evidence-disclaimer">Public counters and profile text are sample evidence. Scores are estimates, not verified audience or brand safety data.</p>
      </section>

      <aside class="shortlist-panel" aria-labelledby="shortlist-title">
        <header class="panel-heading shortlist-heading"><div><h2 id="shortlist-title">Shortlist</h2><p>Creators saved for comparison</p></div><span class="shortlist-count">{{ shortlisted.length }}</span></header>
        <div v-if="shortlisted.length" class="shortlist-list">
          <div v-for="item in shortlisted" :key="item.creatorId" class="shortlist-item">
            <span class="shortlist-avatar" aria-hidden="true">{{ demo.data.creators.find((creator: any) => creator.id === item.creatorId)?.name?.slice(0, 1) || '?' }}</span>
            <strong>{{ demo.data.creators.find((creator: any) => creator.id === item.creatorId)?.name || 'Creator' }}</strong>
            <button type="button" :aria-label="`Remove ${demo.data.creators.find((creator: any) => creator.id === item.creatorId)?.name || 'creator'} from shortlist`" @click="toggleShortlist(item.creatorId)">×</button>
          </div>
        </div>
        <div v-else class="shortlist-empty"><span class="shortlist-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v17l-5-3-5 3V4Z" /></svg></span><strong>Your shortlist is empty</strong><p>Add creators to keep your strongest options together for this brief.</p></div>
      </aside>
    </div>
  </main>

  <main v-else class="matching-page campaign-missing"><div><span class="missing-mark">!</span><h1>Campaign not found</h1><p>This campaign may have been removed or may not be available for this account.</p><NuxtLink to="/app/campaigns">Back to campaigns</NuxtLink></div></main>
</template>

<style scoped>
.matching-page{width:min(100%,1280px);margin:0 auto;padding:17px 30px 48px;color:#252236}.campaign-back-link{display:inline-flex;align-items:center;gap:8px;color:#6c687c;font-size:12px;text-decoration:none}.campaign-back-link span{font-size:17px;line-height:1}.campaign-back-link:hover{color:#6041b4}.campaign-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin:20px 0 20px}.campaign-heading-copy{min-width:0}.campaign-brand{margin:0 0 7px;color:#777286;font-size:12px;line-height:1.5}.campaign-brand span{padding:0 5px;color:#bbb7c5}.campaign-heading h1{margin:0;color:#252236;font-size:29px;font-weight:500;letter-spacing:-.04em;line-height:1.2;overflow-wrap:anywhere}.analyze-primary{display:inline-flex;min-height:40px;flex:0 0 auto;align-items:center;justify-content:center;gap:8px;padding:0 14px;border:1px solid #6041b4;border-radius:7px;background:#6041b4;color:#fff;font:500 12px Outfit,ui-sans-serif,system-ui,sans-serif;cursor:pointer;transition:background .14s ease,border-color .14s ease}.analyze-primary:hover:not(:disabled){border-color:#50339e;background:#50339e}.analyze-primary:disabled{opacity:.6;cursor:wait}.analyze-primary svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.brief-strip{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(230px,.8fr);gap:22px;align-items:center;padding:19px 21px;border:1px solid #e5e2ed;border-left:3px solid #7250ce;border-radius:9px;background:#fff}.brief-copy h2{margin:0;color:#403956;font-size:13px;font-weight:550}.brief-copy p{max-width:720px;margin:7px 0 0;color:#686477;font-size:12px;line-height:1.65}.brief-tags{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.brief-audience,.brief-tag{display:inline-flex;min-height:25px;align-items:center;padding:4px 8px;border:1px solid #e8e5ed;border-radius:5px;background:#fff;color:#686477;font-size:10px;line-height:1.35}.brief-audience{background:#f7f5fb;color:#55457e}.brief-tag-format{border-color:#e7e0f6;background:#f7f5fb;color:#6041b4}.match-error{margin:12px 0 0;padding:10px 12px;border:1px solid #efc9c7;border-radius:7px;background:#fff8f7;color:#8b3028;font-size:12px}.matching-layout{display:grid;grid-template-columns:minmax(0,1fr) 286px;align-items:start;gap:16px;margin-top:16px}.creator-panel,.shortlist-panel{min-width:0;overflow:hidden;border:1px solid #e5e2ed;border-radius:10px;background:#fff}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:17px 19px;border-bottom:1px solid #ece9f0}.panel-heading h2{margin:0;color:#252236;font-size:14px;font-weight:550}.panel-heading p{margin:5px 0 0;color:#898596;font-size:11px;line-height:1.4}.match-count{flex:0 0 auto;padding:5px 8px;border-radius:5px;background:#f6f5f9;color:#686477;font-size:10px}.analysis-note{margin:0;padding:10px 19px;border-bottom:1px solid #f0eef3;background:#fcfbfd;color:#777286;font-size:10px}.analysis-note span{padding:0 4px;color:#bbb7c5}.creator-list{padding:0 19px}.creator-entry{border-bottom:1px solid #ece9f0}.creator-entry:last-child{border-bottom:0}.creator-row{display:grid;grid-template-columns:36px minmax(0,1fr) 100px 43px 72px;align-items:center;gap:12px;min-height:72px}.creator-avatar,.shortlist-avatar{display:grid;width:36px;height:36px;place-items:center;border-radius:9px;background:#eee9fa;color:#6041b4;font-size:13px;font-weight:550}.creator-identity{min-width:0}.creator-identity strong,.creator-identity span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.creator-identity strong{color:#403956;font-size:12px;font-weight:550}.creator-identity span{margin-top:5px;color:#898596;font-size:10px}.creator-identity span i{padding:0 3px;color:#b2aebd;font-style:normal}.creator-evidence{display:grid;gap:7px;color:#898596;font-size:10px}.evidence-track{height:3px;overflow:hidden;border-radius:2px;background:#eeecf2}.evidence-track i{display:block;width:66%;height:100%;border-radius:2px;background:#a894dc}.fit-score{display:flex;width:38px;height:38px;flex-direction:column;align-items:center;justify-content:center;border:1px solid #d9cfee;border-radius:50%;color:#6041b4;font-size:13px;font-weight:600;line-height:1}.fit-score small{margin-top:2px;color:#898596;font-size:8px;font-weight:400}.analyze-row{justify-self:end;padding:7px 10px;border:1px solid #ded9e9;border-radius:6px;background:#fff;color:#6041b4;font:500 10px Outfit,ui-sans-serif,system-ui,sans-serif;cursor:pointer}.analyze-row:hover:not(:disabled){background:#f7f5fb}.analyze-row:disabled{opacity:.55;cursor:wait}.creator-insight{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin:0 0 14px 48px;padding:13px 14px;border-left:2px solid #c9bce7;background:#faf9fc}.insight-copy{min-width:0}.insight-copy>strong{display:block;color:#403956;font-size:11px;font-weight:550;line-height:1.5}.insight-copy p{margin:5px 0 7px;color:#686477;font-size:10px;line-height:1.55}.insight-copy ul{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0;padding-left:14px;color:#777286;font-size:10px;line-height:1.5}.shortlist-action{flex:0 0 auto;padding:6px 9px;border:1px solid #ded9e9;border-radius:5px;background:#fff;color:#6041b4;font:500 10px Outfit,ui-sans-serif,system-ui,sans-serif;cursor:pointer}.shortlist-action:hover,.shortlist-action.is-saved{border-color:#d6cbe9;background:#f1edf8}.shortlist-action.is-saved{color:#503b80}.empty-creators{padding:34px 20px;text-align:center}.empty-creators strong{color:#403956;font-size:12px;font-weight:550}.empty-creators p{margin:6px 0 0;color:#898596;font-size:11px}.evidence-disclaimer{margin:0;padding:12px 19px;border-top:1px solid #ece9f0;background:#fcfbfd;color:#898596;font-size:10px;line-height:1.5}.shortlist-count{display:grid;width:25px;height:25px;place-items:center;border-radius:50%;background:#f0edf8;color:#6041b4;font-size:11px;font-weight:550}.shortlist-list{padding:4px 17px}.shortlist-item{display:flex;min-width:0;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #f0eef3}.shortlist-item:last-child{border-bottom:0}.shortlist-avatar{width:30px;height:30px;flex:0 0 30px;border-radius:7px;font-size:11px}.shortlist-item strong{min-width:0;flex:1;overflow:hidden;color:#403956;font-size:11px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}.shortlist-item button{width:25px;height:25px;border:0;border-radius:5px;background:transparent;color:#898596;font-size:17px;cursor:pointer}.shortlist-item button:hover{background:#f6f5f9;color:#6041b4}.shortlist-empty{display:flex;min-height:220px;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center}.shortlist-empty-icon{display:grid;width:38px;height:38px;margin-bottom:12px;place-items:center;border:1px solid #e9e5f2;border-radius:9px;background:#faf9fc;color:#8b79bd}.shortlist-empty-icon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.shortlist-empty strong{color:#403956;font-size:11px;font-weight:550}.shortlist-empty p{max-width:190px;margin:6px 0 0;color:#898596;font-size:10px;line-height:1.6}.campaign-missing{display:grid;min-height:55vh;place-items:center}.campaign-missing>div{max-width:420px;padding:30px;border:1px solid #e5e2ed;border-radius:10px;background:#fff;text-align:center}.missing-mark{display:grid;width:36px;height:36px;margin:0 auto 12px;place-items:center;border-radius:50%;background:#f2f1f4;color:#777286}.campaign-missing h1{margin:0;color:#252236;font-size:18px;font-weight:500}.campaign-missing p{margin:8px 0 16px;color:#777286;font-size:12px;line-height:1.6}.campaign-missing a{color:#6041b4;font-size:12px;text-decoration:none}.campaign-missing a:hover{text-decoration:underline;text-underline-offset:3px}
.matching-page :is(a,button):focus-visible{outline:2px solid #7250ce;outline-offset:3px}
@media(max-width:1000px){.matching-layout{grid-template-columns:minmax(0,1fr) 250px}.creator-row{grid-template-columns:36px minmax(0,1fr) 78px 39px 65px;gap:9px}.creator-list{padding-inline:14px}.creator-insight{margin-left:45px}}
@media(max-width:760px){.matching-page{padding:15px 18px 40px}.campaign-heading{align-items:flex-start;flex-direction:column;gap:14px;margin:18px 0}.campaign-heading h1{font-size:25px}.analyze-primary{width:100%}.brief-strip{grid-template-columns:1fr;gap:14px;padding:16px}.brief-tags{justify-content:flex-start}.matching-layout{grid-template-columns:1fr;gap:12px;margin-top:12px}.creator-row{grid-template-columns:34px minmax(0,1fr) 38px;gap:10px;min-height:68px}.creator-avatar{width:34px;height:34px}.creator-evidence{display:none}.fit-score{width:36px;height:36px}.analyze-row{grid-column:3;grid-row:1;padding:7px 8px}.creator-insight{flex-direction:column;margin-left:0;padding:12px}.shortlist-action{align-self:flex-start}.panel-heading{padding:15px}.creator-list{padding-inline:15px}.evidence-disclaimer{padding-inline:15px}.shortlist-empty{min-height:170px}}
@media(prefers-reduced-motion:reduce){.matching-page *{scroll-behavior:auto!important;transition-duration:0ms!important}}
</style>
