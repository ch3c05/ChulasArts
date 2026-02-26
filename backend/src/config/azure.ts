import { BlobServiceClient } from '@azure/storage-blob';

const getConnectionString = () => process.env.AZURE_STORAGE_CONNECTION_STRING;
const getContainerName = () => process.env.AZURE_STORAGE_CONTAINER || 'photos';
const AZURE_AVATARS_CONTAINER = 'avatars'; // Public container for user avatars

let blobServiceClient: BlobServiceClient | null = null;

export const getBlobServiceClient = (): BlobServiceClient => {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error('Azure Storage connection string is not configured');
  }

  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  return blobServiceClient;
};

export const getContainerClient = () => {
  const serviceClient = getBlobServiceClient();
  return serviceClient.getContainerClient(getContainerName());
};

export const getAvatarsContainerClient = () => {
  const serviceClient = getBlobServiceClient();
  return serviceClient.getContainerClient(AZURE_AVATARS_CONTAINER);
};

export const initializeAzureStorage = async (): Promise<void> => {
  try {
    const connectionString = getConnectionString();
    if (!connectionString) {
      console.warn('⚠️  Skipping Azure Storage initialization - no connection string provided');
      return;
    }

    // Initialize photos container (private)
    const containerClient = getContainerClient();
    const exists = await containerClient.exists();

    if (!exists) {
      await containerClient.create();
      console.log(`✅ Azure Blob Storage container "${getContainerName()}" created`);
    } else {
      console.log(`✅ Azure Blob Storage container "${getContainerName()}" already exists`);
    }

    // Initialize avatars container (private, like photos)
    const avatarsContainerClient = getAvatarsContainerClient();
    const avatarsExists = await avatarsContainerClient.exists();

    if (!avatarsExists) {
      await avatarsContainerClient.create();
      console.log(`✅ Azure Blob Storage container "${AZURE_AVATARS_CONTAINER}" created`);
    } else {
      console.log(`✅ Azure Blob Storage container "${AZURE_AVATARS_CONTAINER}" already exists`);
    }
  } catch (error) {
    console.error('❌ Azure Storage initialization error:', error);
    throw error;
  }
};

export const uploadBlobFromBuffer = async (
  blobName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  return blockBlobClient.url;
};

export const uploadAvatarFromBuffer = async (
  blobName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> => {
  const containerClient = getAvatarsContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  return blockBlobClient.url;
};

export const deleteBlo = async (blobName: string): Promise<void> => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

export const generateSasUrl = (blobName: string, _expiresInMinutes: number = 60): string => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // For simplicity, return the URL without SAS token in development
  // In production, implement proper SAS token generation
  return blockBlobClient.url;
};
