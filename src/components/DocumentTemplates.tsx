
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CreditCard, UserCheck, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateConfig {
  fichas: string;
  carteirinhas: string;
  remanejamento: string;
}

const defaultTemplates: TemplateConfig = {
  fichas: `FICHA DE MEMBRO - IPDA

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

Observações: {observacoes}`,

  carteirinhas: `IGREJA PENTECOSTAL DEUS É AMOR
CARTEIRINHA DE MEMBRO

Nome: {nomeCompleto}
Função: {funcaoMinisterial}
RG: {rg}
CPF: {cpf}

Válida até: {dataValidade}

Esta carteirinha identifica o portador como membro ativo da IPDA.`,

  remanejamento: `CARTA DE REMANEJAMENTO - IPDA

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
};

const DocumentTemplates = () => {
  const [templates, setTemplates] = useState<TemplateConfig>(defaultTemplates);
  const [activeTab, setActiveTab] = useState('fichas');
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('document-templates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  }, []);

  const saveTemplates = () => {
    localStorage.setItem('document-templates', JSON.stringify(templates));
    toast({
      title: "Templates salvos",
      description: "Os templates foram salvos com sucesso.",
      variant: "default",
    });
  };

  const resetTemplate = (type: keyof TemplateConfig) => {
    setTemplates(prev => ({
      ...prev,
      [type]: defaultTemplates[type]
    }));
    toast({
      title: "Template restaurado",
      description: `O template de ${type} foi restaurado para o padrão.`,
      variant: "default",
    });
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'document-templates.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Templates exportados",
      description: "Os templates foram exportados com sucesso.",
      variant: "default",
    });
  };

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setTemplates(imported);
          toast({
            title: "Templates importados",
            description: "Os templates foram importados com sucesso.",
            variant: "default",
          });
        } catch (error) {
          toast({
            title: "Erro ao importar",
            description: "Erro ao importar os templates. Verifique o arquivo.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const templateTabs = [
    { 
      id: 'fichas', 
      label: 'Fichas de Membros', 
      icon: FileText,
      variables: '{nomeCompleto}, {dataNascimento}, {funcaoMinisterial}, {telefone}, {email}, {endereco}, {numeroCasa}, {bairro}, {cidade}, {estado}, {cep}, {dataBatismo}, {igrejaBatismo}, {estadoCivil}, {observacoes}'
    },
    { 
      id: 'carteirinhas', 
      label: 'Carteirinhas', 
      icon: CreditCard,
      variables: '{nomeCompleto}, {funcaoMinisterial}, {rg}, {cpf}, {dataValidade}'
    },
    { 
      id: 'remanejamento', 
      label: 'Remanejamento', 
      icon: UserCheck,
      variables: '{nomeIgrejaDestino}, {nomeMembro}, {nomeCompleto}, {funcaoMinisterial}, {dataBatismo}, {nomeIgrejaOrigem}, {dataRemanejamento}'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuração de Templates de Documentos
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportTemplates} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importTemplates}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {templateTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {templateTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Variáveis disponíveis:</h4>
                <p className="text-sm text-gray-600">{tab.variables}</p>
              </div>

              <div>
                <Label htmlFor={`template-${tab.id}`}>Template de {tab.label}</Label>
                <Textarea
                  id={`template-${tab.id}`}
                  value={templates[tab.id as keyof TemplateConfig]}
                  onChange={(e) => setTemplates(prev => ({
                    ...prev,
                    [tab.id]: e.target.value
                  }))}
                  className="min-h-96 font-mono text-sm mt-2"
                  placeholder={`Digite o template para ${tab.label.toLowerCase()}...`}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => resetTemplate(tab.id as keyof TemplateConfig)}
                  variant="outline"
                >
                  Restaurar Padrão
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button onClick={saveTemplates} className="w-full church-gradient text-white">
            Salvar Todas as Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentTemplates;
