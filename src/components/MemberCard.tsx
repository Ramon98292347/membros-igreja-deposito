
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMemberContext } from '@/context/MemberContext';
import { CreditCard, Printer, Settings } from 'lucide-react';
import { format, addYears } from 'date-fns';
import MemberCardCarousel from './MemberCardCarousel';

const MemberCard = () => {
  const { members } = useMemberContext();
  const [selectedMember, setSelectedMember] = useState('');
  const [validUntil, setValidUntil] = useState(format(addYears(new Date(), 1), 'yyyy-MM-dd'));
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'individual'>('carousel');
  
  const [config, setConfig] = useState({
    template: `IGREJA PENTECOSTAL DEUS É AMOR
CARTEIRINHA DE MEMBRO

Nome: {nomeCompleto}
Função: {funcaoMinisterial}
RG: {rg}
CPF: {cpf}

Válida até: {dataValidade}

Esta carteirinha identifica o portador como membro ativo da IPDA.`
  });

  const selectedMemberData = members.find(m => m.id === selectedMember);

  const generateCard = () => {
    if (!selectedMemberData) {
      alert('Por favor, selecione um membro.');
      return;
    }
    setShowPreview(true);
  };

  const processTemplate = (template: string) => {
    return template
      .replace(/{nomeCompleto}/g, selectedMemberData?.nomeCompleto || '')
      .replace(/{funcaoMinisterial}/g, selectedMemberData?.funcaoMinisterial || '')
      .replace(/{rg}/g, selectedMemberData?.rg || '')
      .replace(/{cpf}/g, selectedMemberData?.cpf || '')
      .replace(/{dataValidade}/g, validUntil ? new Date(validUntil).toLocaleDateString('pt-BR') : '');
  };

  const printCard = () => {
    window.print();
  };

  if (showConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Carteirinha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Template da Carteirinha</Label>
            <textarea
              id="template"
              value={config.template}
              onChange={(e) => setConfig({...config, template: e.target.value})}
              className="min-h-96 w-full p-3 border rounded-md font-mono text-sm"
              placeholder="Use as tags: {nomeCompleto}, {funcaoMinisterial}, {rg}, {cpf}, {dataValidade}"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowConfig(false)} variant="outline">
              Voltar
            </Button>
            <Button onClick={() => {
              localStorage.setItem('member-card-config', JSON.stringify(config));
              setShowConfig(false);
            }}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 no-print">
          <Button onClick={() => setShowPreview(false)} variant="outline">
            Voltar
          </Button>
          <Button onClick={printCard} className="church-gradient text-white">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Card className="print-card max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {processTemplate(config.template)}
              </div>
            </div>
          </CardContent>
        </Card>

        <style>
          {`
            @media print {
              .no-print { display: none; }
              .print-card { box-shadow: none; border: none; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle between carousel and individual mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Carteirinhas de Membros
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setViewMode(viewMode === 'carousel' ? 'individual' : 'carousel')} 
                variant="outline" 
                size="sm"
              >
                {viewMode === 'carousel' ? 'Modo Individual' : 'Modo Carrossel'}
              </Button>
              <Button onClick={() => setShowConfig(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Carousel Mode */}
      {viewMode === 'carousel' && <MemberCardCarousel />}
      
      {/* Individual Mode */}
      {viewMode === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Gerar Carteirinha Individual
            </CardTitle>
          </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="member">Selecionar Membro *</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o membro" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.nomeCompleto} - {member.funcaoMinisterial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valid-until">Válida até</Label>
            <Input
              id="valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>

        {selectedMemberData && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Membro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Nome:</strong> {selectedMemberData.nomeCompleto}</div>
                <div><strong>Função:</strong> {selectedMemberData.funcaoMinisterial}</div>
                <div><strong>RG:</strong> {selectedMemberData.rg}</div>
                <div><strong>CPF:</strong> {selectedMemberData.cpf}</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={generateCard}
          disabled={!selectedMember}
          className="w-full church-gradient text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Gerar Carteirinha
        </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberCard;
