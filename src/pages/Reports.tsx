
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemberContext } from '@/context/MemberContext';
import { useChurchContext } from '@/context/ChurchContext';
import { useInventoryContext } from '@/context/InventoryContext';
import { ReportType, ReportFilter } from '@/types/member';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, TrendingUp, Users, Building, Package } from 'lucide-react';

const Reports = () => {
  const { members } = useMemberContext();
  const { churches } = useChurchContext();
  const { items, movements } = useInventoryContext();
  const [filter, setFilter] = useState<ReportFilter>({
    tipo: 'todos-membros' as ReportType
  });
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const reportTypes = [
    { value: 'todos-membros', label: 'Todos os Membros' },
    { value: 'membros-por-funcao', label: 'Membros por Função Ministerial' },
    { value: 'aniversariantes-mes', label: 'Aniversariantes do Mês' },
    { value: 'membros-por-estado-civil', label: 'Membros por Estado Civil' },
    { value: 'membros-batizados-periodo', label: 'Membros Batizados em Período' },
    { value: 'igrejas-por-classificacao', label: 'Igrejas por Classificação' },
    { value: 'estatisticas-deposito', label: 'Estatísticas do Depósito' },
    { value: 'movimentacoes-deposito', label: 'Movimentações do Depósito' }
  ];

  const systemStats = useMemo(() => {
    const totalMembers = members.length;
    const totalChurches = churches.length;
    const totalItems = items.length;
    const totalMovements = movements.length;
    
    const membersByFunction = members.reduce((acc, member) => {
      acc[member.funcaoMinisterial] = (acc[member.funcaoMinisterial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const churchesByClassification = churches.reduce((acc, church) => {
      acc[church.classificacao] = (acc[church.classificacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMembers,
      totalChurches,
      totalItems,
      totalMovements,
      membersByFunction,
      churchesByClassification
    };
  }, [members, churches, items, movements]);

  const generateReport = () => {
    let reportData: any = null;

    switch (filter.tipo) {
      case 'todos-membros':
        reportData = {
          type: 'table',
          title: 'Relatório - Todos os Membros',
          data: members,
          columns: ['nomeCompleto', 'funcaoMinisterial', 'telefone', 'cidade', 'estado']
        };
        break;

      case 'membros-por-funcao':
        reportData = {
          type: 'chart',
          title: 'Relatório - Membros por Função Ministerial',
          chartData: Object.entries(systemStats.membersByFunction).map(([funcao, count]) => ({
            funcao,
            quantidade: count
          })),
          tableData: Object.entries(systemStats.membersByFunction).map(([funcao, count]) => ({
            funcao,
            quantidade: count
          }))
        };
        break;

      case 'aniversariantes-mes':
        const currentMonth = new Date().getMonth() + 1;
        const aniversariantes = members.filter(member => {
          if (!member.dataNascimento) return false;
          const birthMonth = new Date(member.dataNascimento).getMonth() + 1;
          return birthMonth === currentMonth;
        });
        
        reportData = {
          type: 'table',
          title: `Relatório - Aniversariantes do Mês (${new Date().toLocaleDateString('pt-BR', { month: 'long' })})`,
          data: aniversariantes,
          columns: ['nomeCompleto', 'dataNascimento', 'idade', 'telefone', 'funcaoMinisterial']
        };
        break;

      case 'membros-por-estado-civil':
        const byMaritalStatus = members.reduce((acc, member) => {
          acc[member.estadoCivil] = (acc[member.estadoCivil] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        reportData = {
          type: 'chart',
          title: 'Relatório - Membros por Estado Civil',
          chartData: Object.entries(byMaritalStatus).map(([estado, count]) => ({
            estado,
            quantidade: count
          })),
          tableData: Object.entries(byMaritalStatus).map(([estado, count]) => ({
            estado,
            quantidade: count
          }))
        };
        break;

      case 'membros-batizados-periodo':
        if (filter.dataInicio && filter.dataFim) {
          const startDate = new Date(filter.dataInicio);
          const endDate = new Date(filter.dataFim);
          
          const membersInPeriod = members.filter(member => {
            if (!member.dataBatismo) return false;
            const baptismDate = new Date(member.dataBatismo);
            return baptismDate >= startDate && baptismDate <= endDate;
          });
          
          reportData = {
            type: 'table',
            title: `Relatório - Membros Batizados (${filter.dataInicio} a ${filter.dataFim})`,
            data: membersInPeriod,
            columns: ['nomeCompleto', 'dataBatismo', 'funcaoMinisterial', 'telefone', 'cidade']
          };
        }
        break;

      case 'igrejas-por-classificacao':
        reportData = {
          type: 'chart',
          title: 'Relatório - Igrejas por Classificação',
          chartData: Object.entries(systemStats.churchesByClassification).map(([classificacao, count]) => ({
            classificacao,
            quantidade: count
          })),
          tableData: Object.entries(systemStats.churchesByClassification).map(([classificacao, count]) => ({
            classificacao,
            quantidade: count
          }))
        };
        break;

      case 'estatisticas-deposito':
        reportData = {
          type: 'table',
          title: 'Relatório - Estatísticas do Depósito',
          data: items,
          columns: ['nomeItem', 'tipoMercadoria', 'quantidadeEstoque', 'valorUnitario', 'unidadeMedida']
        };
        break;

      case 'movimentacoes-deposito':
        reportData = {
          type: 'table',
          title: 'Relatório - Movimentações do Depósito',
          data: movements,
          columns: ['nomeItem', 'tipoMovimentacao', 'quantidade', 'dataMovimentacao', 'destino']
        };
        break;
    }

    setGeneratedReport(reportData);
  };

  const exportReport = () => {
    if (!generatedReport) return;

    let csvContent = '';
    
    if (generatedReport.type === 'table') {
      const headers = generatedReport.columns.map((col: string) => {
        const headerMap: Record<string, string> = {
          'nomeCompleto': 'Nome Completo',
          'funcaoMinisterial': 'Função Ministerial',
          'telefone': 'Telefone',
          'cidade': 'Cidade',
          'estado': 'Estado',
          'dataNascimento': 'Data de Nascimento',
          'idade': 'Idade',
          'dataBatismo': 'Data de Batismo',
          'nomeItem': 'Nome do Item',
          'tipoMercadoria': 'Tipo de Mercadoria',
          'quantidadeEstoque': 'Quantidade em Estoque',
          'valorUnitario': 'Valor Unitário',
          'unidadeMedida': 'Unidade de Medida',
          'tipoMovimentacao': 'Tipo de Movimentação',
          'quantidade': 'Quantidade',
          'dataMovimentacao': 'Data da Movimentação',
          'destino': 'Destino'
        };
        return headerMap[col] || col;
      });
      csvContent += headers.join(',') + '\n';
      
      generatedReport.data.forEach((item: any) => {
        const row = generatedReport.columns.map((col: string) => {
          let value = item[col] || '';
          if (col.includes('data') && value) {
            value = new Date(value).toLocaleDateString('pt-BR');
          }
          return `"${value}"`;
        });
        csvContent += row.join(',') + '\n';
      });
    } else if (generatedReport.type === 'chart') {
      csvContent += 'Categoria,Quantidade\n';
      generatedReport.tableData.forEach((item: any) => {
        csvContent += `"${Object.values(item)[0]}","${Object.values(item)[1]}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${filter.tipo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#22c55e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

  const getFunctionBadgeColor = (funcao: string) => {
    const colors: Record<string, string> = {
      'Pastor': 'bg-purple-100 text-purple-800',
      'Presbítero': 'bg-blue-100 text-blue-800',
      'Diácono': 'bg-green-100 text-green-800',
      'Obreiro': 'bg-yellow-100 text-yellow-800',
      'Membro': 'bg-gray-100 text-gray-800',
      'Missionário': 'bg-red-100 text-red-800',
      'Evangelista': 'bg-orange-100 text-orange-800',
      'Cooperador': 'bg-cyan-100 text-cyan-800'
    };
    return colors[funcao] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios detalhados sobre os membros da igreja
          </p>
        </div>
      </div>

      {/* Cards de Resumo do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="church-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalMembers}</div>
            <p className="text-xs text-white/80">
              membros cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Igrejas</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {systemStats.totalChurches}
            </div>
            <p className="text-xs text-muted-foreground">
              igrejas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens do Depósito</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systemStats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              itens em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {systemStats.totalMovements}
            </div>
            <p className="text-xs text-muted-foreground">
              movimentações registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuração do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select 
                value={filter.tipo} 
                onValueChange={(value) => setFilter({...filter, tipo: value as ReportType})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filter.tipo === 'membros-batizados-periodo' && (
              <>
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filter.dataInicio || ''}
                    onChange={(e) => setFilter({...filter, dataInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filter.dataFim || ''}
                    onChange={(e) => setFilter({...filter, dataFim: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-start">
            <Button onClick={generateReport} className="church-gradient text-white">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados do Relatório */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg sm:text-xl">{generatedReport.title}</CardTitle>
              <Button onClick={exportReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {generatedReport.type === 'chart' && (
              <div className="space-y-6">
                {/* Gráfico de Barras - Responsivo */}
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generatedReport.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey={Object.keys(generatedReport.chartData[0])[0]} 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Pizza - Responsivo */}
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generatedReport.chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="quantidade"
                        fontSize={10}
                      >
                        {generatedReport.chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela de Resumo */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Resumo dos Dados</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedReport.tableData.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {Object.values(item)[0] as string}
                            </TableCell>
                            <TableCell className="text-right">
                              {Object.values(item)[1] as number}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {generatedReport.type === 'table' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {generatedReport.columns.map((col: string) => {
                        const headerMap: Record<string, string> = {
                          'nomeCompleto': 'Nome Completo',
                          'funcaoMinisterial': 'Função Ministerial',
                          'telefone': 'Telefone',
                          'cidade': 'Cidade',
                          'estado': 'Estado',
                          'dataNascimento': 'Data de Nascimento',
                          'idade': 'Idade',
                          'dataBatismo': 'Data de Batismo',
                          'nomeItem': 'Nome do Item',
                          'tipoMercadoria': 'Tipo de Mercadoria',
                          'quantidadeEstoque': 'Quantidade em Estoque',
                          'valorUnitario': 'Valor Unitário',
                          'unidadeMedida': 'Unidade de Medida',
                          'tipoMovimentacao': 'Tipo de Movimentação',
                          'quantidade': 'Quantidade',
                          'dataMovimentacao': 'Data da Movimentação',
                          'destino': 'Destino'
                        };
                        return (
                          <TableHead key={col} className="text-xs sm:text-sm">
                            {headerMap[col] || col}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedReport.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={generatedReport.columns.length} className="text-center py-8 text-muted-foreground">
                          Nenhum dado encontrado para os filtros selecionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      generatedReport.data.map((item: any, index: number) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          {generatedReport.columns.map((col: string) => (
                            <TableCell key={col} className="text-xs sm:text-sm">
                              {col === 'funcaoMinisterial' ? (
                                <Badge className={getFunctionBadgeColor(item[col])}>
                                  {item[col]}
                                </Badge>
                              ) : col.includes('data') && item[col] ? (
                                new Date(item[col]).toLocaleDateString('pt-BR')
                              ) : col === 'valorUnitario' ? (
                                new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(item[col] || 0)
                              ) : (
                                item[col] || '-'
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
