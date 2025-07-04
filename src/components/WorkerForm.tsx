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

const WorkerForm = () => {
  const { members } = useMemberContext();
  const { churches } = useChurchContext();
  
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [manualChurch, setManualChurch] = useState('');
  const [useManualChurch, setUseManualChurch] = useState(false);
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configurações da ficha
  const [config, setConfig] = useState({
    template: `IGREJA PENTECOSTAL DEUS É AMOR
    
FICHA DE OBREIRO

Nome Completo: {nomeCompleto}
Data de Nascimento: {dataNascimento}
Estado Civil: {estadoCivil}
RG: {rg}
CPF: {cpf}
Endereço: {endereco}
Bairro: {bairro}
Cidade: {cidade} - {estado}
CEP: {cep}
Telefone: {telefone}
E-mail: {email}

Dados Eclesiásticos:
Função Ministerial: {funcaoMinisterial}
Data de Batismo: {dataBatismo}
Igreja: {nomeIgreja}

Observações:
{observacoes}

Data: {dataEmissao}

_______________________________
Assinatura do Obreiro

_______________________________
Assinatura do Dirigente`,
    signature: ''
  });

  const selectedMemberData = members.find(m => m.id === selectedMember);
  const selectedChurchData = churches.find(c => c.id === selectedChurch);

  const generateForm = () => {
    if (!selectedMemberData) {
      alert('Por favor, selecione um obreiro.');
      return;
    }
    
    const churchName = useManualChurch ? manualChurch : selectedChurchData?.nomeIPDA;
    
    if (!churchName) {
      alert('Por favor, selecione ou digite o nome da igreja.');
      return;
    }
    
    setShowPreview(true);
  };

  const processTemplate = (template: string) => {
    const churchName = useManualChurch ? manualChurch : selectedChurchData?.nomeIPDA || '';
    
    return template
      .replace(/{nomeCompleto}/g, selectedMemberData?.nomeCompleto || '')
      .replace(/{dataNascimento}/g, selectedMemberData?.dataNascimento ? format(new Date(selectedMemberData.dataNascimento), "dd/MM/yyyy") : '')
      .replace(/{estadoCivil}/g, selectedMemberData?.estadoCivil || '')
      .replace(/{rg}/g, selectedMemberData?.rg || '')
      .replace(/{cpf}/g, selectedMemberData?.cpf || '')
      .replace(/{endereco}/g, `${selectedMemberData?.rua || ''}, ${selectedMemberData?.numero || ''}`)
      .replace(/{bairro}/g, selectedMemberData?.bairro || '')
      .replace(/{cidade}/g, selectedMemberData?.cidade || '')
      .replace(/{estado}/g, selectedMemberData?.estado || '')
      .replace(/{cep}/g, selectedMemberData?.cep || '')
      .replace(/{telefone}/g, selectedMemberData?.telefone || '')
      .replace(/{email}/g, selectedMemberData?.email || '')
      .replace(/{funcaoMinisterial}/g, selectedMemberData?.funcaoMinisterial || '')
      .replace(/{dataBatismo}/g, selectedMemberData?.dataBatismo ? format(new Date(selectedMemberData.dataBatismo), "dd/MM/yyyy") : '')
      .replace(/{nomeIgreja}/g, churchName)
      .replace(/{observacoes}/g, selectedMemberData?.observacoes || '')
      .replace(/{dataEmissao}/g, formDate ? format(new Date(formDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '');
  };

  const printForm = () => {
    window.print();
  };

  if (showConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Ficha de Obreiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Template da Ficha</Label>
            <Textarea
              id="template"
              value={config.template}
              onChange={(e) => setConfig({...config, template: e.target.value})}
              className="min-h-96 font-mono text-sm"
              placeholder="Use as tags: {nomeCompleto}, {dataNascimento}, {estadoCivil}, {rg}, {cpf}, {endereco}, {bairro}, {cidade}, {estado}, {cep}, {telefone}, {email}, {funcaoMinisterial}, {dataBatismo}, {nomeIgreja}, {observacoes}, {dataEmissao}"
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
                localStorage.setItem('worker-form-config', JSON.stringify(config));
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
            onClick={printForm}
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
          Ficha de Obreiros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="member">Obreiro(a) *</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o obreiro" />
              </SelectTrigger>
              <SelectContent>
                {members
                  .filter(member => [
                    'Obreiro', 'Diácono', 'Presbítero', 'Evangelista', 
                    'Pastor', 'Missionário', 'Cooperador', 'Dirigente'
                  ].includes(member.funcaoMinisterial))
                  .map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.nomeCompleto} - {member.funcaoMinisterial}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="form-date">Data da Emissão *</Label>
            <Input
              id="form-date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="church">Igreja *</Label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={useManualChurch}
                  onChange={(e) => setUseManualChurch(e.target.checked)}
                  className="mr-1"
                />
                Preenchimento manual
              </label>
            </div>
            
            {useManualChurch ? (
              <Input
                value={manualChurch}
                onChange={(e) => setManualChurch(e.target.value)}
                placeholder="Digite o nome da igreja"
              />
            ) : (
              <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a igreja" />
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
              <CardTitle className="text-lg">Dados do Obreiro</CardTitle>
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
          <h4 className="font-semibold mb-2">Informações:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Esta ficha contém os dados cadastrais do obreiro.</li>
            <li>Mantenha os dados sempre atualizados.</li>
            <li>A ficha deve ser assinada pelo obreiro e pelo dirigente.</li>
            <li>Uma cópia deve ser mantida nos arquivos da igreja.</li>
          </ul>
        </div>

        <Button
          onClick={generateForm}
          disabled={!selectedMember}
          className="w-full church-gradient text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Gerar Ficha de Obreiro
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkerForm;