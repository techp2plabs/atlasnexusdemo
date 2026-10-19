import { useCampaignsStore } from '~/stores/youtubeBrandCampaign/campaigns'
import type { CampaignStatus } from '~/mocks/fixtures/campaigns'

/**
 * Composable seam for Campaigns (release-plan-09 §8.1).
 * Written against release-plan-03 §B.2 `/api/v1/campaigns` request/response
 * shapes; today all functions resolve from the mock Pinia store. Swapping to
 * the real endpoints later is a change to this file's function bodies only.
 */
export function useCampaigns() {
  const store = useCampaignsStore()

  function list(status: CampaignStatus | 'all' = 'all') {
    // TODO(R0/R2): replace with `useApi().get('/api/v1/campaigns', { params: { status } })`
    return store.byStatus(status)
  }

  function listOpenForCreators() {
    // TODO(R3): replace with `useApi().get('/api/v1/campaigns', { params: { status: 'open' } })`
    return store.openForCreators
  }

  function get(id: string) {
    // TODO(R0/R2): replace with `useApi().get(`/api/v1/campaigns/${id}`)`
    return store.byId(id)
  }

  function createDraft(input: { name: string; brand: string; budget_total: number; start_date: string; end_date: string }) {
    // TODO(R0): replace with `useApi().post('/api/v1/campaigns', input)`
    return store.createDraft(input)
  }

  function addCreator(campaignId: string, creator: { creator_id: string; creator_name: string; package_cost: number }) {
    // TODO(R2): replace with `useApi().post(`/api/v1/campaigns/${campaignId}/creators`, creator)`
    store.addCreator(campaignId, creator)
  }

  function removeCreator(campaignId: string, creatorId: string) {
    // TODO(R2): replace with `useApi().delete(`/api/v1/campaigns/${campaignId}/creators/${creatorId}`)`
    store.removeCreator(campaignId, creatorId)
  }

  function registerVideo(
    campaignId: string,
    video: { creator_id: string; creator_name: string; url: string; format: 'short' | 'longform'; product_tagged: boolean },
  ) {
    // TODO(R4): replace with `useApi().post(`/api/v1/campaigns/${campaignId}/videos`, video)`
    store.registerVideo(campaignId, video)
  }

  function verifyVideo(campaignId: string, videoId: string) {
    // TODO(R4): replace with `useApi().post(`/api/v1/campaigns/${campaignId}/videos/${videoId}/verify`)`
    store.verifyVideo(campaignId, videoId)
  }

  function setForecastMode(campaignId: string, mode: 'hybrid' | 'creator' | 'ads') {
    // TODO(R0/R2): replace with `useApi().patch(`/api/v1/campaigns/${campaignId}`, { forecast_mode: mode })`
    store.setForecastMode(campaignId, mode)
  }

  function setTargetRoi(campaignId: string, targetRoi: number) {
    // TODO(R0/R2): replace with `useApi().patch(`/api/v1/campaigns/${campaignId}`, { target_roi: targetRoi })`
    store.setTargetRoi(campaignId, targetRoi)
  }

  function addProduct(campaignId: string, product: { sku: string; name: string; price: number; gmv_share_pct: number }) {
    // TODO(R2): replace with `useApi().post(`/api/v1/campaigns/${campaignId}/products`, product)`
    store.addProduct(campaignId, product)
  }

  function removeProduct(campaignId: string, sku: string) {
    // TODO(R2): replace with `useApi().delete(`/api/v1/campaigns/${campaignId}/products/${sku}`)`
    store.removeProduct(campaignId, sku)
  }

  return {
    list,
    listOpenForCreators,
    get,
    createDraft,
    addCreator,
    removeCreator,
    registerVideo,
    verifyVideo,
    setForecastMode,
    setTargetRoi,
    addProduct,
    removeProduct,
    store,
  }
}
