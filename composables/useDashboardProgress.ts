import { useApi } from '~/composables/useApi'

export interface ProgressData {
  mcnsCount: number
  channelsCount: number
  contractsCount: number
  creatorUsersCount: number
  mcnOperatorsCount: number
}

export interface NextAction {
  label: string
  action: string
  description?: string
}

export function useDashboardProgress() {
  const { get } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const progressData = ref<ProgressData>({
    mcnsCount: 0,
    channelsCount: 0,
    contractsCount: 0,
    creatorUsersCount: 0,
    mcnOperatorsCount: 0,
  })

  const fetchProgressData = async () => {
    loading.value = true
    error.value = null
    try {
      // Fetch all data in parallel
      // Use catch to silently handle 404s (APIs may not exist yet) and other errors
      const [mcnsResponse, channelsResponse, contractsResponse, usersResponse] = await Promise.allSettled([
        get('/api/v1/mcns').catch((err: any) => {
          // Silently handle 404s, only log unexpected errors
          if (err.response?.status !== 404) {
            console.error('Failed to fetch MCNs:', err)
          }
          return { data: [] }
        }),
        get('/api/v1/channels').catch((err: any) => {
          // Channels API may not exist yet (404 is expected for Phase 1)
          // Silently handle 404, only log other errors
          if (err.response?.status !== 404) {
            console.error('Failed to fetch channels:', err)
          }
          return { data: [] }
        }),
        get('/api/v1/contracts').catch((err: any) => {
          // Contracts API may not exist yet (404 is expected for Phase 1)
          // Silently handle 404, only log other errors
          if (err.response?.status !== 404) {
            console.error('Failed to fetch contracts:', err)
          }
          return { data: [] }
        }),
        get('/api/v1/users').catch((err: any) => {
          // Silently handle 404s and 500s, only log unexpected errors
          if (err.response?.status !== 404 && err.response?.status !== 500) {
            console.error('Failed to fetch users:', err)
          }
          return { data: [] }
        }),
      ])

      // Extract MCNs count
      if (mcnsResponse.status === 'fulfilled') {
        const mcnsData = mcnsResponse.value.data || []
        progressData.value.mcnsCount = Array.isArray(mcnsData) ? mcnsData.length : 0
      } else {
        progressData.value.mcnsCount = 0
      }

      // Extract channels count
      if (channelsResponse.status === 'fulfilled') {
        const channelsData = channelsResponse.value.data || []
        progressData.value.channelsCount = Array.isArray(channelsData) ? channelsData.length : 0
      } else {
        progressData.value.channelsCount = 0
      }

      // Extract contracts count
      if (contractsResponse.status === 'fulfilled') {
        const contractsData = contractsResponse.value.data || []
        progressData.value.contractsCount = Array.isArray(contractsData) ? contractsData.length : 0
      } else {
        progressData.value.contractsCount = 0
      }

      // Extract users counts
      if (usersResponse.status === 'fulfilled') {
        const usersData = usersResponse.value.data || []
        const users = Array.isArray(usersData) ? usersData : []
        progressData.value.creatorUsersCount = users.filter((u: any) => u.role === 'creator').length
        progressData.value.mcnOperatorsCount = users.filter((u: any) => u.role === 'mcn_operator').length
      } else {
        progressData.value.creatorUsersCount = 0
        progressData.value.mcnOperatorsCount = 0
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch progress data'
      console.error('Failed to fetch progress data:', err)
    } finally {
      loading.value = false
    }
  }

  const calculateProgress = (): number => {
    const { mcnsCount, channelsCount, contractsCount, creatorUsersCount, mcnOperatorsCount } = progressData.value

    // 0%: No MCNs exist
    if (mcnsCount === 0) {
      return 0
    }

    // 25%: MCNs exist, no channels
    if (mcnsCount > 0 && channelsCount === 0) {
      return 25
    }

    // 50%: Channels exist, no contracts
    if (channelsCount > 0 && contractsCount === 0) {
      return 50
    }

    // 75%: Contracts exist, no team members
    if (contractsCount > 0 && (creatorUsersCount === 0 || mcnOperatorsCount === 0)) {
      return 75
    }

    // 100%: All setup complete (MCNs, channels, contracts, and at least one team member type)
    if (
      mcnsCount > 0 &&
      channelsCount > 0 &&
      contractsCount > 0 &&
      (creatorUsersCount > 0 || mcnOperatorsCount > 0)
    ) {
      return 100
    }

    // Default to 0 if none of the conditions match
    return 0
  }

  const getCurrentStep = (): number => {
    const progress = calculateProgress()
    if (progress === 0) return 1
    if (progress === 25) return 2
    if (progress === 50) return 3
    if (progress === 75) return 4
    return 4 // 100% is still step 4 (completed)
  }

  const getProgressPercentage = (): number => {
    return calculateProgress()
  }

  const getNextActions = (): NextAction[] => {
    const progress = calculateProgress()
    const { mcnsCount, channelsCount, contractsCount, creatorUsersCount, mcnOperatorsCount } = progressData.value

    if (progress === 0) {
      return [
        {
          label: 'Add your first MCN',
          action: 'add_mcn',
          description: 'Create your first MCN to get started',
        },
      ]
    }

    if (progress === 25) {
      return [
        {
          label: 'Fetch Channels',
          action: 'fetch_channels',
          description: 'Fetch channels from your Content Owner ID',
        },
        {
          label: 'Add Channel Manually',
          action: 'add_channel',
          description: 'Add a channel manually',
        },
      ]
    }

    if (progress === 50) {
      return [
        {
          label: 'Set up Contracts',
          action: 'setup_contracts',
          description: 'Create contracts to define revenue splits',
        },
      ]
    }

    if (progress === 75) {
      const actions: NextAction[] = []
      if (mcnOperatorsCount === 0) {
        actions.push({
          label: 'Invite MCN Operator',
          action: 'invite_mcn_operator',
          description: 'Invite an MCN operator to manage your MCN',
        })
      }
      if (creatorUsersCount === 0) {
        actions.push({
          label: 'Invite Creator User',
          action: 'invite_creator',
          description: 'Invite creator users to join your MCN',
        })
      }
      return actions
    }

    // 100% - no actions needed
    return []
  }

  const refresh = async () => {
    await fetchProgressData()
  }

  return {
    progressData,
    loading,
    error,
    fetchProgressData,
    calculateProgress,
    getCurrentStep,
    getProgressPercentage,
    getNextActions,
    refresh,
  }
}

