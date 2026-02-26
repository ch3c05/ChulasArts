/**
 * Azure Blob Storage Service
 * Handles image uploads and deletions to Azure Blob Storage
 */

import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import { InternalServerError } from '../utils/errors';

// Azure configuration from environment variables
// Note: Reading directly from process.env to avoid module load-time issues
const getConnectionString = () => process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const getContainerName = () => process.env.AZURE_STORAGE_CONTAINER || 'photos';

let blobServiceClient: BlobServiceClient | null = null;

/**
 * Initialize Azure Blob Service Client
 */
function getAzureBlobClient(): BlobServiceClient {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  // Get connection string at runtime
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new InternalServerError(
      'Azure Storage credentials not configured. Please set AZURE_STORAGE_CONNECTION_STRING in .env'
    );
  }

  try {
    // Use connection string (simpler than manual credential creation)
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

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
    const containerClient = blobClient.getContainerClient(getContainerName());

    // Ensure container exists (create if not) - private container
    await containerClient.createIfNotExists({
      // No access property = private container
    });

    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // Upload the buffer
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, max-age=31536000', // Cache for 1 year
      },
    });

    // Since container is private, return the base URL (we'll generate signed URLs when serving)
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
    const containerClient = blobClient.getContainerClient(getContainerName());

    // Extract blob name from URL
    const urlParts = imageUrl.split('/');
    const blobName = urlParts.slice(urlParts.indexOf(getContainerName()) + 1).join('/');

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
 * Generate a SAS token for direct client uploads
 * @param filename - Unique filename with path
 * @param expiresIn - Token expiration time in seconds (default: 1 hour)
 * @returns SAS URL for direct upload
 */
export async function generateSasToken(
  filename: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const blobClient = getAzureBlobClient();
    const containerClient = blobClient.getContainerClient(getContainerName());
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const expiresOn = new Date(Date.now() + expiresIn * 1000);

    // Generate SAS URL with write permissions
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('w'), // Write permission
      expiresOn,
    });

    return sasUrl;
  } catch (error) {
    console.error('SAS token generation error:', error);
    throw new InternalServerError('Failed to generate upload token');
  }
}

/**
 * Generate a signed URL for reading/viewing an image
 * @param imageUrl - Full blob URL
 * @param expiresIn - Token expiration time in seconds (default: 24 hours)
 * @returns Signed URL for reading the image
 */
export async function generateSignedImageUrl(
  imageUrl: string,
  expiresIn: number = 86400 // 24 hours
): Promise<string> {
  try {
    const blobClient = getAzureBlobClient();
    const containerClient = blobClient.getContainerClient(getContainerName());

    // Extract blob name from URL
    const urlParts = imageUrl.split('/');
    const blobName = urlParts.slice(urlParts.indexOf(getContainerName()) + 1).join('/');

    if (!blobName) {
      throw new InternalServerError('Invalid image URL format');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const expiresOn = new Date(Date.now() + expiresIn * 1000);

    // Generate SAS URL with read permissions
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'), // Read permission
      expiresOn,
    });

    return sasUrl;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    throw new InternalServerError('Failed to generate image access URL');
  }
}

/**
 * Upload avatar to Azure Blob Storage (avatars container)
 * @param filename - Unique filename (e.g., "userId-timestamp.jpg")
 * @param buffer - Image buffer
 * @param contentType - MIME type (default: image/jpeg)
 * @returns Object with blob URL and signed URL for immediate access
 */
export async function uploadAvatarToAzure(
  filename: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<{ blobUrl: string; signedUrl: string }> {
  try {
    const blobClient = getAzureBlobClient();
    const avatarsContainerName = 'avatars';
    const containerClient = blobClient.getContainerClient(avatarsContainerName);

    // Ensure avatars container exists (private)
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // Upload the buffer
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, max-age=2592000', // Cache for 30 days
      },
    });

    const blobUrl = blockBlobClient.url;

    // Generate signed URL for immediate access (expires in 7 days)
    const expiresOn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const signedUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      expiresOn,
    });

    return { blobUrl, signedUrl };
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw new InternalServerError('Failed to upload avatar to storage');
  }
}

/**
 * Generate signed URL for avatar access
 * @param avatarUrl - Full URL of the avatar blob
 * @param expiresIn - URL expiration time in seconds (default: 7 days)
 * @returns Signed URL with temporary read access
 */
export async function generateAvatarSignedUrl(
  avatarUrl: string,
  expiresIn: number = 7 * 24 * 60 * 60 // 7 days
): Promise<string> {
  try {
    const blobClient = getAzureBlobClient();
    const avatarsContainerName = 'avatars';
    const containerClient = blobClient.getContainerClient(avatarsContainerName);

    // Extract blob name from URL
    const urlParts = avatarUrl.split('/');
    const blobName = urlParts.slice(urlParts.indexOf(avatarsContainerName) + 1).join('/');

    if (!blobName) {
      throw new InternalServerError('Invalid avatar URL format');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const expiresOn = new Date(Date.now() + expiresIn * 1000);

    // Generate SAS URL with read permissions
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      expiresOn,
    });

    return sasUrl;
  } catch (error) {
    console.error('Avatar signed URL generation error:', error);
    throw new InternalServerError('Failed to generate avatar access URL');
  }
}
