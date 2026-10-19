/**
 * Client-side mirror of the server forecast engine
 * (`app/services/forecast_service.py`, engine `v1-views-er-only`).
 *
 * Why a mirror exists: the prototype recomputes the forecast as you type
 * (`campaign.html` #forecast-panel), and losing that turned the number into a
 * report you had to request rather than a planning tool you could steer. The
 * server stays authoritative — it is what `POST /campaigns/{id}/forecast`
 * persists and what launch freezes as the baseline — so this file must stay
 * formula-identical to it.
 *
 * This replaces the earlier port of the prototype's own `computeForecast`, which
 * carried ASSUMED_PAID_ROAS and produced GMV / ROI / ROAS figures. Those are not
 * shipped: there is no commerce data source until Merchant API access lands, so
 * the UI shows "Coming Soon" rather than an invented number.
 */

export interface ForecastAssumptions {
  committed_videos_per_creator: number
  assumed_cpm: number
  paid_er_decay: number
}

export const DEFAULT_ASSUMPTIONS: ForecastAssumptions = {
  committed_videos_per_creator: 3,
  assumed_cpm: 25_000,
  paid_er_decay: 0.72,
}

export const UNAVAILABLE_REASON = 'coming_soon_merchant_api'

export type InvestmentMix = 'creator' | 'ads' | 'hybrid'

export interface ForecastRosterEntry {
  creator_profile_id: string
  avg_views_per_video: number
  engagement_rate: number
}

export interface ForecastOutputs {
  views: { organic: number; paid: number; total: number }
  engagement_rate: number
  gmv: null
  roi: null
  roas: null
  cce: null
  unavailable_reason: string
}

export function computeForecast(options: {
  investmentMix: InvestmentMix
  adsSpend: number
  roster: ForecastRosterEntry[]
  assumptions?: Partial<ForecastAssumptions>
}): ForecastOutputs {
  const a = { ...DEFAULT_ASSUMPTIONS, ...(options.assumptions ?? {}) }
  const committed = a.committed_videos_per_creator

  let organicViews = 0
  let organicEr = 0

  if (options.investmentMix !== 'ads') {
    organicViews = options.roster.reduce((sum, r) => sum + (r.avg_views_per_video || 0) * committed, 0)
    const weighted = options.roster.reduce(
      (sum, r) => sum + (r.avg_views_per_video || 0) * committed * (r.engagement_rate || 0),
      0,
    )
    organicEr = organicViews > 0 ? weighted / organicViews : 0
  }

  let adsSpend = options.adsSpend
  let paidViews = 0
  let paidEr = 0

  if (options.investmentMix === 'creator') {
    adsSpend = 0
  } else {
    paidViews = adsSpend && a.assumed_cpm ? (adsSpend / a.assumed_cpm) * 1000 : 0
    paidEr = organicEr ? organicEr * a.paid_er_decay : 0
  }

  const totalViews = organicViews + paidViews
  const engagementRate =
    totalViews > 0 ? (organicViews * organicEr + paidViews * paidEr) / totalViews : 0

  return {
    views: {
      organic: Math.round(organicViews),
      paid: Math.round(paidViews),
      total: Math.round(totalViews),
    },
    engagement_rate: Math.round(engagementRate * 100) / 100,
    gmv: null,
    roi: null,
    roas: null,
    cce: null,
    unavailable_reason: UNAVAILABLE_REASON,
  }
}

/**
 * Budget split, mirroring `campaign_service.recompute_planned_costs`: creator spend
 * is the package roll-up and ads take whatever is left of the total budget.
 * `remaining` goes negative when the packages overrun the budget — the caller
 * surfaces that as the overrun warning rather than clamping it away.
 */
export function syncSpend(
  investmentMix: InvestmentMix,
  totalBudget: number,
  packageTotal: number,
): { creatorSpend: number; adsSpend: number; remaining: number } {
  if (investmentMix === 'creator') {
    return { creatorSpend: packageTotal, adsSpend: 0, remaining: totalBudget - packageTotal }
  }
  if (investmentMix === 'ads') {
    return { creatorSpend: 0, adsSpend: totalBudget, remaining: 0 }
  }
  const adsSpend = Math.max(0, totalBudget - packageTotal)
  return { creatorSpend: packageTotal, adsSpend, remaining: totalBudget - packageTotal - adsSpend }
}
