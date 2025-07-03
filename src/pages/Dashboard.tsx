
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useInventoryContext } from '@/context/InventoryContext';
import { supabaseService } from '@/services/supabaseService';
import { Search, Plus, Calendar, File, Printer, Users, Building, Package, TrendingUp, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { membersData: members, isSyncing, isLoading } = useAuth();
  const { 
    getTotalStockValue, 
    getTotalItemTypes, 
    getRecentMovements, 
    getLowStockItems 
  } = useInventoryContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [churches] = useState<any[]>([]); // Não carregar automaticamente, deixar vazio por enquanto
  const [churchesLoading] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter(member => 
      member.nomeCompleto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.funcaoMinisterial?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, members]);

  const memberStats = useMemo(() => {
    const total = members.length;
    const byFunction = members.reduce((acc, member) => {
      const cargo = member.funcaoMinisterial || 'Membro';
      acc[cargo] = (acc[cargo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('👥 Estatísticas por função ministerial:', byFunction);
    console.log('🔍 Funções encontradas:', Object.keys(byFunction));
    
    return { total, byFunction };
  }, [members]);

  const churchStats = useMemo(() => {
    const totalChurches = churches.length;
    
    console.log('🏛️ Calculando estatísticas das igrejas...');
    console.log('📊 Total de igrejas:', totalChurches);
    
    if (churches.length > 0) {
      console.log('🔍 Primeiras 3 igrejas e suas classificações:');
      churches.slice(0, 3).forEach((church, index) => {
        console.log(`${index + 1}. ${church.nomeIPDA || church.nome} - Classificação: '${church.classificacao}'`);
      });
    }
    
    const byClassification = churches.reduce((acc, church) => {
      const classificacao = (church.classificacao || 'Local').trim();
      console.log(`Igreja: ${church.nomeIPDA || church.nome} - Classificação original: '${church.classificacao}' - Classificação limpa: '${classificacao}'`);
      
      // Normalizar classificações para garantir correspondência
      let normalizedClassification = classificacao;
      if (classificacao.toLowerCase().includes('central')) {
        normalizedClassification = 'Central';
      } else if (classificacao.toLowerCase().includes('regional')) {
        normalizedClassification = 'Regional';
      } else if (classificacao.toLowerCase().includes('estadual')) {
        normalizedClassification = 'Estadual';
      } else if (classificacao.toLowerCase().includes('setorial')) {
        normalizedClassification = 'Setorial';
      } else {
        normalizedClassification = 'Local';
      }
      
      console.log(`Classificação normalizada: '${normalizedClassification}'`);
      acc[normalizedClassification] = (acc[normalizedClassification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Estatísticas por classificação:', byClassification);
    
    // Calcular total de membros de todas as igrejas
    const totalMembersAllChurches = churches.reduce((acc, church) => {
      return acc + (church.quantidadeMembros || church.membrosAtuais || 0);
    }, 0);
    
    return { totalChurches, byClassification, totalMembersAllChurches };
  }, [churches]);

  const inventoryStats = useMemo(() => {
    return {
      totalValue: getTotalStockValue(),
      totalTypes: getTotalItemTypes(),
      recentMovements: getRecentMovements(7),
      lowStockItems: getLowStockItems(3)
    };
  }, [getTotalStockValue, getTotalItemTypes, getRecentMovements, getLowStockItems]);

  const getFunctionBadgeColor = (funcao: string) => {
    const colors: Record<string, string> = {
      'Pastor': 'bg-purple-100 text-purple-800',
      'Presbítero': 'bg-blue-100 text-blue-800',
      'Diácono': 'bg-green-100 text-green-800',
      'Obreiro': 'bg-yellow-100 text-yellow-800',
      'Cooperador (Obreiro) (A)': 'bg-yellow-100 text-yellow-800',
      'Membro': 'bg-gray-100 text-gray-800',
      'Missionário': 'bg-red-100 text-red-800',
      'Evangelista': 'bg-orange-100 text-orange-800',
      'Cooperador': 'bg-cyan-100 text-cyan-800'
    };
    return colors[funcao] || 'bg-gray-100 text-gray-800';
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

  if (isLoading || isSyncing || churchesLoading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isSyncing ? 'Sincronizando dados...' : 'Carregando dados...'}
            </p>
         </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer size="xl" className="space-y-4 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua igreja
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/igrejas/nova">
            <Button className="church-gradient text-white shadow-church">
              <Building className="w-4 h-4 mr-2" />
              Cadastrar Nova Igreja
            </Button>
          </Link>
          <Link to="/membros/novo">
            <Button className="church-gradient text-white shadow-church">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Novo Membro
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo dos Membros */}
      <ResponsiveGrid cols={{ default: 2, sm: 3, lg: 6 }} gap="sm">
        <Card className="church-gradient text-white">
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Users className="h-8 w-8 mb-2" />
            <div className="text-center">
              <div className="text-2xl font-bold">{memberStats.total}</div>
              <p className="text-xs text-white/80">Total de Membros</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Users className="h-8 w-8 mb-2 text-gray-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{memberStats.byFunction['Membro'] || 0}</div>
              <p className="text-xs text-muted-foreground">Membros</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Users className="h-8 w-8 mb-2 text-yellow-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{(memberStats.byFunction['Obreiro'] || 0) + (memberStats.byFunction['Cooperador'] || 0) + (memberStats.byFunction['Cooperador (Obreiro) (A)'] || 0)}</div>
              <p className="text-xs text-muted-foreground">Obreiros/Cooperadores</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Users className="h-8 w-8 mb-2 text-green-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{memberStats.byFunction['Diácono'] || 0}</div>
              <p className="text-xs text-muted-foreground">Diáconos</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Users className="h-8 w-8 mb-2 text-blue-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{memberStats.byFunction['Presbítero'] || 0}</div>
              <p className="text-xs text-muted-foreground">Presbíteros</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Users className="h-8 w-8 mb-2 text-purple-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{memberStats.byFunction['Pastor'] || 0}</div>
              <p className="text-xs text-muted-foreground">Pastores</p>
            </div>
          </CardHeader>
        </Card>
      </ResponsiveGrid>

      {/* Estatísticas das Igrejas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Estatísticas das Igrejas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ default: 2, sm: 3, lg: 7 }} gap="sm">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-600">{churchStats.totalChurches}</div>
              <p className="text-xs text-muted-foreground">Total de Igrejas</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">{churchStats.totalMembersAllChurches}</div>
              <p className="text-xs text-muted-foreground">Total de Membros</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-purple-600">{churchStats.byClassification['Estadual'] || 0}</div>
              <p className="text-xs text-muted-foreground">Estadual</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">{churchStats.byClassification['Setorial'] || 0}</div>
              <p className="text-xs text-muted-foreground">Setorial</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <div className="text-xl font-bold text-pink-600">{churchStats.byClassification['Central'] || 0}</div>
              <p className="text-xs text-muted-foreground">Central</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold text-orange-600">{churchStats.byClassification['Regional'] || 0}</div>
              <p className="text-xs text-muted-foreground">Regional</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <div className="text-xl font-bold text-gray-600">{churchStats.byClassification['Local'] || 0}</div>
              <p className="text-xs text-muted-foreground">Local</p>
            </div>
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Estatísticas do Depósito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estatísticas do Depósito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="sm">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-600">{inventoryStats.totalTypes}</div>
              <p className="text-xs text-muted-foreground">Total de Itens em Estoque</p>
              <p className="text-xs text-gray-500">Tipos dos itens em estoque positivo</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">{formatCurrency(inventoryStats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Valor Estimado do Estoque</p>
              <p className="text-xs text-gray-500">Baseado no preço de custo</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold text-orange-600">{inventoryStats.recentMovements.length}</div>
              <p className="text-xs text-muted-foreground">Últimas Movimentações (7 dias)</p>
              <p className="text-xs text-gray-500">Nenhuma movimentação nos últimos 7 dias</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-xl font-bold text-red-600">{inventoryStats.lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Itens com Baixo Estoque</p>
              <p className="text-xs text-gray-500">Itens os itens com estoque adequado</p>
            </div>
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Pesquisar Membros */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Membros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome ou função ministerial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Igrejas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Principais Igrejas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {churches.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma igreja encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Os dados das igrejas serão carregados automaticamente
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Igreja</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Pastor</TableHead>
                    <TableHead>Membros Atuais</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {churches.slice(0, 5).map((church, index) => (
                    <TableRow key={church.id || index}>
                      <TableCell className="font-medium">
                        {church.nomeIPDA || church.nome || 'Nome não informado'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {church.classificacao || 'Local'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(typeof church.pastor === 'object' && church.pastor?.nome) || 
                         (typeof church.pastor === 'string' ? church.pastor : null) || 
                         'Não informado'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          {church.quantidadeMembros || church.membrosAtuais || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(typeof church.pastor === 'object' && church.pastor?.telefone) || 
                         church.telefone || 
                         'Não informado'}
                      </TableCell>
                      <TableCell>
                        {(typeof church.pastor === 'object' && church.pastor?.email) || 
                         church.email || 
                         'Não informado'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {churches.length > 5 && (
                <div className="text-center mt-4">
                  <Link to="/igrejas">
                    <Button variant="outline">
                      Ver todas as {churches.length} igrejas
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Membros */}
      <Card className="church-gradient-light text-white">
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-white/70" />
              <h3 className="text-lg font-semibold mb-2">Nenhum membro encontrado</h3>
              <p className="text-white/80 mb-4">
                Comece cadastrando o primeiro membro da igreja
              </p>
              <Link to="/membros/novo">
                <Button 
                  variant="outline" 
                  className="bg-white text-blue-600 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Membro
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/10">
                    <TableHead className="text-white">Nome Completo</TableHead>
                    <TableHead className="text-white">Função Ministerial</TableHead>
                    <TableHead className="text-white">Telefone</TableHead>
                    <TableHead className="text-white">Cidade</TableHead>
                    <TableHead className="text-white">Estado</TableHead>
                    <TableHead className="text-right text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.slice(0, 5).map((member) => (
                    <TableRow key={member.id} className="border-white/20 hover:bg-white/10">
                      <TableCell className="font-medium text-white">
                        {member.nomeCompleto}
                      </TableCell>
                      <TableCell>
                        <Badge className={getFunctionBadgeColor(member.funcaoMinisterial || 'Membro')}>
                          {member.funcaoMinisterial || 'Membro'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{member.telefone}</TableCell>
                      <TableCell className="text-white">{member.cidade}</TableCell>
                      <TableCell className="text-white">{member.estado}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {member.linkFicha && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                              onClick={() => window.open(member.linkFicha, '_blank')}
                            >
                              <File className="w-4 h-4" />
                            </Button>
                          )}
                          {member.dadosCarteirinha && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                              onClick={() => window.open(member.dadosCarteirinha, '_blank')}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredMembers.length > 5 && (
                <div className="text-center mt-4">
                  <Link to="/membros">
                    <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      Ver todos os {members.length} membros
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
};

export default Dashboard;
