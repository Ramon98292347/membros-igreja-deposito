
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Church } from '@/types/church';

interface ChurchContextType {
  churches: Church[];
  addChurch: (church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => void;
  updateChurch: (id: string, church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => void;
  deleteChurch: (id: string) => void;
  clearChurches: () => void;
  getChurchById: (id: string) => Church | undefined;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const useChurchContext = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurchContext deve ser usado dentro de ChurchProvider');
  }
  return context;
};

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    const savedChurches = localStorage.getItem('churches');
    if (savedChurches) {
      setChurches(JSON.parse(savedChurches));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('churches', JSON.stringify(churches));
  }, [churches]);

  const addChurch = (churchData: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    const newChurch: Church = {
      ...churchData,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    setChurches(prev => [...prev, newChurch]);
  };

  const updateChurch = (id: string, churchData: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    setChurches(prev => prev.map(church => 
      church.id === id 
        ? { ...churchData, id, dataCadastro: church.dataCadastro, dataAtualizacao: new Date().toISOString() }
        : church
    ));
  };

  const deleteChurch = (id: string) => {
    setChurches(prev => prev.filter(church => church.id !== id));
  };

  const clearChurches = () => {
    setChurches([]);
  };

  const getChurchById = (id: string) => {
    return churches.find(church => church.id === id);
  };

  return (
    <ChurchContext.Provider value={{
      churches,
      addChurch,
      updateChurch,
      deleteChurch,
      clearChurches,
      getChurchById
    }}>
      {children}
    </ChurchContext.Provider>
  );
};
