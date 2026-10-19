import { useOrganizations } from '~/composables/useOrganizations'
import { useMcns } from '~/composables/useMcns'
import type { SelectOption } from '~/components/forms/Select.vue'

export function useCascadingDropdowns(prefillOrganizationId?: string | null, prefillMcnId?: string | null) {
  const authStore = useAuthStore()
  const { organizations, fetchOrganizations } = useOrganizations()
  const { mcns, fetchMcns, loading: loadingMcns } = useMcns()

  const selectedOrganizationId = ref<string | null>(prefillOrganizationId || null)
  const selectedMcnId = ref<string | null>(prefillMcnId || null)

  // Organization dropdown logic
  const isOrganizationDisabled = computed(() => {
    const role = authStore.user?.role
    return role === 'org_owner' || role === 'org_admin' || role === 'mcn_operator'
  })

  const organizationOptions = computed<SelectOption[]>(() => {
    const formatLabel = (org: { brand_name?: string; name: string }) =>
      org.brand_name ? `${org.brand_name} - ${org.name}` : org.name
    if (isOrganizationDisabled.value && authStore.user?.organization_id) {
      // For org_owner/org_admin/mcn_operator, show only their organization
      const org = organizations.value.find(org => org.id === authStore.user?.organization_id)
      if (org) {
        return [{ value: org.id, label: formatLabel(org) }]
      }
      return []
    }
    // For atlas_superadmin/atlas_admin, show all organizations
    return organizations.value.map(org => ({
      value: org.id,
      label: formatLabel(org),
    }))
  })

  // MCN dropdown logic
  const mcnOptions = computed<SelectOption[]>(() => {
    if (!selectedOrganizationId.value) {
      return []
    }
    // Filter MCNs by selected organization
    return mcns.value
      .filter(mcn => mcn.organization_id === selectedOrganizationId.value)
      .map(mcn => ({
        value: mcn.id,
        label: mcn.name,
      }))
  })

  const isMcnDisabled = computed(() => {
    const role = authStore.user?.role
    // MCN operators can only use their own MCN
    if (role === 'mcn_operator') {
      return true
    }
    return !selectedOrganizationId.value || loadingMcns.value
  })

  // Watch for organization changes and fetch MCNs
  watch(selectedOrganizationId, async (newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId) {
      // Clear MCN selection when organization changes
      selectedMcnId.value = null
      
      // Fetch MCNs for the selected organization
      await fetchMcns(newOrgId)
    } else if (!newOrgId) {
      // Clear MCNs when no organization selected
      selectedMcnId.value = null
    }
  })

  // Initialize: Load organizations and pre-fill if needed.
  // Optional override uses current prefill (e.g. from props when modal opens) so prefilled MCN is set even if composable was created before props were available.
  const initialize = async (override?: { organizationId?: string | null; mcnId?: string | null }) => {
    const orgId = override?.organizationId ?? prefillOrganizationId
    const mcnId = override?.mcnId ?? prefillMcnId

    // Fetch organizations if not already loaded
    if (organizations.value.length === 0) {
      await fetchOrganizations()
    }

    // Auto-select organization for org users
    if (isOrganizationDisabled.value && authStore.user?.organization_id) {
      selectedOrganizationId.value = authStore.user.organization_id
    } else if (orgId) {
      selectedOrganizationId.value = orgId
    }

    // If organization is selected, fetch MCNs
    if (selectedOrganizationId.value) {
      await fetchMcns(selectedOrganizationId.value)
      // Auto-select MCN for MCN operators
      if (authStore.user?.role === 'mcn_operator' && authStore.user?.mcn_id) {
        selectedMcnId.value = authStore.user.mcn_id
      } else if (mcnId) {
        selectedMcnId.value = mcnId
      }
    }
  }

  return {
    selectedOrganizationId,
    selectedMcnId,
    organizationOptions,
    mcnOptions,
    isOrganizationDisabled,
    isMcnDisabled,
    loadingMcns,
    initialize,
  }
}

