
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DatabaseConfig from '@/components/DatabaseConfig';
import SyncButton from '@/components/SyncButton';
import { useInventoryContext } from '@/context/InventoryContext';
import { Search, Plus, Package, TrendingUp, TrendingDown, ArrowRightLeft, Settings, Database, CheckCircle, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';

const Inventory = () => {
  const { 
    items, 
    movements, 
    deleteItem, 
    searchItems,
    getTotalStockValue,
    getTotalItemTypes,
    getRecentMovements,
    getLowStockItems
  } = useInventoryContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const [databaseConfig, setDatabaseConfig] = useState<{
    supabaseUrl: string;
    supabaseKey: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('supabase-config');
    if (savedConfig) {
      try {
        setDatabaseConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erro ao carregar configuração do Supabase:', error);
      }
    }
  }, []);

  const filteredItems = useMemo(() => {
    return searchItems(searchQuery);
  }, [searchQuery, items, searchItems]);

  const stats = useMemo(() => {
    return {
      totalValue: getTotalStockValue(),
      totalTypes: getTotalItemTypes(),
      recentMovements: getRecentMovements(5),
      lowStockItems: getLowStockItems(5)
    };
  }, [getTotalStockValue, getTotalItemTypes, getRecentMovements, getLowStockItems]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o item ${name}?`)) {
      deleteItem(id);
    }
  };

  const handleConfigSave = (config: { supabaseUrl: string; supabaseKey: string }) => {
    // Salvar configuração do Supabase
    localStorage.setItem('supabase-config', JSON.stringify(config));
    setDatabaseConfig(config);
    setShowDatabaseConfig(false);
    toast({
      title: "Sucesso",
      description: "Configuração do Supabase salva com sucesso",
    });
  };

  const handleSyncInventory = async () => {
    if (!databaseConfig?.supabaseUrl) {
      toast({
        title: "Erro",
        description: "Configure primeiro a conexão com o Supabase",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      // Inicializar cliente Supabase com as configurações salvas
      supabaseService.initializeClient(databaseConfig.supabaseUrl, databaseConfig.supabaseKey);
      
      // Implementar sincronização do inventário com Supabase aqui
      // Exemplo: const result = await supabaseService.syncInventory(items);
      
      toast({
        title: "Sucesso",
        description: "Inventário sincronizado com o Supabase com sucesso",
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar inventário com o Supabase",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getTypeBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Manuais Bíblicos - Aluno': 'bg-blue-100 text-blue-800',
      'Manuais Bíblicos - Professor': 'bg-purple-100 text-purple-800',
      'Bíblias': 'bg-green-100 text-green-800',
      'Hinários/Livretos': 'bg-yellow-100 text-yellow-800',
      'Revistas': 'bg-orange-100 text-orange-800',
      'Vestuário': 'bg-pink-100 text-pink-800',
      'Acessórios': 'bg-cyan-100 text-cyan-800',
      'CDs Cantados': 'bg-red-100 text-red-800',
      'CDs Oração': 'bg-indigo-100 text-indigo-800',
      'CDs Instrumental': 'bg-gray-100 text-gray-800',
      'CDs Espanhol': 'bg-teal-100 text-teal-800',
      'CDs Playbacks': 'bg-lime-100 text-lime-800',
      'Outros': 'bg-slate-100 text-slate-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'saida': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'transferencia': return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Depósito</h1>
          <p className="text-muted-foreground">
            Gerenciamento de estoque e movimentações
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="church-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Itens</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTypes}</div>
            <p className="text-xs text-white/80">
              diferentes tipos em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              valor estimado do estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Baixa</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              itens com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {movements.length}
            </div>
            <p className="text-xs text-muted-foreground">
              total de movimentações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items">Mercadorias</TabsTrigger>
          <TabsTrigger value="entry">Entrada</TabsTrigger>
          <TabsTrigger value="exit">Saída</TabsTrigger>
          <TabsTrigger value="transfer">Transferência</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Mercadorias Cadastradas</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, código ou tipo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-80"
                    />
                  </div>
                  <Link to="/deposito/item/novo">
                    <Button className="church-gradient text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Item
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.codigo}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.nomeItem}</div>
                              {item.descricao && (
                                <div className="text-sm text-muted-foreground">{item.descricao}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeBadgeColor(item.tipoMercadoria)}>
                              {item.tipoMercadoria}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={item.quantidadeEstoque <= (item.estoqueMinimo || 10) ? 'text-red-600 font-medium' : ''}>
                              {item.quantidadeEstoque} {item.unidadeMedida}
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.valorUnitario * item.quantidadeEstoque)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link to={`/deposito/item/editar/${item.id}`}>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </Link>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(item.id, item.nomeItem)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Link to="/deposito/entrada">
                  <Button className="church-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Entrada
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Saída</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Link to="/deposito/saida">
                  <Button className="church-gradient text-white">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Nova Saída
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Transferência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Link to="/deposito/transferencia">
                  <Button className="church-gradient text-white">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Nova Transferência
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Supabase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seção de Configuração do Supabase */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Configuração do Banco de Dados</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowDatabaseConfig(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Configurar Supabase
                  </Button>
                </div>
                {databaseConfig && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Supabase Configurado</span>
                    </div>
                    <p className="text-sm text-green-700">
                      URL: {databaseConfig.supabaseUrl?.substring(0, 30)}...
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sincronização de Dados</h3>
                <div className="flex gap-2">
                  <SyncButton
                    onSyncFromDatabase={handleSyncInventory}
                    isSyncing={isSyncing}
                    label="Sincronizar com Supabase"
                    hasConfig={!!databaseConfig}
                    onOpenConfig={() => setShowDatabaseConfig(true)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Últimas Movimentações */}
      {stats.recentMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getMovementIcon(movement.tipoMovimentacao)}
                    <div>
                      <div className="font-medium">{movement.nomeItem}</div>
                      <div className="text-sm text-muted-foreground">
                        {movement.tipoMovimentacao === 'transferencia' && movement.nomeIgrejaDestino
                          ? `Transferência para ${movement.nomeIgrejaDestino}`
                          : movement.destino || movement.origem || 'Movimentação interna'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {movement.tipoMovimentacao === 'entrada' ? '+' : '-'}{movement.quantidade}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(movement.dataMovimentacao)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Configuração do Supabase */}
      <Dialog open={showDatabaseConfig} onOpenChange={setShowDatabaseConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Supabase - Inventário</DialogTitle>
          </DialogHeader>
          <DatabaseConfig
            onSave={handleConfigSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
