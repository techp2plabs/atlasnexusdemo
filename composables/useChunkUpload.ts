import type {
    ChunkUploadInitiate,
    ChunkUploadInitiateResponse,
    ChunkUploadResponse,
    ContractFile,
} from '~/types/contract'

const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB
const MIN_SIZE_FOR_CHUNKING = 2 * 1024 * 1024 // 2MB

export function useChunkUpload() {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    const loading = ref(false)
    const error = ref<string | null>(null)
    const progress = ref(0) // 0 to 100

    const getHeaders = () => {
        const token = authStore.token
        return {
            Authorization: `Bearer ${token}`,
        }
    }

    const getBaseUrl = () => {
        const base = config.public.apiBase as string | undefined
        if (!base) {
            return ''
        }
        // Only trust fully-qualified URLs; ignore relative paths like "/app/..." or "app/..."
        if (base.startsWith('http://') || base.startsWith('https://')) {
            return base.replace(/\/+$/, '')
        }
        return ''
    }

    /**
     * Upload a file for a contract.
     * Automatically uses chunked upload for files > 2MB.
     */
    const uploadFile = async (
        contractId: string,
        file: File,
        description?: string
    ): Promise<ContractFile | null> => {
        loading.value = true
        error.value = null
        progress.value = 0

        try {
            if (file.size > MIN_SIZE_FOR_CHUNKING) {
                return await uploadWithChunks(contractId, file, description)
            } else {
                return await uploadDirect(contractId, file, description)
            }
        } catch (err: any) {
            error.value = err.message || 'Upload failed'
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * Direct upload for small files (< 2MB)
     */
    const uploadDirect = async (
        contractId: string,
        file: File,
        description?: string
    ): Promise<ContractFile> => {
        const formData = new FormData()
        formData.append('file', file)
        if (description) {
            formData.append('description', description)
        }

        const response = await $fetch<ContractFile>(
            `${getBaseUrl()}/api/v1/contracts/${contractId}/files`,
            {
                method: 'POST',
                headers: getHeaders(),
                body: formData,
            }
        )

        progress.value = 100
        return response
    }

    /**
     * Chunked upload for large files (> 2MB)
     */
    const uploadWithChunks = async (
        contractId: string,
        file: File,
        description?: string
    ): Promise<ContractFile> => {
        // Step 1: Initiate
        const initiateData: ChunkUploadInitiate = {
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type || 'application/pdf',
        }

        const initResponse = await $fetch<ChunkUploadInitiateResponse>(
            `${getBaseUrl()}/api/v1/contracts/${contractId}/files/chunk/initiate`,
            {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json',
                },
                body: initiateData,
            }
        )

        const { upload_id, total_chunks } = initResponse

        // Step 2: Upload chunks
        for (let i = 0; i < total_chunks; i++) {
            const start = i * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, file.size)
            const chunkBlob = file.slice(start, end)

            const formData = new FormData()
            formData.append('upload_id', upload_id)
            formData.append('chunk_number', i.toString())
            formData.append('chunk', chunkBlob, `chunk_${i}`)

            await $fetch<ChunkUploadResponse>(
                `${getBaseUrl()}/api/v1/contracts/${contractId}/files/chunk/upload`,
                {
                    method: 'POST',
                    headers: getHeaders(),
                    body: formData,
                }
            )

            // Update progress (leave last 10% for completion step)
            progress.value = Math.round(((i + 1) / total_chunks) * 90)
        }

        // Step 3: Complete
        const completeResponse = await $fetch<ContractFile>(
            `${getBaseUrl()}/api/v1/contracts/${contractId}/files/chunk/complete`,
            {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json',
                },
                body: {
                    upload_id,
                    description,
                },
            }
        )

        progress.value = 100
        return completeResponse
    }

    return {
        uploadFile,
        loading,
        error,
        progress,
    }
}
