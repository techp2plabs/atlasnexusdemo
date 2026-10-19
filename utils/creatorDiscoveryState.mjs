const sorts = ['channel_synced_at_desc', 'avg_views_desc', 'engagement_rate_desc', 'subscriber_count_desc', 'title_asc']
const sources = ['managed_channel', 'manual_lookup', 'import', 'brand_deal_report']
const scalar = (value) => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
const minimum = (value, max = Infinity) => {
  const raw = scalar(value)
  const number = Number(raw)
  return raw.trim() && Number.isFinite(number) && number >= 0 && number <= max ? number : undefined
}

export function parseDiscoveryQuery(query = {}) {
  const page = Number(scalar(query.page))
  return {
    q: scalar(query.q).trim(),
    topics: [...new Set(scalar(query.topics).split(',').map((item) => item.trim()).filter(Boolean))],
    country: /^[a-z]{2}$/i.test(scalar(query.country)) ? scalar(query.country).toUpperCase() : '',
    source: sources.includes(scalar(query.source)) ? scalar(query.source) : '',
    has_verified_youtube_rates: scalar(query.verified_rates) === 'true' ? true : undefined,
    min_subscribers: minimum(query.min_subs),
    min_avg_views: minimum(query.min_avg_views),
    min_engagement_rate: minimum(query.min_engagement_rate, 100),
    sort: sorts.includes(scalar(query.sort)) ? scalar(query.sort) : sorts[0],
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

export function discoveryQuery(filters) {
  const query = { sort: filters.sort, page: filters.page || 1 }
  for (const key of ['q', 'country', 'source']) if (filters[key]) query[key] = filters[key]
  if (filters.topics?.length) query.topics = filters.topics.join(',')
  for (const [field, key] of [['min_subscribers', 'min_subs'], ['min_avg_views', 'min_avg_views'], ['min_engagement_rate', 'min_engagement_rate']]) {
    if (filters[field] !== undefined && filters[field] !== '') query[key] = filters[field]
  }
  if (filters.has_verified_youtube_rates) query.verified_rates = 'true'
  return query
}

export function youtubeRateState(rateCard) {
  const hasAmount = ['shorts', 'longform'].some((section) => ['min', 'max'].some((key) => rateCard?.[section]?.[key] != null && rateCard[section][key] !== ''))
  if (!hasAmount) return 'Rates not added'
  if (!rateCard?.currency_verified || !['IDR', 'USD'].includes(rateCard.currency)) return 'Currency unverified'
  return 'Verified YouTube rates'
}
