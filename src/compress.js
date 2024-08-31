import sharp from 'sharp';
import { redirect } from './redirect.js';

export async function compressImg(request, reply, inputStream) {
    const { webp, grayscale, quality, originSize } = request.params;
    const imgFormat = webp ? 'webp' : 'jpeg';

    try {
        // Create a sharp transform stream for processing
        const sharpTransform = sharp()
            .grayscale(grayscale)
            .toFormat(imgFormat, {
                quality,
                progressive: true,
                optimizeScans: webp,
                chromaSubsampling: webp ? '4:4:4' : '4:2:0',
            });

        // Pipe the input stream to sharp for processing and then to the reply stream
        inputStream
            .pipe(sharpTransform)
            .on('info', (info) => {
                reply
                    .header('content-type', `image/${imgFormat}`)
                    .header('content-length', info.size)
                    .header('x-original-size', originSize)
                    .header('x-bytes-saved', originSize - info.size);
            })
            .pipe(reply.raw);
    } catch (error) {
        return redirect(request, reply);
    }
}
