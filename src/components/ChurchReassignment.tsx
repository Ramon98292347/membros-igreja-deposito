
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMemberContext } from '@/context/MemberContext';
import { useChurchContext } from '@/context/ChurchContext';
import { UserCheck, Printer, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChurchReassignment = () => {
  const { members } = useMemberContext();
  const { churches } = useChurchContext();
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedOriginChurch, setSelectedOriginChurch] = useState('');
  const [selectedDestinationChurch, setSelectedDestinationChurch] = useState('');
  const [manualOriginChurch, setManualOriginChurch] = useState('');
  const [manualDestinationChurch, setManualDestinationChurch] = useState('');
  const [useManualOrigin, setUseManualOrigin] = useState(false);
  const [useManualDestination, setUseManualDestination] = useState(false);
  const [reassignmentDate, setReassignmentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  const [config, setConfig] = useState({
    template: `CARTA DE REMANEJAMENTO - IPDA

À IPDA: {nomeIgrejaDestino}

Paz do Senhor!

Remanejamos o(a) Irmão(ã) {nomeMembro} para a vossa congregação.

Dados do Membro:
Nome: {nomeCompleto}
Função: {funcaoMinisterial}
Data de Batismo: {dataBatismo}
Igreja de Origem: {nomeIgrejaOrigem}

O(a) referido(a) irmão(ã) encontra-se em plena comunhão conosco.

Data: {dataRemanejamento}

_______________________________
Assinatura do Dirigente`
  });

  const selectedMemberData = members.find(m => m.id === selectedMember);
  const selectedOriginChurchData = churches.find(c => c.id === selectedOriginChurch);
  const selectedDestinationChurchData = churches.find(c => c.id === selectedDestinationChurch);

  const generateReassignment = () => {
    if (!selectedMemberData || !reassignmentDate) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    const originChurchName = useManualOrigin ? manualOriginChurch : selectedOriginChurchData?.nomeIPDA;
    const destinationChurchName = useManualDestination ? manualDestinationChurch : selectedDestinationChurchData?.nomeIPDA;
    
    if (!originChurchName || !destinationChurchName) {
      alert('Por favor, selecione ou digite os nomes das igrejas de origem e destino.');
      return;
    }
    
    setShowPreview(true);
  };

  const processTemplate = (template: string) => {
    const originChurchName = useManualOrigin ? manualOriginChurch : selectedOriginChurchData?.nomeIPDA || '';
    const destinationChurchName = useManualDestination ? manualDestinationChurch : selectedDestinationChurchData?.nomeIPDA || '';
    
    return template
      .replace(/{nomeMembro}/g, selectedMemberData?.nomeCompleto || '')
      .replace(/{nomeCompleto}/g, selectedMemberData?.nomeCompleto || '')
      .replace(/{funcaoMinisterial}/g, selectedMemberData?.funcaoMinisterial || '')
      .replace(/{dataBatismo}/g, selectedMemberData?.dataBatismo ? new Date(selectedMemberData.dataBatismo).toLocaleDateString('pt-BR') : '')
      .replace(/{nomeIgrejaOrigem}/g, originChurchName)
      .replace(/{nomeIgrejaDestino}/g, destinationChurchName)
      .replace(/{dataRemanejamento}/g, reassignmentDate ? format(new Date(reassignmentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '');
  };

  const printReassignment = () => {
    window.print();
  };

  if (showConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Remanejamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Template do Remanejamento</Label>
            <textarea
              id="template"
              value={config.template}
              onChange={(e) => setConfig({...config, template: e.target.value})}
              className="min-h-96 w-full p-3 border rounded-md font-mono text-sm"
              placeholder="Use as tags: {nomeMembro}, {nomeCompleto}, {funcaoMinisterial}, {dataBatismo}, {nomeIgrejaOrigem}, {nomeIgrejaDestino}, {dataRemanejamento}"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowConfig(false)} variant="outline">
              Voltar
            </Button>
            <Button onClick={() => {
              localStorage.setItem('church-reassignment-config', JSON.stringify(config));
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
          <Button onClick={printReassignment} className="church-gradient text-white">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Card className="print-card">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Remanejamento de Membros
          </CardTitle>
          <Button onClick={() => setShowConfig(true)} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="member">Membro *</Label>
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
            <Label htmlFor="reassignment-date">Data do Remanejamento *</Label>
            <Input
              id="reassignment-date"
              type="date"
              value={reassignmentDate}
              onChange={(e) => setReassignmentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="origin-church">Igreja de Origem *</Label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={useManualOrigin}
                  onChange={(e) => setUseManualOrigin(e.target.checked)}
                  className="mr-1"
                />
                Preenchimento manual
              </label>
            </div>
            
            {useManualOrigin ? (
              <Input
                value={manualOriginChurch}
                onChange={(e) => setManualOriginChurch(e.target.value)}
                placeholder="Digite o nome da igreja de origem"
              />
            ) : (
              <Select value={selectedOriginChurch} onValueChange={setSelectedOriginChurch}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a igreja de origem" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.nomeIPDA} - {church.endereco.cidade}, {church.endereco.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="destination-church">Igreja de Destino *</Label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={useManualDestination}
                  onChange={(e) => setUseManualDestination(e.target.checked)}
                  className="mr-1"
                />
                Preenchimento manual
              </label>
            </div>
            
            {useManualDestination ? (
              <Input
                value={manualDestinationChurch}
                onChange={(e) => setManualDestinationChurch(e.target.value)}
                placeholder="Digite o nome da igreja de destino"
              />
            ) : (
              <Select value={selectedDestinationChurch} onValueChange={setSelectedDestinationChurch}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a igreja de destino" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.nomeIPDA} - {church.endereco.cidade}, {church.endereco.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                <div><strong>Cidade:</strong> {selectedMemberData.cidade}, {selectedMemberData.estado}</div>
                <div><strong>Telefone:</strong> {selectedMemberData.telefone}</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={generateReassignment}
          disabled={!selectedMember || !reassignmentDate}
          className="w-full church-gradient text-white"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Gerar Carta de Remanejamento
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChurchReassignment;
