
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useMemberContext } from '@/context/MemberContext';
import { useChurchContext } from '@/context/ChurchContext';
import { FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PreachingLetter = () => {
  const { members } = useMemberContext();
  const { churches } = useChurchContext();
  
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedOriginChurch, setSelectedOriginChurch] = useState('');
  const [selectedDestinationChurch, setSelectedDestinationChurch] = useState('');
  const [manualOriginChurch, setManualOriginChurch] = useState('');
  const [manualDestinationChurch, setManualDestinationChurch] = useState('');
  const [useManualOrigin, setUseManualOrigin] = useState(false);
  const [useManualDestination, setUseManualDestination] = useState(false);
  const [preachingDate, setPreachingDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configurações da carta
  const [config, setConfig] = useState({
    template: `IGREJA PENTECOSTAL DEUS É AMOR
    
CARTA DE RECOMENDAÇÃO PARA UM DIA

À IPDA: {nomeIgrejaDestino}

Paz do Senhor!

Recomendamos o(a) Irmão(ã) {nomePregador}, da nossa Congregação, para pregar na vossa IPDA no dia {dataPregacao}.

Função: {funcaoMinisterial}
Congregação de Origem: {nomeIgrejaOrigem}

Data: {dataEmissao}

Observações:
- É proibido tirar fotocópias desta carta. Somente será aceita a original.
- Deve-se assinalar a respectiva função do pregador(a).
- O pregador(a) levará duas cartas à congregação que está destinado a pregar: uma via branca e a outra amarela.
- As duas, em seus versos, deverão ser datadas, carimbadas com o endereço da IPDA e assinadas pelo dirigente.
- O pregador(a) terá de deixar a carta (via amarela) na IPDA a qual foi enviado e trazer a branca à sua congregação e entregá-la ao seu dirigente.
- Esta Carta só vale um dia, ou seja, nesta data.

_______________________________
Assinatura do Dirigente`,
    signature: ''
  });

  const selectedMemberData = members.find(m => m.id === selectedMember);
  const selectedOriginChurchData = churches.find(c => c.id === selectedOriginChurch);
  const selectedDestinationChurchData = churches.find(c => c.id === selectedDestinationChurch);

  const generateLetter = () => {
    if (!selectedMemberData || !preachingDate) {
      alert('Por favor, preencha os campos obrigatórios (pregador e data).');
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
      .replace(/{nomePregador}/g, selectedMemberData?.nomeCompleto || '')
      .replace(/{funcaoMinisterial}/g, selectedMemberData?.funcaoMinisterial || '')
      .replace(/{nomeIgrejaOrigem}/g, originChurchName)
      .replace(/{nomeIgrejaDestino}/g, destinationChurchName)
      .replace(/{dataPregacao}/g, preachingDate ? format(new Date(preachingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '')
      .replace(/{dataEmissao}/g, format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }));
  };

  const printLetter = () => {
    window.print();
  };

  if (showConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Carta de Pregação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Template da Carta</Label>
            <Textarea
              id="template"
              value={config.template}
              onChange={(e) => setConfig({...config, template: e.target.value})}
              className="min-h-96 font-mono text-sm"
              placeholder="Use as tags: {nomePregador}, {funcaoMinisterial}, {nomeIgrejaOrigem}, {nomeIgrejaDestino}, {dataPregacao}, {dataEmissao}"
            />
          </div>
          
          <div>
            <Label htmlFor="signature">Assinatura (opcional)</Label>
            <Input
              id="signature"
              value={config.signature}
              onChange={(e) => setConfig({...config, signature: e.target.value})}
              placeholder="Nome do dirigente para assinatura"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfig(false)}
              variant="outline"
            >
              Voltar
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('preaching-letter-config', JSON.stringify(config));
                setShowConfig(false);
              }}
            >
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
          <Button
            onClick={() => setShowPreview(false)}
            variant="outline"
          >
            Voltar
          </Button>
          <Button
            onClick={printLetter}
            className="church-gradient text-white"
          >
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
              
              {config.signature && (
                <div className="mt-8 text-center">
                  <div className="border-t border-gray-400 w-64 mx-auto mb-2"></div>
                  <p className="text-sm">{config.signature}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <style>
          {`
            @media print {
              .no-print {
                display: none;
              }
              .print-card {
                box-shadow: none;
                border: none;
              }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Cartas de Pregação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="member">Pregador(a) *</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o pregador" />
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
            <Label htmlFor="preaching-date">Data da Pregação *</Label>
            <Input
              id="preaching-date"
              type="date"
              value={preachingDate}
              onChange={(e) => setPreachingDate(e.target.value)}
            />
          </div>
        </div>

        <Separator />

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
              <CardTitle className="text-lg">Dados do Pregador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nome:</strong> {selectedMemberData.nomeCompleto}
                </div>
                <div>
                  <strong>Função:</strong> {selectedMemberData.funcaoMinisterial}
                </div>
                <div>
                  <strong>Cidade:</strong> {selectedMemberData.cidade}, {selectedMemberData.estado}
                </div>
                <div>
                  <strong>Telefone:</strong> {selectedMemberData.telefone}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Observações Importantes:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>É proibido tirar fotocópias desta carta. Somente será aceita a original.</li>
            <li>Deve-se assinalar a respectiva função do pregador(a).</li>
            <li>O pregador(a) levará duas cartas à congregação: uma via branca e outra amarela.</li>
            <li>As duas vias devem ser datadas, carimbadas e assinadas pelo dirigente.</li>
            <li>Esta carta só vale um dia, ou seja, na data especificada.</li>
          </ul>
        </div>

        <Button
          onClick={generateLetter}
          disabled={!selectedMember || !preachingDate}
          className="w-full church-gradient text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Gerar Carta de Pregação
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreachingLetter;
