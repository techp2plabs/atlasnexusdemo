import { useApi } from '~/composables/useApi'
import type { ContractFile, ContractHistory, ContractHistoryCreate } from '~/types/contract'

export function useContractFiles() {
    const api = useApi()
    const { get, post } = api
    const loading = ref(false)
    const error = ref<string | null>(null)

    const uploadContractFile = async (
        contractId: string,
        file: File,
        description?: string
    ): Promise<ContractFile> => {
        loading.value = true
        error.value = null
        try {
            const formData = new FormData()
            formData.append('file', file)
            if (description) {
                formData.append('description', description)
            }

            const response = await api.post<ContractFile>(
                `/api/v1/contracts/${contractId}/files`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to upload files for this contract'
            } else if (statusCode === 400) {
                error.value = err.response?.data?.detail || 'Invalid file'
            } else {
                error.value = err.response?.data?.detail || 'Failed to upload file'
            }
            console.error('Failed to upload contract file:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getContractFiles = async (contractId: string): Promise<ContractFile[]> => {
        loading.value = true
        error.value = null
        try {
            const response = await get<ContractFile[]>(`/api/v1/contracts/${contractId}/files`)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to view files for this contract'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch contract files'
            }
            console.error('Failed to fetch contract files:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getCurrentContractFile = async (contractId: string): Promise<ContractFile | null> => {
        const files = await getContractFiles(contractId)
        // Return the file with the highest version (latest)
        if (files.length === 0) return null
        return files.sort((a, b) => b.version - a.version)[0]
    }

    const getContractFile = async (contractId: string, fileId: string): Promise<ContractFile> => {
        loading.value = true
        error.value = null
        try {
            const response = await get<ContractFile>(`/api/v1/contracts/${contractId}/files/${fileId}`)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'File not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to view this file'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch contract file'
            }
            console.error('Failed to fetch contract file:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const downloadContractFile = async (contractId: string, fileId: string, fileUrl?: string) => {
        // If we have the file URL, try to download directly first
        if (fileUrl) {
            try {
                // Create a temporary anchor element to trigger download
                const link = document.createElement('a')
                link.href = fileUrl
                link.download = '' // Let browser determine filename
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                return
            } catch (err) {
                console.warn('Direct download failed, trying backend endpoint:', err)
            }
        }
        
        // Fallback: use backend download endpoint
        try {
            window.location.href = `/api/v1/contracts/${contractId}/files/${fileId}/download`
        } catch (err) {
            console.error('Download failed:', err)
            throw err
        }
    }

    const viewContractFile = (fileUrl: string) => {
        // Open PDF in new tab
        window.open(fileUrl, '_blank')
    }

    const getContractHistory = async (contractId: string): Promise<ContractHistory[]> => {
        loading.value = true
        error.value = null
        try {
            const response = await get<ContractHistory[]>(`/api/v1/contracts/${contractId}/history-entries`)
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to view history for this contract'
            } else {
                error.value = err.response?.data?.detail || 'Failed to fetch contract history'
            }
            console.error('Failed to fetch contract history:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createContractHistoryEntry = async (
        contractId: string,
        data: ContractHistoryCreate
    ): Promise<ContractHistory> => {
        loading.value = true
        error.value = null
        try {
            const response = await post<ContractHistory>(
                `/api/v1/contracts/${contractId}/history`,
                data
            )
            return response.data
        } catch (err: any) {
            const statusCode = err.response?.status
            if (statusCode === 404) {
                error.value = 'Contract not found'
            } else if (statusCode === 403) {
                error.value = 'You don\'t have permission to create history entries for this contract'
            } else if (statusCode === 400) {
                error.value = err.response?.data?.detail || 'Invalid history entry data'
            } else {
                error.value = err.response?.data?.detail || 'Failed to create history entry'
            }
            console.error('Failed to create contract history entry:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    return {
        loading,
        error,
        uploadContractFile,
        getContractFiles,
        getCurrentContractFile,
        getContractFile,
        downloadContractFile,
        viewContractFile,
        getContractHistory,
        createContractHistoryEntry,
        formatFileSize,
    }
}

