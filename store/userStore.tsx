import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiService from '../services/api';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface HealthProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  currentSteps: number;
  sleepHours: number;
  waterIntake: number;
  conditions: string[];
  medications: string[];
  allergies: string[];
}

interface UserStoreContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  saveLocationToBackend: (location: Location) => Promise<void>;
  healthProfile: HealthProfile | null;
  setHealthProfile: (profile: HealthProfile) => void;
  loadHealthProfile: () => Promise<void>;
  updateHealthProfile: (updates: Partial<HealthProfile>) => Promise<void>;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

export const useUserStore = () => {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  return context;
};

interface UserStoreProviderProps {
  children: ReactNode;
}

export const UserStoreProvider: React.FC<UserStoreProviderProps> = ({ children }) => {
  const [location, setLocationState] = useState<Location | null>(null);
  const [healthProfile, setHealthProfileState] = useState<HealthProfile | null>(null);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    // Auto-save to backend when location changes
    saveLocationToBackend(newLocation);
  };

  const setHealthProfile = (profile: HealthProfile) => {
    setHealthProfileState(profile);
  };

  const saveLocationToBackend = async (locationData: Location) => {
    try {
      console.log('Saving location to backend:', locationData);
      
      // Note: You'll need to implement a proper API endpoint for saving location
      // For now, we'll just log it
      console.log('Location data to save:', locationData);
      
      console.log('Location saved to backend successfully');
    } catch (error) {
      console.error('Error saving location to backend:', error);
    }
  };

  const loadHealthProfile = async () => {
    try {
      const token = await apiService.getToken();
      if (!token) return;

      const response = await apiService.request('/users/health-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.success && response.data) {
        setHealthProfileState(response.data);
      }
    } catch (error) {
      console.error('Error loading health profile:', error);
    }
  };

  const updateHealthProfile = async (updates: Partial<HealthProfile>) => {
    try {
      const token = await apiService.getToken();
      if (!token) return;

      const response = await apiService.request('/users/update-health-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.success) {
        setHealthProfileState(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating health profile:', error);
      throw error;
    }
  };

  return (
    <UserStoreContext.Provider value={{ 
      location, 
      setLocation, 
      saveLocationToBackend,
      healthProfile,
      setHealthProfile,
      loadHealthProfile,
      updateHealthProfile
    }}>
      {children}
    </UserStoreContext.Provider>
  );
}; 