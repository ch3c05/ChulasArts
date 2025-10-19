import { BlobServiceClient } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'photos';

if (!AZURE_STORAGE_CONNECTION_STRING) {
  console.warn('⚠️  AZURE_STORAGE_CONNECTION_STRING not set. Azure Blob Storage will not be available.');
}

let blobServiceClient: BlobServiceClient | null = null;

export const getBlobServiceClient = (): BlobServiceClient => {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage connection string is not configured');
  }

  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  }

  return blobServiceClient;
};

export const getContainerClient = () => {
  const serviceClient = getBlobServiceClient();
  return serviceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
};

export const initializeAzureStorage = async (): Promise<void> => {
  try {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      console.warn('⚠️  Skipping Azure Storage initialization - no connection string provided');
      return;
    }

    const containerClient = getContainerClient();
    const exists = await containerClient.exists();

    if (!exists) {
      await containerClient.create();
      console.log(`✅ Azure Blob Storage container "${AZURE_STORAGE_CONTAINER}" created`);
    } else {
      console.log(`✅ Azure Blob Storage container "${AZURE_STORAGE_CONTAINER}" already exists`);
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

export const deleteBlo = async (blobName: string): Promise<void> => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

export const generateSasUrl = (blobName: string, expiresInMinutes: number = 60): string => {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  // For simplicity, return the URL without SAS token in development
  // In production, implement proper SAS token generation
  return blockBlobClient.url;
};
