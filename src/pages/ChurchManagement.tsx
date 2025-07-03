
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Church, Settings, Save, List, Grid, BarChart3, TrendingUp, Users, MapPin, Calendar, Download, FileText, PieChart, Database, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SyncButton from '@/components/SyncButton';
import DatabaseConfig from '@/components/DatabaseConfig';
import ChurchCarousel from '@/components/ChurchCarousel';
import { useSupabaseChurches } from '@/hooks/useSupabaseChurches';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';

const ChurchManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('lista');
  const [viewMode, setViewMode] = useState<'list' | 'carousel'>('list');
  const [databaseConfig, setDatabaseConfig] = useState<{
    supabaseUrl: string;
    supabaseKey: string;
  } | null>(null);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  
  const { churches, isLoading, syncChurches, isSyncing, importedChurches, saveImportedChurches, hasImportedData } = useSupabaseChurches();

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('supabase-config');
    if (savedConfig) {
      try {
        setDatabaseConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
  }, []);

  const filteredChurches = churches.filter(church =>
    church.nomeIPDA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.pastor?.nomeCompleto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.endereco?.rua?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSyncChurches = async () => {
    if (!supabaseService.isInitialized()) {
      toast({
        title: "Erro",
        description: "Configure primeiro a conexão com o Supabase",
        variant: "destructive",
      });
      return;
    }

    try {
      const churchesData = await supabaseService.readChurches();
      if (churchesData && churchesData.length > 0) {
        saveImportedChurches(churchesData);
        toast({
          title: "Sucesso",
          description: `${churchesData.length} igrejas importadas com sucesso!`,
        });
      } else {
        toast({
          title: "Aviso",
          description: "Nenhuma igreja encontrada no Supabase",
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar igrejas:', error);
      toast({
        title: "Erro",
        description: "Falha ao importar igrejas do Supabase",
        variant: "destructive",
      });
    }
  };

  const handleConfigSave = (config: { supabaseUrl: string; supabaseKey: string }) => {
    // Salvar configuração do Supabase
    localStorage.setItem('supabase-config', JSON.stringify(config));
    setDatabaseConfig(config);
  };

  // Funções para gerar relatórios CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateGeneralReport = () => {
    const headers = [
      'Nome da Igreja',
      'Tipo',
      'Classificação',
      'Pastor',
      'Telefone Pastor',
      'Email Pastor',
      'Endereço',
      'Bairro',
      'Cidade',
      'Estado',
      'CEP',
      'Membros Iniciais',
      'Membros Atuais',
      'Almas Batizadas',
      'Tem Escola Dominical',
      'Quantidade Crianças',
      'Dias Funcionamento'
    ];
    
    const rows = churches.map(church => [
      church.nomeIPDA || '',
      church.tipoIPDA || '',
      church.classificacao || '',
      church.pastor?.nomeCompleto || '',
      church.pastor?.telefone || '',
      church.pastor?.email || '',
      church.endereco?.rua || '',
      church.endereco?.bairro || '',
      church.endereco?.cidade || '',
      church.endereco?.estado || '',
      church.endereco?.cep || '',
      church.membrosIniciais || 0,
      church.membrosAtuais || 0,
      church.almasBatizadas || 0,
      church.temEscola ? 'Sim' : 'Não',
      church.quantidadeCriancas || 0,
      church.diasFuncionamento || ''
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generateMembersReport = () => {
    const headers = ['Nome da Igreja', 'Cidade', 'Membros Iniciais', 'Membros Atuais', 'Crescimento', 'Almas Batizadas'];
    
    const rows = churches.map(church => {
      const crescimento = ((church.membrosAtuais || 0) - (church.membrosIniciais || 0));
      const percentualCrescimento = church.membrosIniciais ? ((crescimento / church.membrosIniciais) * 100).toFixed(1) : '0';
      
      return [
        church.nomeIPDA || '',
        church.endereco?.cidade || '',
        church.membrosIniciais || 0,
        church.membrosAtuais || 0,
        `${crescimento} (${percentualCrescimento}%)`,
        church.almasBatizadas || 0
      ];
    });
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generateGeographicReport = () => {
    const headers = ['Cidade', 'Estado', 'Quantidade de Igrejas', 'Total de Membros', 'Média de Membros por Igreja'];
    
    const cityData = Array.from(new Set(churches.map(c => c.endereco?.cidade).filter(Boolean)))
      .map(cidade => {
        const churchesInCity = churches.filter(c => c.endereco?.cidade === cidade);
        const totalMembers = churchesInCity.reduce((sum, c) => sum + (c.membrosAtuais || 0), 0);
        const avgMembers = (totalMembers / churchesInCity.length).toFixed(1);
        const estado = churchesInCity[0]?.endereco?.estado || '';
        
        return [
          cidade,
          estado,
          churchesInCity.length,
          totalMembers,
          avgMembers
        ];
      });
    
    return [headers, ...cityData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generateClassificationReport = () => {
    const headers = ['Classificação', 'Quantidade', 'Percentual', 'Total de Membros', 'Média de Membros'];
    
    const classifications = ['Local', 'Congregação', 'Igreja'];
    const rows = classifications.map(classificacao => {
      const churchesOfType = churches.filter(c => c.classificacao === classificacao);
      const count = churchesOfType.length;
      const percentage = ((count / churches.length) * 100).toFixed(1);
      const totalMembers = churchesOfType.reduce((sum, c) => sum + (c.membrosAtuais || 0), 0);
      const avgMembers = count > 0 ? (totalMembers / count).toFixed(1) : '0';
      
      return [
        classificacao,
        count,
        `${percentage}%`,
        totalMembers,
        avgMembers
      ];
    });
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generatePastorsReport = () => {
    const headers = ['Nome do Pastor', 'Igreja', 'Telefone', 'Email', 'Cidade', 'Membros da Igreja'];
    
    const rows = churches
      .filter(church => church.pastor?.nomeCompleto)
      .map(church => [
        church.pastor?.nomeCompleto || '',
        church.nomeIPDA || '',
        church.pastor?.telefone || '',
        church.pastor?.email || '',
        church.endereco?.cidade || '',
        church.membrosAtuais || 0
      ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generateStatisticalReport = () => {
    const headers = ['Métrica', 'Valor'];
    
    const maxMembers = Math.max(...churches.map(c => c.membrosAtuais || 0));
    const minMembers = Math.min(...churches.map(c => c.membrosAtuais || 0));
    const avgMembers = (stats.totalMembers / stats.totalChurches).toFixed(1);
    const citiesCount = new Set(churches.map(c => c.endereco?.cidade).filter(Boolean)).size;
    const pastorsCount = churches.filter(c => c.pastor?.nomeCompleto).length;
    const schoolsCount = churches.filter(c => c.temEscola).length;
    
    const rows = [
      ['Total de Igrejas', stats.totalChurches],
      ['Total de Membros', stats.totalMembers],
      ['Média de Membros por Igreja', avgMembers],
      ['Maior Igreja (membros)', maxMembers],
      ['Menor Igreja (membros)', minMembers],
      ['Cidades Atendidas', citiesCount],
      ['Pastores Cadastrados', pastorsCount],
      ['Igrejas com Escola Dominical', schoolsCount],
      ['Igrejas Ativas', stats.activeChurches],
      ['Igrejas Inativas', stats.inactiveChurches]
    ];
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const stats = {
    totalChurches: churches.length,
    totalMembers: churches.reduce((sum, church) => sum + (church.membrosAtuais || 0), 0),
    activeChurches: churches.filter(church => church.classificacao !== 'Local').length,
    inactiveChurches: churches.filter(church => church.classificacao === 'Local').length
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando igrejas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestão de Igrejas</h1>
          <p className="text-muted-foreground">
            Gerencie as igrejas da sua denominação
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="church-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Igrejas</CardTitle>
            <Church className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChurches}</div>
            <p className="text-xs text-white/80">
              igrejas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Church className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              membros em todas as igrejas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Igrejas Ativas</CardTitle>
            <Church className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeChurches}
            </div>
            <p className="text-xs text-muted-foreground">
              igrejas em funcionamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Igrejas Inativas</CardTitle>
            <Church className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactiveChurches}
            </div>
            <p className="text-xs text-muted-foreground">
              igrejas inativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="lista">Lista de Igrejas</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="remanejamento">Remanejamento</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  Lista de Igrejas ({filteredChurches.length})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Pesquisar igrejas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-80"
                    />
                  </div>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-r-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'carousel' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('carousel')}
                      className="rounded-l-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => navigate('/igrejas/nova')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Igreja
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Igreja</TableHead>
                        <TableHead className="hidden md:table-cell">Pastor</TableHead>
                        <TableHead className="hidden lg:table-cell">Classificação</TableHead>
                        <TableHead className="hidden sm:table-cell">Membros</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChurches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="text-muted-foreground">
                              {searchQuery ? 'Nenhuma igreja encontrada' : 'Nenhuma igreja cadastrada'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredChurches.map((church) => (
                          <TableRow key={church.id}>
                            <TableCell className="font-medium">
                              {church.nomeIPDA}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {church.pastor?.nomeCompleto || 'Não informado'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline">
                                {church.classificacao || 'Não classificada'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {church.membrosAtuais || 0}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/igrejas/editar/${church.id}`)}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <ChurchCarousel churches={filteredChurches} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento de Membros</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+12%</div>
                <p className="text-xs text-muted-foreground">
                  nos últimos 6 meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média de Membros</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.totalMembers / stats.totalChurches || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  membros por igreja
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maior Igreja</CardTitle>
                <Church className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...churches.map(c => c.membrosAtuais || 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  membros na maior igreja
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cobertura Geográfica</CardTitle>
                <MapPin className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(churches.map(c => c.endereco?.cidade).filter(Boolean)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  cidades atendidas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por Classificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição por Classificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Local', 'Congregação', 'Igreja'].map(classificacao => {
                  const count = churches.filter(c => c.classificacao === classificacao).length;
                  const percentage = ((count / churches.length) * 100).toFixed(1);
                  return (
                    <div key={classificacao} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-sm text-muted-foreground">{classificacao}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Igrejas por Membros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 5 Igrejas por Número de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {churches
                  .sort((a, b) => (b.membrosAtuais || 0) - (a.membrosAtuais || 0))
                  .slice(0, 5)
                  .map((church, index) => (
                    <div key={church.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{church.nomeIPDA}</div>
                          <div className="text-sm text-muted-foreground">{church.endereco?.cidade}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{church.membrosAtuais || 0}</div>
                        <div className="text-sm text-muted-foreground">membros</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição Geográfica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distribuição Geográfica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(churches.map(c => c.endereco?.cidade).filter(Boolean)))
                  .map(cidade => {
                    const churchesInCity = churches.filter(c => c.endereco?.cidade === cidade);
                    const totalMembers = churchesInCity.reduce((sum, c) => sum + (c.membrosAtuais || 0), 0);
                    return (
                      <div key={cidade} className="p-4 border rounded-lg">
                        <div className="font-medium">{cidade}</div>
                        <div className="text-sm text-muted-foreground">
                          {churchesInCity.length} igreja(s) • {totalMembers} membros
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          {/* Relatórios Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Relatório Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Relatório completo com todas as igrejas e suas informações
                </p>
                <Button className="w-full" onClick={() => {
                  const csvContent = generateGeneralReport();
                  downloadCSV(csvContent, 'relatorio-geral-igrejas.csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  Relatório de Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Estatísticas detalhadas sobre membros por igreja
                </p>
                <Button className="w-full" onClick={() => {
                  const csvContent = generateMembersReport();
                  downloadCSV(csvContent, 'relatorio-membros-igrejas.csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Relatório Geográfico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Distribuição das igrejas por localização
                </p>
                <Button className="w-full" onClick={() => {
                  const csvContent = generateGeographicReport();
                  downloadCSV(csvContent, 'relatorio-geografico-igrejas.csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Church className="h-5 w-5 text-orange-600" />
                  Relatório por Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Igrejas agrupadas por tipo e classificação
                </p>
                <Button className="w-full" onClick={() => {
                  const csvContent = generateClassificationReport();
                  downloadCSV(csvContent, 'relatorio-classificacao-igrejas.csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-red-600" />
                  Relatório de Pastores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Informações dos pastores e suas igrejas
                </p>
                <Button className="w-full" onClick={() => {
                  const csvContent = generatePastorsReport();
                  downloadCSV(csvContent, 'relatorio-pastores.csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  Relatório Estatístico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Resumo estatístico com métricas principais
                </p>
                <Button className="w-full" onClick={() => {
                  const csvContent = generateStatisticalReport();
                  downloadCSV(csvContent, 'relatorio-estatistico.csv');
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resumo dos Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{churches.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Igrejas</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalMembers}</div>
                  <div className="text-sm text-muted-foreground">Total de Membros</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(churches.map(c => c.endereco?.cidade).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Cidades Atendidas</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {churches.filter(c => c.pastor?.nomeCompleto).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pastores Cadastrados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remanejamento">
          <Card>
            <CardHeader>
              <CardTitle>Remanejamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Acesse o formulário de solicitação de remanejamento
                </p>
                <Button 
                  onClick={() => navigate('/remanejamento')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Abrir Formulário de Remanejamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contratos">
          <Card>
            <CardHeader>
              <CardTitle>Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Acesse o formulário de contratos
                </p>
                <Button 
                  onClick={() => navigate('/contratos')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Abrir Formulário de Contratos
                </Button>
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
              {/* Seção de Configuração do Banco de Dados */}
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
                      URL: {databaseConfig.supabaseUrl?.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sincronização de Dados</h3>
                <SyncButton
                  onSyncFromDatabase={handleSyncChurches}
                  onSyncToDatabase={() => {}}
                  onSaveToSystem={() => {}}
                  onOpenConfig={() => setShowDatabaseConfig(true)}
                  isLoading={isLoading}
                  isSyncing={isSyncing}
                  memberCount={churches.length}
                  hasConfig={!!databaseConfig}
                />
                {hasImportedData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">Dados Importados</h4>
                        <p className="text-sm text-blue-700">
                          {importedChurches.length} igrejas foram importadas e estão prontas para serem salvas.
                        </p>
                      </div>
                      <Button onClick={saveImportedChurches} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Importação
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Configuração do Supabase */}
       <Dialog open={showDatabaseConfig} onOpenChange={setShowDatabaseConfig}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Configuração do Supabase</DialogTitle>
           </DialogHeader>
           <DatabaseConfig
             onSave={(config) => {
               handleConfigSave(config);
               setShowDatabaseConfig(false);
             }}
           />
         </DialogContent>
       </Dialog>
    </div>
  );
};

export default ChurchManagement;
