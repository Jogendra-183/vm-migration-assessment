import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { serversApi } from '../api/servers';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  serverCount: number;
  refreshServerCount: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType>({
  serverCount: 41,
  refreshServerCount: async () => {},
});

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverCount, setServerCount] = useState<number>(41);
  const { isAuthenticated } = useAuth();

  const refreshServerCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await serversApi.getServers({ page: 0, size: 1 });
      if (res && typeof res.totalElements === 'number') {
        setServerCount(res.totalElements);
      }
    } catch (err) {
      console.error('Failed to fetch server count:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshServerCount();
  }, [refreshServerCount]);

  return (
    <InventoryContext.Provider value={{ serverCount, refreshServerCount }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
