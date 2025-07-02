
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Movement, Transfer } from '@/types/inventory';
import { useChurchContext } from './ChurchContext';

interface InventoryContextType {
  items: InventoryItem[];
  movements: Movement[];
  transfers: Transfer[];
  
  // Items
  addItem: (item: Omit<InventoryItem, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => InventoryItem | undefined;
  searchItems: (query: string) => InventoryItem[];
  
  // Movements
  addEntry: (entry: Omit<Movement, 'id' | 'tipoMovimentacao'>) => void;
  addExit: (exit: Omit<Movement, 'id' | 'tipoMovimentacao'>) => void;
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  addMovement: (movement: Omit<Movement, 'id'>) => void;
  updateItemStock: (itemId: string, quantityChange: number) => void;
  
  // Statistics
  getTotalStockValue: () => number;
  getLowStockItems: (limit?: number) => InventoryItem[];
  getRecentMovements: (limit?: number) => Movement[];
  getTotalItemTypes: () => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider = ({ children }: InventoryProviderProps) => {
  const { churches } = useChurchContext();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem('inventory-items');
    const storedMovements = localStorage.getItem('inventory-movements');
    const storedTransfers = localStorage.getItem('inventory-transfers');

    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
    if (storedMovements) {
      setMovements(JSON.parse(storedMovements));
    }
    if (storedTransfers) {
      setTransfers(JSON.parse(storedTransfers));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('inventory-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('inventory-movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('inventory-transfers', JSON.stringify(transfers));
  }, [transfers]);

  const addItem = (itemData: Omit<InventoryItem, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: crypto.randomUUID(),
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, itemData: Partial<InventoryItem>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...itemData, dataAtualizacao: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  const searchItems = (query: string) => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(
      item =>
        item.nomeItem.toLowerCase().includes(lowerQuery) ||
        item.codigo.toLowerCase().includes(lowerQuery) ||
        item.descricao.toLowerCase().includes(lowerQuery) ||
        item.tipoMercadoria.toLowerCase().includes(lowerQuery)
    );
  };

  const updateItemStock = (itemId: string, quantityChange: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { 
              ...item, 
              quantidadeEstoque: Math.max(0, item.quantidadeEstoque + quantityChange),
              dataAtualizacao: new Date().toISOString()
            }
          : item
      )
    );
  };

  const addMovement = (movementData: Omit<Movement, 'id'>) => {
    const movement: Movement = {
      ...movementData,
      id: crypto.randomUUID()
    };
    setMovements(prev => [...prev, movement]);
  };

  const addEntry = (entryData: Omit<Movement, 'id' | 'tipoMovimentacao'>) => {
    const entry: Movement = {
      ...entryData,
      id: crypto.randomUUID(),
      tipoMovimentacao: 'entrada'
    };
    
    setMovements(prev => [...prev, entry]);
    updateItemStock(entryData.itemId, entryData.quantidade);
  };

  const addExit = (exitData: Omit<Movement, 'id' | 'tipoMovimentacao'>) => {
    const item = getItemById(exitData.itemId);
    if (!item || item.quantidadeEstoque < exitData.quantidade) {
      throw new Error('Estoque insuficiente para esta operação');
    }

    const exit: Movement = {
      ...exitData,
      id: crypto.randomUUID(),
      tipoMovimentacao: 'saida'
    };
    
    setMovements(prev => [...prev, exit]);
    updateItemStock(exitData.itemId, -exitData.quantidade);
  };

  const addTransfer = (transferData: Omit<Transfer, 'id'>) => {
    const item = getItemById(transferData.itemId);
    if (!item || item.quantidadeEstoque < transferData.quantidade) {
      throw new Error('Estoque insuficiente para esta transferência');
    }

    const transfer: Transfer = {
      ...transferData,
      id: crypto.randomUUID(),
      status: 'enviado'
    };

    // Criar movimento de transferência
    const movement: Movement = {
      id: crypto.randomUUID(),
      itemId: transferData.itemId,
      nomeItem: transferData.nomeItem,
      tipoMovimentacao: 'transferencia',
      quantidade: transferData.quantidade,
      dataMovimentacao: transferData.dataTransferencia,
      igrejaOrigemId: transferData.igrejaOrigemId,
      igrejaDestinoId: transferData.igrejaDestinoId,
      nomeIgrejaOrigem: transferData.nomeIgrejaOrigem,
      nomeIgrejaDestino: transferData.nomeIgrejaDestino,
      responsavel: transferData.responsavelTransferencia,
      observacoes: transferData.observacoes,
      valorUnitario: transferData.valorUnitario,
      valorTotal: transferData.valorTotal,
      usuarioResponsavel: 'Sistema'
    };
    
    setTransfers(prev => [...prev, transfer]);
    setMovements(prev => [...prev, movement]);
    updateItemStock(transferData.itemId, -transferData.quantidade);
  };

  const getTotalStockValue = () => {
    return items.reduce((total, item) => {
      return total + (item.valorUnitario * item.quantidadeEstoque);
    }, 0);
  };

  const getLowStockItems = (limit: number = 5) => {
    return items
      .filter(item => item.quantidadeEstoque > 0)
      .sort((a, b) => {
        const aThreshold = a.estoqueMinimo || 10;
        const bThreshold = b.estoqueMinimo || 10;
        return (a.quantidadeEstoque - aThreshold) - (b.quantidadeEstoque - bThreshold);
      })
      .slice(0, limit);
  };

  const getRecentMovements = (limit: number = 5) => {
    return movements
      .sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime())
      .slice(0, limit);
  };

  const getTotalItemTypes = () => {
    return items.filter(item => item.quantidadeEstoque > 0).length;
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        movements,
        transfers,
        addItem,
        updateItem,
        deleteItem,
        getItemById,
        searchItems,
        addEntry,
        addExit,
        addTransfer,
        addMovement,
        updateItemStock,
        getTotalStockValue,
        getLowStockItems,
        getRecentMovements,
        getTotalItemTypes
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
