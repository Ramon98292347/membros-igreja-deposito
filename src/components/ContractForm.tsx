import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useChurchContext } from '@/context/ChurchContext';
import { FileText, Printer, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ContractForm = () => {
  const { churches } = useChurchContext();
  
  const [selectedChurch, setSelectedChurch] = useState('');
  const [manualChurch, setManualChurch] = useState('');
  const [useManualChurch, setUseManualChurch] = useState(false);
  const [contractType, setContractType] = useState('aluguel');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [contractDetails, setContractDetails] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configurações do contrato
  const [config, setConfig] = useState({
    templates: {
      aluguel: `CONTRATO DE LOCAÇÃO DE IMÓVEL

Pelo presente instrumento particular de locação de imóvel, de um lado a IGREJA PENTECOSTAL DEUS É AMOR, {nomeIgreja}, inscrita no CNPJ sob o nº XX.XXX.XXX/XXXX-XX, com sede na {enderecoIgreja}, {bairroIgreja}, {cidadeIgreja} - {estadoIgreja}, CEP {cepIgreja}, neste ato representada por seu Dirigente, doravante denominada LOCATÁRIA, e de outro lado, o PROPRIETÁRIO DO IMÓVEL, doravante denominado LOCADOR, têm entre si justo e contratado o seguinte:

1. OBJETO DO CONTRATO
O LOCADOR dá em locação à LOCATÁRIA o imóvel situado na {enderecoIgreja}, {bairroIgreja}, {cidadeIgreja} - {estadoIgreja}, CEP {cepIgreja}, para fins não residenciais, especificamente para uso como templo religioso.

2. PRAZO
O prazo da locação é de 12 (doze) meses, iniciando-se em {dataInicio} e terminando em {dataFim}, podendo ser prorrogado por igual período mediante acordo entre as partes.

3. VALOR E FORMA DE PAGAMENTO
O valor mensal da locação é de R$ {valorContrato},00 (valor por extenso), a ser pago até o dia {diaPagamento} de cada mês, mediante depósito bancário ou transferência para conta a ser indicada pelo LOCADOR.

4. OBRIGAÇÕES DA LOCATÁRIA
a) Pagar pontualmente o aluguel;
b) Utilizar o imóvel para o fim estabelecido;
c) Manter o imóvel em boas condições de limpeza e conservação;
d) Não fazer modificações ou benfeitorias sem autorização prévia e por escrito do LOCADOR;
e) Restituir o imóvel, ao final da locação, nas mesmas condições em que o recebeu.

5. OBRIGAÇÕES DO LOCADOR
a) Garantir o uso pacífico do imóvel locado;
b) Manter a forma e destino do imóvel;
c) Responder pelos vícios ou defeitos anteriores à locação;
d) Realizar os reparos necessários à estrutura do imóvel.

6. DISPOSIÇÕES GERAIS
{detalhesContrato}

E por estarem assim justos e contratados, assinam o presente em duas vias de igual teor e forma, na presença de duas testemunhas.

{cidadeIgreja}, {dataAtual}

_______________________________
LOCATÁRIA - IGREJA PENTECOSTAL DEUS É AMOR

_______________________________
LOCADOR

Testemunhas:

1. _______________________________
Nome:
CPF:

2. _______________________________
Nome:
CPF:`,
      
      servico: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Pelo presente instrumento particular de prestação de serviços, de um lado a IGREJA PENTECOSTAL DEUS É AMOR, {nomeIgreja}, inscrita no CNPJ sob o nº XX.XXX.XXX/XXXX-XX, com sede na {enderecoIgreja}, {bairroIgreja}, {cidadeIgreja} - {estadoIgreja}, CEP {cepIgreja}, neste ato representada por seu Dirigente, doravante denominada CONTRATANTE, e de outro lado, o PRESTADOR DE SERVIÇOS, doravante denominado CONTRATADO, têm entre si justo e contratado o seguinte:

1. OBJETO DO CONTRATO
O presente contrato tem como objeto a prestação de serviços de manutenção, limpeza, segurança ou outros serviços necessários para o funcionamento da igreja.

2. PRAZO
O prazo para a prestação dos serviços é de {dataInicio} a {dataFim}, podendo ser prorrogado mediante acordo entre as partes.

3. VALOR E FORMA DE PAGAMENTO
Pela prestação dos serviços, a CONTRATANTE pagará ao CONTRATADO o valor de R$ {valorContrato},00 (valor por extenso), a ser pago até o dia {diaPagamento} de cada mês, mediante depósito bancário ou transferência para conta a ser indicada pelo CONTRATADO.

4. OBRIGAÇÕES DO CONTRATADO
a) Prestar os serviços conforme especificado neste contrato;
b) Responsabilizar-se por todos os encargos trabalhistas, previdenciários e fiscais decorrentes da execução deste contrato;
c) Manter sigilo sobre as informações que tiver acesso em virtude da prestação dos serviços;
d) Executar os serviços com zelo e diligência.

5. OBRIGAÇÕES DA CONTRATANTE
a) Pagar pontualmente o valor acordado;
b) Fornecer todas as informações necessárias para a execução dos serviços;
c) Disponibilizar acesso às instalações quando necessário para a execução dos serviços.

6. DISPOSIÇÕES GERAIS
{detalhesContrato}

E por estarem assim justos e contratados, assinam o presente em duas vias de igual teor e forma, na presença de duas testemunhas.

{cidadeIgreja}, {dataAtual}

_______________________________
CONTRATANTE - IGREJA PENTECOSTAL DEUS É AMOR

_______________________________
CONTRATADO

Testemunhas:

1. _______________________________
Nome:
CPF:

2. _______________________________
Nome:
CPF:`,
      
      outro: `CONTRATO GERAL

Pelo presente instrumento particular de contrato, de um lado a IGREJA PENTECOSTAL DEUS É AMOR, {nomeIgreja}, inscrita no CNPJ sob o nº XX.XXX.XXX/XXXX-XX, com sede na {enderecoIgreja}, {bairroIgreja}, {cidadeIgreja} - {estadoIgreja}, CEP {cepIgreja}, neste ato representada por seu Dirigente, doravante denominada IGREJA, e de outro lado, doravante denominado CONTRAPARTE, têm entre si justo e contratado o seguinte:

1. OBJETO DO CONTRATO
O presente contrato tem como objeto [descrever o objeto do contrato].

2. PRAZO
O prazo deste contrato é de {dataInicio} a {dataFim}, podendo ser prorrogado mediante acordo entre as partes.

3. VALOR E FORMA DE PAGAMENTO
O valor deste contrato é de R$ {valorContrato},00 (valor por extenso), a ser pago até o dia {diaPagamento} de cada mês, mediante depósito bancário ou transferência para conta a ser indicada pela parte recebedora.

4. OBRIGAÇÕES DAS PARTES
a) [Descrever as obrigações da igreja];
b) [Descrever as obrigações da contraparte];

5. DISPOSIÇÕES GERAIS
{detalhesContrato}

E por estarem assim justos e contratados, assinam o presente em duas vias de igual teor e forma, na presença de duas testemunhas.

{cidadeIgreja}, {dataAtual}

_______________________________
IGREJA PENTECOSTAL DEUS É AMOR

_______________________________
CONTRAPARTE

Testemunhas:

1. _______________________________
Nome:
CPF:

2. _______________________________
Nome:
CPF:`
    }
  });

  const selectedChurchData = churches.find(c => c.id === selectedChurch);

  const generateContract = () => {
    if (!startDate) {
      alert('Por favor, preencha a data de início.');
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
    const churchAddress = selectedChurchData ? `${selectedChurchData.endereco.rua}, ${selectedChurchData.endereco.numero}` : '';
    const churchNeighborhood = selectedChurchData?.endereco.bairro || '';
    const churchCity = selectedChurchData?.endereco.cidade || '';
    const churchState = selectedChurchData?.endereco.estado || '';
    const churchZip = selectedChurchData?.endereco.cep || '';
    
    // Calcular data de fim se não estiver definida
    const calculatedEndDate = endDate || (
      startDate ? 
        format(new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1)), 'yyyy-MM-dd') : 
        ''
    );
    
    return template
      .replace(/{nomeIgreja}/g, churchName)
      .replace(/{enderecoIgreja}/g, churchAddress)
      .replace(/{bairroIgreja}/g, churchNeighborhood)
      .replace(/{cidadeIgreja}/g, churchCity)
      .replace(/{estadoIgreja}/g, churchState)
      .replace(/{cepIgreja}/g, churchZip)
      .replace(/{dataInicio}/g, startDate ? format(new Date(startDate), "dd/MM/yyyy") : '')
      .replace(/{dataFim}/g, calculatedEndDate ? format(new Date(calculatedEndDate), "dd/MM/yyyy") : '')
      .replace(/{valorContrato}/g, contractValue)
      .replace(/{diaPagamento}/g, paymentDay)
      .replace(/{detalhesContrato}/g, contractDetails)
      .replace(/{dataAtual}/g, format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }));
  };

  const printContract = () => {
    window.print();
  };

  if (showConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-aluguel">Template de Contrato de Aluguel</Label>
            <Textarea
              id="template-aluguel"
              value={config.templates.aluguel}
              onChange={(e) => setConfig({
                ...config, 
                templates: {
                  ...config.templates,
                  aluguel: e.target.value
                }
              })}
              className="min-h-64 font-mono text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="template-servico">Template de Contrato de Serviço</Label>
            <Textarea
              id="template-servico"
              value={config.templates.servico}
              onChange={(e) => setConfig({
                ...config, 
                templates: {
                  ...config.templates,
                  servico: e.target.value
                }
              })}
              className="min-h-64 font-mono text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="template-outro">Template de Contrato Geral</Label>
            <Textarea
              id="template-outro"
              value={config.templates.outro}
              onChange={(e) => setConfig({
                ...config, 
                templates: {
                  ...config.templates,
                  outro: e.target.value
                }
              })}
              className="min-h-64 font-mono text-sm"
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
                localStorage.setItem('contract-form-config', JSON.stringify(config));
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
            onClick={printContract}
            className="church-gradient text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Card className="print-card">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {processTemplate(config.templates[contractType as keyof typeof config.templates])}
              </div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contratos
          </CardTitle>
          <Button
            onClick={() => setShowConfig(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar Templates
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="contract-type">Tipo de Contrato *</Label>
          <Select value={contractType} onValueChange={setContractType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluguel">Contrato de Aluguel</SelectItem>
              <SelectItem value="servico">Contrato de Prestação de Serviços</SelectItem>
              <SelectItem value="outro">Outro Tipo de Contrato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="contract-value">Valor do Contrato (R$) *</Label>
            <Input
              id="contract-value"
              type="text"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              placeholder="Ex: 1000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="start-date">Data de Início *</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="end-date">Data de Término</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Se não preenchido, será 1 ano após a data de início"
            />
          </div>

          <div>
            <Label htmlFor="payment-day">Dia de Pagamento *</Label>
            <Input
              id="payment-day"
              type="text"
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              placeholder="Ex: 5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="contract-details">Detalhes Adicionais do Contrato</Label>
          <Textarea
            id="contract-details"
            value={contractDetails}
            onChange={(e) => setContractDetails(e.target.value)}
            placeholder="Insira cláusulas adicionais ou detalhes específicos do contrato"
            className="min-h-32"
          />
        </div>

        {selectedChurchData && !useManualChurch && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Dados da Igreja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nome:</strong> {selectedChurchData.nomeIPDA}
                </div>
                <div>
                  <strong>Endereço:</strong> {selectedChurchData.endereco.rua}, {selectedChurchData.endereco.numero}
                </div>
                <div>
                  <strong>Bairro:</strong> {selectedChurchData.endereco.bairro}
                </div>
                <div>
                  <strong>Cidade/UF:</strong> {selectedChurchData.endereco.cidade}, {selectedChurchData.endereco.estado}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Informações Importantes:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Este é um modelo de contrato e pode precisar de adaptações conforme a situação específica.</li>
            <li>Recomenda-se a revisão por um profissional jurídico antes da assinatura.</li>
            <li>Todos os contratos devem ser assinados em duas vias de igual teor.</li>
            <li>Mantenha uma cópia do contrato nos arquivos da igreja.</li>
          </ul>
        </div>

        <Button
          onClick={generateContract}
          disabled={!startDate || !contractValue || !paymentDay || (!selectedChurch && !manualChurch)}
          className="w-full church-gradient text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Gerar Contrato
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContractForm;