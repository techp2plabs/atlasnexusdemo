import { useApi } from '~/composables/useApi'
import type { Contract, ContractCreate, ContractUpdate, ContractType, ContractStatus, ContractWithWarnings, RevenueSplit } from '~/types/contract'

export interface ContractFilters {
    organization_id?: string
    mcn_id?: string
    channel_id?: string
    contract_type?: ContractType
    status?: ContractStatus
    contract_number?: string
    entity_name?: string
    /** When true, API returns only contracts with end_date in the next 60 days (not expired). */
    expiring_soon?: boolean
    page?: number
    page_size?: number
}

export interface PaginatedContractsResponse {
    items: Contract[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export function useContracts() {
    const api = useApi()
    const { get, post, put } = api
    const deleteRequest = api.delete
    const contracts = ref<Contract[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref({
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0
    })

    const fetchContracts = async (filters?: ContractFilters) => {
        loading.value = true
        error.value = null
        try {
            const params: Record<string, string | number | boolean> = {}
            if (filters?.organization_id) params.organization_id = filters.organization_id
            if (filters?.mcn_id) params.mcn_id = filters.mcn_id
            if (filters?.channel_id) params.channel_id = filters.channel_id
            if (filters?.contract_type) params.contract_type = filters.contract_type
            if (filters?.status) params.status = filters.status
            if (filters?.contract_number) params.contract_number = filters.contract_number
            if (filters?.entity_name) params.entity_name = filters.entity_name
            if (filters?.expiring_soon === true) params.expiring_soon = true
            params.page = filters?.page || 1
            params.page_size = filters?.page_size || 10

            const response = await get<PaginatedContractsResponse>('/api/v1/contracts', { params })
            const data = response.data

            if (data && data.items) {
                contracts.value = data.items
                pagination.value = {
                    total: data.total,
                    page: data.page,
                    page_size: data.page_size,
                    total_pages: data.total_pages
                }
            } else if (Array.isArray(data)) {
                // Fallback for backward compatibility if API returns array
                contracts.value = data
                pagination.value = {
                    total: data.length,
                    page: 1,
                    page_size: data.length,
                    total_pages: 1
                }
            } else {
                console.warn('Unexpected response format:', typeof data, data)
                contracts.value = []
                pagination.value = {
                    total: 0,
                    page: 1,
                    page_size: 10,
                    total_pages: 0
                }
            }
        } catch (err: any) {
            error.value = err.response?.data?.detail || 'Failed to fetch contracts'
            contracts.value = []
            pagination.value = {
                total: 0,
                page: 1,
                page_size: 10,
                total_pages: 0
            }
            console.error('Failed to fetch contracts:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchContract = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            const response = await get<Contract>(`/api/v1/contracts/${id}`)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have access to this contract'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch contract'
            }
            console.error('Failed to fetch contract:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createContract = async (data: ContractCreate): Promise<ContractWithWarnings> => {
        loading.value = true
        error.value = null
        try {
            const response = await post<ContractWithWarnings>('/api/v1/contracts', data)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 403) {
                error.value = 'You don\'t have permission to create contracts'
            } else if (statusCode === 400) {
                error.value = err.response?.data?.detail || 'Invalid contract data'
            } else {
                error.value = err.response?.data?.detail || 'Failed to create contract'
            }
            console.error('Failed to create contract:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateContract = async (id: string, data: ContractUpdate): Promise<ContractWithWarnings> => {
        loading.value = true
        error.value = null
        try {
            const response = await put<ContractWithWarnings>(`/api/v1/contracts/${id}`, data)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to update this contract'
            } else {
                error.value = err.response?.data?.detail || 'Failed to update contract'
            }
            console.error('Failed to update contract:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteContract = async (id: string) => {
        loading.value = true
        error.value = null
        try {
            await deleteRequest(`/api/v1/contracts/${id}`)
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to delete this contract'
            } else {
                error.value = err.response?.data?.detail || 'Failed to delete contract'
            }
            console.error('Failed to delete contract:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const refresh = async (filters?: ContractFilters) => {
        await fetchContracts(filters)
    }

    const fetchContractHistory = async (contractId: string): Promise<Contract[]> => {
        loading.value = true
        error.value = null
        try {
            const response = await get<Contract[]>(`/api/v1/contracts/${contractId}/history`)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have access to this contract history'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch contract history'
            }
            console.error('Failed to fetch contract history:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Helper functions for display
    const getContractTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'platform_to_org': 'Platform → Organization',
            'org_to_mcn': 'Organization → MCN',
            'mcn_to_channel': 'MCN → Channel',
        }
        return labels[type] || type
    }

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            'active': 'Active',
            'expired': 'Expired',
            'future': 'Future',
        }
        return labels[status] || status
    }

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            'future': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        }
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }

    const fetchRevenuePreview = async (contractId: string, grossAmount: number = 1000): Promise<RevenueSplit> => {
        loading.value = true
        error.value = null
        try {
            const response = await get<RevenueSplit>(`/api/v1/contracts/${contractId}/preview-revenue`, {
                params: { gross_amount: grossAmount }
            })
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have access to this contract'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch revenue preview'
            }
            console.error('Failed to fetch revenue preview:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchChannelRevenueSplit = async (channelId: string, grossAmount: number = 1000): Promise<RevenueSplit> => {
        loading.value = true
        error.value = null
        try {
            const response = await get<RevenueSplit>(`/api/v1/contracts/channel/${channelId}/revenue-split`, {
                params: { gross_amount: grossAmount }
            })
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Channel not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have access to this channel'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch channel revenue split'
            }
            console.error('Failed to fetch channel revenue split:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getPartyTypeLabel = (partyType: string): string => {
        const labels: Record<string, string> = {
            'channel': 'Channel',
            'mcn': 'MCN',
            'organization': 'Organization',
            'platform': 'Platform',
        }
        return labels[partyType] || partyType
    }

    const getPartyTypeColor = (partyType: string): string => {
        const colors: Record<string, string> = {
            'channel': 'bg-blue-500',
            'mcn': 'bg-purple-500',
            'organization': 'bg-green-500',
            'platform': 'bg-orange-500',
        }
        return colors[partyType] || 'bg-gray-500'
    }

    return {
        contracts,
        loading,
        error,
        pagination,
        fetchContracts,
        fetchContract,
        fetchContractHistory,
        fetchRevenuePreview,
        fetchChannelRevenueSplit,
        createContract,
        updateContract,
        deleteContract,
        refresh,
        getContractTypeLabel,
        getStatusLabel,
        getStatusColor,
        getPartyTypeLabel,
        getPartyTypeColor,
    }
}
