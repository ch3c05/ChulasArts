import mongoose from 'mongoose';

export const createIndexes = async (): Promise<void> => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }

  console.log('📊 Creating MongoDB indexes...');

  try {
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Album indexes
    await db.collection('albums').createIndex({ userId: 1, date: -1 });
    await db.collection('albums').createIndex({ userId: 1, sortOrder: 1 });
    await db.collection('albums').createIndex({ _id: 1, userId: 1 });

    // Photo indexes
    await db.collection('photos').createIndex({ albumId: 1, createdAt: -1 });
    await db.collection('photos').createIndex({ userId: 1, published: 1, createdAt: -1 });
    await db.collection('photos').createIndex({ published: 1, createdAt: -1 });
    await db.collection('photos').createIndex({ published: 1, likeCount: -1 });
    await db.collection('photos').createIndex({ tags: 1 });

    // Like indexes
    await db.collection('likes').createIndex({ userId: 1, photoId: 1 }, { unique: true });
    await db.collection('likes').createIndex({ photoId: 1, createdAt: -1 });

    // Bookmark indexes
    await db.collection('bookmarks').createIndex({ userId: 1, photoId: 1 }, { unique: true });
    await db.collection('bookmarks').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('bookmarks').createIndex({ photoId: 1 });

    console.log('✅ MongoDB indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};
