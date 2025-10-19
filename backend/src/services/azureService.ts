/**
 * Azure Blob Storage Service
 * Handles image uploads and deletions to Azure Blob Storage
 */

import { BlobServiceClient } from '@azure/storage-blob';
import { InternalServerError } from '../utils/errors';

// Azure configuration from environment variables
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'photos';

let blobServiceClient: BlobServiceClient | null = null;

/**
 * Initialize Azure Blob Service Client
 */
function getAzureBlobClient(): BlobServiceClient {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  if (
    !AZURE_STORAGE_CONNECTION_STRING ||
    AZURE_STORAGE_CONNECTION_STRING.includes('your-account')
  ) {
    throw new InternalServerError(
      'Azure Storage credentials not configured. Please set AZURE_STORAGE_CONNECTION_STRING in .env'
    );
  }

  try {
    // Use connection string (simpler than manual credential creation)
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    return blobServiceClient;
  } catch (error) {
    console.error('Azure Blob Client initialization error:', error);
    throw new InternalServerError('Failed to initialize Azure storage');
  }
}

/**
 * Upload image buffer to Azure Blob Storage
 * @param filename - Unique filename with path (e.g., "userId/albumId/timestamp-thumb.webp")
 * @param buffer - Image buffer
 * @param contentType - MIME type (default: image/webp)
 * @returns Public URL of uploaded blob
 */
export async function uploadImageToAzure(
  filename: string,
  buffer: Buffer,
  contentType: string = 'image/webp'
): Promise<string> {
  try {
    const blobClient = getAzureBlobClient();
    const containerClient = blobClient.getContainerClient(AZURE_STORAGE_CONTAINER);

    // Ensure container exists (create if not)
    await containerClient.createIfNotExists({
      access: 'blob', // Public read access for blobs
    });

    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // Upload the buffer
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
    });

    // Return the public URL
    return blockBlobClient.url;
  } catch (error) {
    console.error('Azure upload error:', error);
    throw new InternalServerError('Failed to upload image to storage');
  }
}

/**
 * Delete image from Azure Blob Storage
 * @param imageUrl - Full URL of the blob to delete
 */
export async function deleteImageFromAzure(imageUrl: string): Promise<void> {
  try {
    const blobClient = getAzureBlobClient();
    const containerClient = blobClient.getContainerClient(AZURE_STORAGE_CONTAINER);

    // Extract blob name from URL
    const urlParts = imageUrl.split('/');
    const blobName = urlParts.slice(urlParts.indexOf(AZURE_STORAGE_CONTAINER) + 1).join('/');

    if (!blobName) {
      console.error('Could not extract blob name from URL:', imageUrl);
      return;
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Delete the blob (ignore if not exists)
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error('Azure deletion error:', error);
    // Don't throw - deletion failures shouldn't block the operation
  }
}

/**
 * Generate a SAS token for direct client uploads (future feature)
 */
export async function generateSasToken(
  filename: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const blobClient = getAzureBlobClient();
    const containerClient = blobClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const expiresOn = new Date(Date.now() + expiresIn * 1000);

    // This requires StorageSharedKeyCredential which we have
    // For now, return a placeholder - we'll implement direct uploads later
    return blockBlobClient.url;
  } catch (error) {
    console.error('SAS token generation error:', error);
    throw new InternalServerError('Failed to generate upload token');
  }
}
