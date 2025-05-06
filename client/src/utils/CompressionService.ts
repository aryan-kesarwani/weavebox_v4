// CompressionService.ts
import { loadPyodide } from 'pyodide';

interface CompressionResult {
  success: boolean;
  error?: string;
  data?: ArrayBuffer;
  original_size?: number;
  compressed_size?: number;
  compression_ratio?: number;
}

// This variable will hold our Pyodide instance once loaded
let pyodideInstance: any = null;

/**
 * Initialize Pyodide and load required packages
 */
export const initializePyodide = async (): Promise<void> => {
  if (!pyodideInstance) {
    console.log('Loading Pyodide...');
    try {
      // Load Pyodide from CDN
      pyodideInstance = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/"
      });
      
      // Install required packages for image manipulation
      console.log('Installing Python packages...');
      await pyodideInstance.loadPackage(['numpy', 'pillow']);
      
      console.log('Pyodide initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      throw new Error('Failed to initialize image compression service');
    }
  }
};

/**
 * Compresses an image in the browser using Python's PIL library via Pyodide
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
    // Make sure Pyodide is initialized
    if (!pyodideInstance) {
      await initializePyodide();
    }
    
    if (!pyodideInstance) {
      throw new Error('Pyodide failed to initialize');
    }
    
    console.log(`Compressing image: ${fileName} (${(imageData.byteLength / 1024).toFixed(2)} KB)`);
    
    // Convert ArrayBuffer to Uint8Array
    const uint8Array = new Uint8Array(imageData);
    
    // Create a Python bytes object from the JavaScript Uint8Array
    const imageBytes = pyodideInstance.toPy(uint8Array);
    
    // Define the Python function for compression
    const pythonCode = `
import io
from PIL import Image, UnidentifiedImageError

def compress_image(image_bytes, max_size_kb=100):
    """
    Compress an image to be under a specified size while maintaining quality.
    
    Args:
        image_bytes (bytes): Raw image data
        max_size_kb (int): Maximum size in KB (default: 100KB)
    
    Returns:
        dict: Result containing success status and compression details
    """
    result = {
        "success": False,
        "error": None,
        "original_size": len(image_bytes),
        "compressed_size": 0,
        "compression_ratio": 0,
        "data": None
    }
    
    try:
        # Open the image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (including palette mode)
        if img.mode in ('RGBA', 'LA', 'P') or (img.mode == 'P' and 'transparency' in img.info):
            # Convert to RGBA first if the image has transparency
            if img.mode == 'P' and 'transparency' in img.info:
                img = img.convert('RGBA')
            # Then convert to RGB
            img = img.convert('RGB')
        
        quality = 85  # Start with high quality
        step = 5      # Decrease quality in steps if needed
        
        # First try quality reduction
        while quality > 10:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            size_kb = buffer.tell() / 1024
            
            if size_kb <= max_size_kb:
                buffer.seek(0)
                result["compressed_size"] = buffer.tell()
                result["compression_ratio"] = (result["original_size"] - result["compressed_size"]) / result["original_size"]
                result["success"] = True
                result["data"] = buffer.getvalue()
                return result
            
            quality -= step
        
        # If quality reduction isn't enough, try resizing
        while True:
            new_width = max(1, img.width // 2)
            new_height = max(1, img.height // 2)
            img = img.resize((new_width, new_height))
            
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=70, optimize=True)
            size_kb = buffer.tell() / 1024
            
            if size_kb <= max_size_kb or img.width < 10 or img.height < 10:
                buffer.seek(0)
                result["compressed_size"] = buffer.tell()
                result["compression_ratio"] = (result["original_size"] - result["compressed_size"]) / result["original_size"]
                result["success"] = True
                result["data"] = buffer.getvalue()
                return result
                
    except UnidentifiedImageError:
        result["error"] = "Error: This is not a valid image file."
    except Exception as e:
        result["error"] = f"Error processing image: {str(e)}"
    
    return result
    `;
    
    // Run the Python code
    pyodideInstance.runPython(pythonCode);
    
    // Get the Python function
    const compressFunction = pyodideInstance.globals.get('compress_image');
    
    // Call the Python function with our image data
    const result = compressFunction(imageBytes, maxSizeKB).toJs();
    
    // If successful, convert the Python bytes to JavaScript ArrayBuffer
    if (result.success && result.data) {
      const compressedData = new Uint8Array(result.data);
      result.data = compressedData.buffer;
    }
    
    console.log('Compression result:', {
      success: result.success,
      originalSize: result.original_size,
      compressedSize: result.compressed_size,
      ratio: result.compression_ratio,
      error: result.error
    });
    
    return result as CompressionResult;
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