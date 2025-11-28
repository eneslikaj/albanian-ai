
import { User, SubscriptionTier } from '../types';

const STORAGE_PREFIX = 'albanian_ai_user_data_';

export const adminService = {
  // Fetch all users from local storage
  getAllUsers: (): User[] => {
    const users: User[] = [];
    
    // Iterate through all local storage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Check if key represents a user record (excluding the current session key)
      if (key && key.startsWith(STORAGE_PREFIX) && key !== 'albanian_ai_user_data') {
        try {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const userData = JSON.parse(rawData);
            
            if (userData && userData.email) {
              // Ensure legacy data has date fields to prevent UI errors
              // If missing, we default to the current time for display purposes,
              // though ideally this would come from the initial creation.
              if (!userData.createdAt) {
                userData.createdAt = new Date().toISOString();
              }
              if (!userData.lastLoginAt) {
                userData.lastLoginAt = new Date().toISOString();
              }
              
              users.push(userData as User);
            }
          }
        } catch (e) {
          console.warn('Failed to parse user data for key:', key);
        }
      }
    }
    return users;
  },

  // Update a specific user's data
  updateUser: (updatedUser: User): void => {
    // 1. Update the specific user record
    localStorage.setItem(`${STORAGE_PREFIX}${updatedUser.email}`, JSON.stringify(updatedUser));
    
    // 2. If the admin is editing themselves or the currently logged-in user, 
    // we need to update the active session key too so they see changes immediately
    const currentSession = localStorage.getItem('albanian_ai_user_data');
    if (currentSession) {
      const parsedSession = JSON.parse(currentSession);
      if (parsedSession.email === updatedUser.email) {
        localStorage.setItem('albanian_ai_user_data', JSON.stringify(updatedUser));
      }
    }
  }
};
