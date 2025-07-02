import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Upload, Settings, Save } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface SyncButtonProps {
  onSyncFromSheets: () => void;
  onSyncToSheets: () => void;
  onSaveToSystem?: () => void;
  onOpenConfig: () => void;
  isLoading?: boolean;
  isSyncing?: boolean;
  lastSyncTime?: string;
  memberCount?: number;
  hasConfig?: boolean;
}

export default function SyncButton({ 
  onSyncFromSheets, 
  onSyncToSheets, 
  onSaveToSystem,
  onOpenConfig,
  isLoading = false,
  isSyncing = false,
  lastSyncTime,
  memberCount = 0,
  hasConfig = false
}: SyncButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isDisabled = isLoading || isSyncing || !hasConfig;
  
  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Nunca';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Inválido';
    }
  };

  if (!hasConfig) {
    return (
      <Button 
        onClick={onOpenConfig}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Configurar Google Sheets
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            size="sm"
            disabled={isDisabled}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status da Sincronização</span>
              <Badge variant={memberCount > 0 ? "default" : "secondary"}>
                {memberCount} membros
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Última sincronização: {formatLastSync(lastSyncTime)}
            </p>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => {
              onSyncFromSheets();
              setIsOpen(false);
            }}
            disabled={isDisabled}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Importar do Google Sheets</span>
              <span className="text-xs text-muted-foreground">
                Baixar dados da planilha
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              onSyncToSheets();
              setIsOpen(false);
            }}
            disabled={isDisabled || memberCount === 0}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Exportar para Google Sheets</span>
              <span className="text-xs text-muted-foreground">
                Enviar dados para a planilha
              </span>
            </div>
          </DropdownMenuItem>
          
          {onSaveToSystem && (
            <DropdownMenuItem 
              onClick={() => {
                onSaveToSystem();
                setIsOpen(false);
              }}
              disabled={isDisabled || memberCount === 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <div className="flex flex-col">
                <span>Salvar no Sistema</span>
                <span className="text-xs text-muted-foreground">
                  Importar dados para o sistema local
                </span>
              </div>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => {
              onOpenConfig();
              setIsOpen(false);
            }}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Configurações</span>
              <span className="text-xs text-muted-foreground">
                Gerenciar integração
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}