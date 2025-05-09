// CompressionService.ts
import imageCompression from 'browser-image-compression';

interface CompressionResult {
  success: boolean;
  error?: string;
  data?: ArrayBuffer;
  original_size?: number;
  compressed_size?: number;
  compression_ratio?: number;
}

/**
 * Compresses an image in the browser using browser-image-compression
 * @param imageData ArrayBuffer containing the raw image data
 * @param fileName Name of the file
 * @param maxSizeKB Maximum size in KB (default: 100KB)
 * @returns Promise resolving to compression result
 */
export const compressImageData = async (
  imageData: ArrayBuffer,
  fileName: string,
  maxSizeKB: number = 100
): Promise<CompressionResult> => {
  try {
    console.log(`Compressing image: ${fileName} (${(imageData.byteLength / 1024).toFixed(2)} KB)`);

    // Convert ArrayBuffer to Blob
    const blob = new Blob([imageData], { type: 'image/jpeg' });
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    // Compression options
    const options = {
      maxSizeMB: maxSizeKB / 1024,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);
    const compressedArrayBuffer = await compressedFile.arrayBuffer();

    return {
      success: true,
      data: compressedArrayBuffer,
      original_size: imageData.byteLength,
      compressed_size: compressedArrayBuffer.byteLength,
      compression_ratio: (imageData.byteLength - compressedArrayBuffer.byteLength) / imageData.byteLength
    };
  } catch (error) {
    console.error('Error in compressImageData:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during compression'
    };
  }
};

// Add a simple function to check if an image needs compression
export const shouldCompressImage = (sizeInBytes: number, maxSizeKB: number = 100): boolean => {
  return sizeInBytes > maxSizeKB * 1024;
};