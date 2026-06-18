export interface CompressImageOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    type?: string
    background?: string
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas export failed'))
                    return
                }

                resolve(blob)
            },
            type,
            quality,
        )
    })
}

async function loadImageFromBlob(blob: Blob) {
    const url = URL.createObjectURL(blob)

    try {
        const image = new Image()

        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve()
            image.onerror = () => reject(new Error('Image load failed'))
            image.src = url
        })

        return image
    } finally {
        URL.revokeObjectURL(url)
    }
}

export async function compressImageBlob(blob: Blob, options: CompressImageOptions = {}) {
    const {
        maxWidth = 512,
        maxHeight = 512,
        quality = 0.82,
        type = 'image/jpeg',
        background = '#FFFFFF',
    } = options
    const image = await loadImageFromBlob(blob)
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1)
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
        throw new Error('Canvas context unavailable')
    }

    canvas.width = width
    canvas.height = height
    context.fillStyle = background
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    return canvasToBlob(canvas, type, quality)
}
