import { account, databases } from '../appwrite.js';
import { ID, Query, Permission, Role } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROFILES_COLLECTION_ID = import.meta.env.VITE_PROFILES_COLLECTION_ID || 'profiles';
const REVIEWS_COLLECTION_ID = import.meta.env.VITE_REVIEWS_COLLECTION_ID || 'reviews';
const LISTS_COLLECTION_ID = import.meta.env.VITE_LISTS_COLLECTION_ID || 'lists';
const LIKES_COLLECTION_ID = import.meta.env.VITE_LIKES_COLLECTION_ID || 'likes';

// Validate that required env vars are present
if (!DATABASE_ID) {
  console.error('Missing VITE_APPWRITE_DATABASE_ID in .env file');
  throw new Error('Database configuration missing. Please set VITE_APPWRITE_DATABASE_ID in your .env file.');
}

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
        top_albums: '[]',
        top_songs: '[]',
        theme_color: '#1a1a1a',
        profile_picture: '' // Empty string is fine for String type
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
        top_albums: JSON.stringify(albums)
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
    if (!profile.top_albums) return [];
    
    try {
      return JSON.parse(profile.top_albums);
    } catch (e) {
      console.error('Error parsing top_albums:', e);
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
        top_songs: JSON.stringify(songs)
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
    if (!profile.top_songs) return [];
    
    try {
      return JSON.parse(profile.top_songs);
    } catch (e) {
      console.error('Error parsing top_songs:', e);
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

    // Create review without document-level delete permission
    // We rely on collection-level permissions for delete operations
    // This prevents permission conflicts that can occur with document-level permissions
    const review = await databases.createDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        album_name: albumName,
        artist_name: artistName,
        review_text: reviewText,
        rating: rating.toString(), // Convert to string since field is string type
        likes_count: 0
      },
      [
        // Set document-level permissions - but NOT delete permission
        // Delete will be handled by collection-level permissions
        Permission.read(Role.any()), // Anyone can read reviews
        Permission.update(Role.user(userId)) // Only creator can update
        // Note: We intentionally don't set Permission.delete here
        // Collection-level permissions should handle delete operations
      ]
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
 * Get all reviews (for displaying with like functionality)
 */
export async function getAllReviews() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [Query.orderDesc('$createdAt')] // Order by newest first
    );

    return response.documents;
  } catch (error) {
    console.error('Error getting all reviews:', error);
    return [];
  }
}

/**
 * Update a review
 */
export async function updateReview(reviewId, data) {
  try {
    // Convert camelCase to snake_case for database
    const updateData = {};
    if (data.albumName !== undefined) updateData.album_name = data.albumName;
    if (data.artistName !== undefined) updateData.artist_name = data.artistName;
    if (data.reviewText !== undefined) updateData.review_text = data.reviewText;
    if (data.rating !== undefined) updateData.rating = data.rating.toString();
    
    const updated = await databases.updateDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId,
      updateData
    );

    return updated;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

// ========== LIKE OPERATIONS ==========

/**
 * Check if current user has liked a review
 */
export async function hasUserLikedReview(reviewId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const response = await databases.listDocuments(
      DATABASE_ID,
      LIKES_COLLECTION_ID,
      [
        Query.equal('review_id', reviewId),
        Query.equal('user_id', userId)
      ],
      1
    );

    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking if user liked review:', error);
    return false;
  }
}

/**
 * Get like count for a review
 */
export async function getReviewLikeCount(reviewId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      LIKES_COLLECTION_ID,
      [Query.equal('review_id', reviewId)]
    );

    return response.documents.length;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
}

/**
 * Like a review
 */
export async function likeReview(reviewId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    // Check if user has already liked this review
    const alreadyLiked = await hasUserLikedReview(reviewId);
    if (alreadyLiked) {
      throw new Error('You have already liked this review');
    }

    // Create like record
    const like = await databases.createDocument(
      DATABASE_ID,
      LIKES_COLLECTION_ID,
      ID.unique(),
      {
        review_id: reviewId,
        user_id: userId
      },
      [
        Permission.read(Role.any()),
        Permission.delete(Role.user(userId)) // User can remove their own like
      ]
    );

    // Update the review's likes_count (count will be updated after like is created)
    const newCount = await getReviewLikeCount(reviewId);
    await databases.updateDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId,
      {
        likes_count: newCount
      }
    );

    return like;
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
}

/**
 * Unlike a review
 */
export async function unlikeReview(reviewId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    // Find the like record
    const response = await databases.listDocuments(
      DATABASE_ID,
      LIKES_COLLECTION_ID,
      [
        Query.equal('review_id', reviewId),
        Query.equal('user_id', userId)
      ],
      1
    );

    if (response.documents.length === 0) {
      throw new Error('You have not liked this review');
    }

    // Delete the like record
    await databases.deleteDocument(
      DATABASE_ID,
      LIKES_COLLECTION_ID,
      response.documents[0].$id
    );

    // Update the review's likes_count (count will be updated after like is deleted)
    const newCount = await getReviewLikeCount(reviewId);
    await databases.updateDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId,
      {
        likes_count: newCount
      }
    );

    return true;
  } catch (error) {
    console.error('Error unliking review:', error);
    throw error;
  }
}

/**
 * Delete a review
 * 
 * Note: This function handles the delete operation with proper session verification.
 * If you're getting permission errors, it might be due to document-level permissions
 * set during review creation conflicting with collection-level permissions.
 */
export async function deleteReview(reviewId) {
  try {
    // First, verify the user is authenticated and get their ID
    let userId;
    try {
      const user = await account.get();
      userId = user.$id;
      console.log('Current authenticated user:', userId);
    } catch (authError) {
      console.error('Authentication check failed:', authError);
      throw new Error('You must be logged in to delete reviews. Please log in and try again.');
    }

    if (!userId) {
      throw new Error('User not logged in');
    }

    console.log('Attempting to delete review:', { reviewId, userId });

    // Verify the review exists and check ownership
    let review;
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal('$id', reviewId)
        ],
        1
      );

      if (response.documents.length === 0) {
        throw new Error('Review not found');
      }

      review = response.documents[0];
      console.log('Review found:', {
        reviewId: review.$id,
        reviewUserId: review.user_id,
        currentUserId: userId,
        match: review.user_id === userId
      });

      // Check if the review belongs to the current user
      if (review.user_id !== userId) {
        throw new Error('You can only delete your own reviews');
      }
    } catch (queryError) {
      console.error('Error querying review:', queryError);
      throw queryError;
    }

    console.log('Review ownership verified. Proceeding with delete...');

    // Double-check session is still valid right before delete
    try {
      const sessionCheck = await account.get();
      console.log('Session verified before delete:', sessionCheck.$id);
      if (sessionCheck.$id !== userId) {
        throw new Error('Session mismatch detected. Please log out and log back in.');
      }
    } catch (sessionError) {
      console.error('Session check failed:', sessionError);
      throw new Error('Your session has expired. Please log out and log back in, then try again.');
    }

    // Attempt to delete the document
    // Collection-level permissions should allow this if properly configured
    // For existing reviews with document-level permissions, this might still fail
    // but new reviews (created without document-level delete permission) should work
    await databases.deleteDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId
    );
    
    console.log('Review deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting review - Full error:', error);
    console.error('Error code:', error.code);
    console.error('Error type:', error.type);
    console.error('Error message:', error.message);
    
    // Provide user-friendly error messages
    const errorMsg = error.message || error.toString();
    const errorCode = error.code;
    
    // Check for specific Appwrite error codes
    if (errorCode === 401) {
      throw new Error('Authentication failed. Please log out and log back in, then try again.');
    }
    
    if (errorCode === 403) {
      throw new Error('Permission denied. You may not have permission to delete this review. If this is your review, try logging out and logging back in.');
    }
    
    if (errorMsg.includes('not authorized') || 
        errorMsg.includes('permission') ||
        errorMsg.includes('unauthorized') ||
        errorMsg.includes('access denied') ||
        errorMsg.includes('The current user is not authorized')) {
      throw new Error('Permission denied. Please ensure you are logged in as the correct user and try again. If the problem persists, the review may have been created with restrictive permissions.');
    }
    
    if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
      throw new Error('Review not found');
    }
    
    throw error;
  }
}

// ========== PROFILE PICTURE OPERATIONS ==========

/**
 * Update user's profile picture
 */
export async function updateProfilePicture(base64Data) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const profile = await getOrCreateProfile(userId);

    const updated = await databases.updateDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      profile.$id,
      {
        profile_picture: base64Data || ''
      }
    );

    return updated;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
}

/**
 * Get user's profile picture
 */
export async function getProfilePicture() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return '';

    const profile = await getOrCreateProfile(userId);
    return profile.profile_picture || '';
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return '';
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