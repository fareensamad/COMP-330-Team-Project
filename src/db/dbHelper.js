import { account, databases } from '../appwrite.js';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROFILES_COLLECTION_ID = import.meta.env.VITE_PROFILES_COLLECTION_ID;
const REVIEWS_COLLECTION_ID = import.meta.env.VITE_REVIEWS_COLLECTION_ID;
const LISTS_COLLECTION_ID = import.meta.env.VITE_LISTS_COLLECTION_ID;

// ========== USER PROFILE OPERATIONS ==========

/**
 * Get current logged-in user's ID
 */
export async function getCurrentUserId() {
  try {
    const user = await account.get();
    return user.$id;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get or create user profile
 * Returns the profile document or creates a new one if it doesn't exist
 */
export async function getOrCreateProfile(userId) {
  try {
    // Try to fetch existing profile
    const response = await databases.listDocuments(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [Query.equal('user_id', userId)]
    );

    if (response.documents.length > 0) {
      return response.documents[0];
    }

    // Create new profile if it doesn't exist
    const newProfile = await databases.createDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        username: '',
        topAlbums: '[]',
        topSongs: '[]',
        theme_color: '#1a1a1a',
        profile_picture: ''
      }
    );

    return newProfile;
  } catch (error) {
    console.error('Error getting/creating profile:', error);
    throw error;
  }
}

/**
 * Update user's top albums
 */
export async function updateTopAlbums(albums) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const profile = await getOrCreateProfile(userId);

    // Update the profile with new albums (stringify for String field)
    const updated = await databases.updateDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      profile.$id,
      {
        topAlbums: JSON.stringify(albums)
      }
    );

    return updated;
  } catch (error) {
    console.error('Error updating top albums:', error);
    throw error;
  }
}

/**
 * Get user's top albums
 */
export async function getTopAlbums() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const profile = await getOrCreateProfile(userId);
    
    // Parse the JSON string back to array
    if (!profile.topAlbums) return [];
    
    try {
      return JSON.parse(profile.topAlbums);
    } catch (e) {
      console.error('Error parsing topAlbums:', e);
      return [];
    }
  } catch (error) {
    console.error('Error getting top albums:', error);
    return [];
  }
}

/**
 * Update user's top songs
 */
export async function updateTopSongs(songs) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const profile = await getOrCreateProfile(userId);

    const updated = await databases.updateDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      profile.$id,
      {
        topSongs: JSON.stringify(songs)
      }
    );

    return updated;
  } catch (error) {
    console.error('Error updating top songs:', error);
    throw error;
  }
}

/**
 * Get user's top songs
 */
export async function getTopSongs() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const profile = await getOrCreateProfile(userId);
    
    // Parse the JSON string back to array
    if (!profile.topSongs) return [];
    
    try {
      return JSON.parse(profile.topSongs);
    } catch (e) {
      console.error('Error parsing topSongs:', e);
      return [];
    }
  } catch (error) {
    console.error('Error getting top songs:', error);
    return [];
  }
}

// ========== REVIEW OPERATIONS ==========

/**
 * Create a new review
 */
export async function createReview(albumName, artistName, reviewText, rating) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const review = await databases.createDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        albumName,
        artistName,
        reviewText,
        rating,
        likes_count: 0
      }
    );

    return review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Get all reviews for current user
 */
export async function getUserReviews() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const response = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [Query.equal('user_id', userId)]
    );

    return response.documents;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return [];
  }
}

/**
 * Update a review
 */
export async function updateReview(reviewId, data) {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId,
      data
    );

    return updated;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId
    );
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

// ========== LIST OPERATIONS ==========

/**
 * Create a custom list
 */
export async function createList(listName, albums = [], songs = []) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const list = await databases.createDocument(
      DATABASE_ID,
      LISTS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        list_name: listName,
        albums,
        songs
      }
    );

    return list;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
}

/**
 * Get all lists for current user
 */
export async function getUserLists() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const response = await databases.listDocuments(
      DATABASE_ID,
      LISTS_COLLECTION_ID,
      [Query.equal('user_id', userId)]
    );

    return response.documents;
  } catch (error) {
    console.error('Error getting user lists:', error);
    return [];
  }
}