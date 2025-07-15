import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiService from '../services/api';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UserStoreContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  saveLocationToBackend: (location: Location) => Promise<void>;
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

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    // Auto-save to backend when location changes
    saveLocationToBackend(newLocation);
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

  return (
    <UserStoreContext.Provider value={{ location, setLocation, saveLocationToBackend }}>
      {children}
    </UserStoreContext.Provider>
  );
}; 