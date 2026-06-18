import api from '@/utils/ky'

export interface UploadResponse {
    path: string
    url: string
}

export async function uploadFile(file: File | Blob, filename = 'upload.jpg') {
    const formData = new FormData()
    const uploadSource = file instanceof File ? file : new File([file], filename, {type: file.type || 'application/octet-stream'})

    formData.append('file', uploadSource)

    return api.post('api/upload', {body: formData}).json<UploadResponse>()
}
