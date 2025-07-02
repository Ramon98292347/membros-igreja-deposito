
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMemberContext } from '@/context/MemberContext';
import { FileText, Printer, Settings } from 'lucide-react';
import MemberRecordCarousel from './MemberRecordCarousel';

const MemberRecord = () => {
  const { members } = useMemberContext();
  const [selectedMember, setSelectedMember] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'individual'>('carousel');
  
  const [config, setConfig] = useState({
    template: `FICHA DE MEMBRO - IPDA

Nome: {nomeCompleto}
Data de Nascimento: {dataNascimento}
Função: {funcaoMinisterial}
Telefone: {telefone}
Email: {email}
Endereço: {endereco}, {numeroCasa} - {bairro}
{cidade}, {estado} - CEP: {cep}

Data de Batismo: {dataBatismo}
Igreja do Batismo: {igrejaBatismo}
Estado Civil: {estadoCivil}

Observações: {observacoes}`
  });

  const selectedMemberData = members.find(m => m.id === selectedMember);

  const generateRecord = () => {
    if (!selectedMemberData) {
      alert('Por favor, selecione um membro.');
      return;
    }
    setShowPreview(true);
  };

  const processTemplate = (template: string) => {
    return template
      .replace(/{nomeCompleto}/g, selectedMemberData?.nomeCompleto || '')
      .replace(/{dataNascimento}/g, selectedMemberData?.dataNascimento ? new Date(selectedMemberData.dataNascimento).toLocaleDateString('pt-BR') : '')
      .replace(/{funcaoMinisterial}/g, selectedMemberData?.funcaoMinisterial || '')
      .replace(/{telefone}/g, selectedMemberData?.telefone || '')
      .replace(/{email}/g, selectedMemberData?.email || '')
      .replace(/{endereco}/g, selectedMemberData?.endereco || '')
      .replace(/{numeroCasa}/g, selectedMemberData?.numeroCasa || '')
      .replace(/{bairro}/g, selectedMemberData?.bairro || '')
      .replace(/{cidade}/g, selectedMemberData?.cidade || '')
      .replace(/{estado}/g, selectedMemberData?.estado || '')
      .replace(/{cep}/g, selectedMemberData?.cep || '')
      .replace(/{dataBatismo}/g, selectedMemberData?.dataBatismo ? new Date(selectedMemberData.dataBatismo).toLocaleDateString('pt-BR') : '')
      .replace(/{igrejaBatismo}/g, selectedMemberData?.igrejaBatismo || '')
      .replace(/{estadoCivil}/g, selectedMemberData?.estadoCivil || '')
      .replace(/{observacoes}/g, selectedMemberData?.observacoes || '');
  };

  const printRecord = () => {
    window.print();
  };

  if (showConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Ficha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Template da Ficha</Label>
            <textarea
              id="template"
              value={config.template}
              onChange={(e) => setConfig({...config, template: e.target.value})}
              className="min-h-96 w-full p-3 border rounded-md font-mono text-sm"
              placeholder="Use as tags: {nomeCompleto}, {dataNascimento}, {funcaoMinisterial}, etc."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowConfig(false)} variant="outline">
              Voltar
            </Button>
            <Button onClick={() => {
              localStorage.setItem('member-record-config', JSON.stringify(config));
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
          <Button onClick={printRecord} className="church-gradient text-white">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Card className="print-card">
          <CardContent className="p-8">
            <div className="whitespace-pre-line text-sm leading-relaxed">
              {processTemplate(config.template)}
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
              <FileText className="h-5 w-5" />
              Fichas de Membros
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
      {viewMode === 'carousel' && <MemberRecordCarousel />}
      
      {/* Individual Mode */}
      {viewMode === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gerar Ficha Individual
            </CardTitle>
          </CardHeader>
      <CardContent className="space-y-6">
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

        {selectedMemberData && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Dados do Membro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Nome:</strong> {selectedMemberData.nomeCompleto}</div>
                <div><strong>Função:</strong> {selectedMemberData.funcaoMinisterial}</div>
                <div><strong>Telefone:</strong> {selectedMemberData.telefone}</div>
                <div><strong>Email:</strong> {selectedMemberData.email}</div>
                <div><strong>Cidade:</strong> {selectedMemberData.cidade}, {selectedMemberData.estado}</div>
                <div><strong>Data Batismo:</strong> {selectedMemberData.dataBatismo ? new Date(selectedMemberData.dataBatismo).toLocaleDateString('pt-BR') : ''}</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={generateRecord}
          disabled={!selectedMember}
          className="w-full church-gradient text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Gerar Ficha
        </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberRecord;
