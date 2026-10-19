// Contract Term Change Entry
export interface ContractTermsEntry {
    id: string
    contract_id: string
    revenue_share_pct: number
    effective_date: string
    created_at: string
    created_by: string | null
    creator_name: string | null
    change_notes: string | null
    is_active: boolean
}

export interface Contract {
    id: string
    contract_number: string | null
    organization_id: string | null
    mcn_id: string | null
    channel_id: string | null
    revenue_share_pct: number  // Base contract rate
    current_revenue_share_pct: number  // Currently active rate (may differ if term changes exist)
    start_date: string
    end_date: string | null
    notes: string | null
    created_at: string
    updated_at: string

    // Computed fields
    contract_type: string
    status: string
    entity_name: string | null

    // Related entity info
    organization_name: string | null
    mcn_name: string | null
    channel_title: string | null

    // File info
    files_count?: number
    latest_file_url?: string | null

    // Term changes
    terms: ContractTermsEntry[]
    upcoming_terms: ContractTermsEntry[]

    /** Days until end_date from server (null if open-ended). */
    days_until_end?: number | null
    /** True when end_date is within the next 60 days (inclusive), not expired. */
    is_expiring_soon?: boolean
    /** True when the current user may create a follow-up contract for this entity. */
    can_create_follow_up?: boolean
}

export interface ContractCreate {
    organization_id?: string
    mcn_id?: string
    channel_id?: string
    revenue_share_pct: number
    start_date: string
    end_date?: string | null
    notes?: string | null
}

export interface ContractUpdate {
    revenue_share_pct?: number
    start_date?: string
    end_date?: string | null
    notes?: string | null
    change_notes?: string | null
}

export interface OverlappingContractInfo {
    id: string
    start_date: string
    end_date: string | null
    revenue_share_pct: number
    status: string
}

export interface ContractWithWarnings extends Contract {
    warnings: string[]
    overlapping_contracts: OverlappingContractInfo[]
}

export interface RevenueParty {
    party_type: 'channel' | 'mcn' | 'organization' | 'platform'
    party_id: string | null
    party_name: string | null
    share_percentage: number
    share_amount: number
    contract_id: string | null
}

export interface RevenueSplit {
    gross_amount: number
    parties: RevenueParty[]
    warnings: string[]
}

export type ContractType = 'platform_to_org' | 'org_to_mcn' | 'mcn_to_channel'
export type ContractStatus = 'active' | 'expired' | 'future'

export interface ContractFile {
    id: string
    contract_id: string
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
    uploaded_by: string
    uploaded_at: string
    version: number
    description: string | null
    uploader_name?: string | null
    uploader_email?: string | null
}

export interface ContractHistoryCreate {
    change_type?: string
    field_name?: string | null
    old_value?: string | null
    new_value?: string | null
    change_description: string
}

export interface ContractHistory {
    id: string
    contract_id: string
    changed_by: string
    changed_at: string
    change_type: string
    field_name: string | null
    old_value: string | null
    new_value: string | null
    change_description: string | null
    related_file_id: string | null
    changer_name?: string | null
    changer_email?: string | null
    related_file_name?: string | null
}

// Chunk Upload Types
export interface ChunkUploadInitiate {
    file_name: string
    file_size: number
    mime_type: string
}

export interface ChunkUploadInitiateResponse {
    upload_id: string
    chunk_size: number
    total_chunks: number
}

export interface ChunkUploadResponse {
    upload_id: string
    chunk_number: number
    received: boolean
}
