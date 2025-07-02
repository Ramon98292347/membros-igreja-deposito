
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemberContext } from '@/context/MemberContext';
import { Printer, ArrowLeft } from 'lucide-react';

const MemberCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemberById, config } = useMemberContext();

  const member = id ? getMemberById(id) : null;

  if (!member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Membro não encontrado</h2>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho com botões (não imprime) */}
      <div className="no-print flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Carteirinha de Membro</h1>
          <p className="text-muted-foreground">Pré-visualização da carteirinha para impressão</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handlePrint} className="church-gradient text-white">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Carteirinha
          </Button>
        </div>
      </div>

      {/* Carteirinha */}
      <div className="flex justify-center">
        <div className="print-card bg-white border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg" style={{ width: '85.6mm', height: '53.98mm' }}>
          {/* Frente da Carteirinha */}
          <div className="h-full flex flex-col">
            {/* Cabeçalho */}
            <div className="church-gradient text-white p-2 text-center">
              <div className="flex items-center justify-center space-x-2">
                <img 
                  src="/lovable-uploads/5cab3472-2cff-4f24-861b-7a00213f6fa3.png" 
                  alt="Logo IPDA" 
                  className="h-6 w-6"
                />
                <div>
                  <h2 className="text-xs font-bold leading-tight">IGREJA PENTECOSTAL</h2>
                  <h2 className="text-xs font-bold leading-tight">DEUS É AMOR</h2>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 p-2">
              <div className="flex h-full">
                {/* Espaço para foto */}
                <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs text-gray-500 mr-3 flex-shrink-0">
                  FOTO
                </div>

                {/* Informações */}
                <div className="flex-1 text-xs space-y-1">
                  <div>
                    <strong>NOME:</strong>
                    <div className="border-b border-dotted border-gray-400 text-xs font-semibold">
                      {member.nomeCompleto.toUpperCase()}
                    </div>
                  </div>
                  
                  <div>
                    <strong>MATRÍCULA:</strong>
                    <div className="border-b border-dotted border-gray-400">
                      {member.id.padStart(6, '0')}
                    </div>
                  </div>
                  
                  <div>
                    <strong>GRUPO:</strong>
                    <div className="border-b border-dotted border-gray-400">
                      {member.funcaoMinisterial.toUpperCase()}
                    </div>
                  </div>
                  
                  <div>
                    <strong>D. NASC.:</strong>
                    <div className="border-b border-dotted border-gray-400">
                      {formatDate(member.dataNascimento)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="bg-gray-100 p-1 text-center">
              <p className="text-xs font-bold">IPDA ESTADUAL DE VITÓRIA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verso da Carteirinha */}
      <div className="flex justify-center">
        <div className="print-card bg-white border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg" style={{ width: '85.6mm', height: '53.98mm' }}>
          <div className="h-full flex flex-col">
            {/* Cabeçalho do Verso */}
            <div className="church-gradient text-white p-2 text-center">
              <h3 className="text-xs font-bold">IPDA ESTADUAL DE VITÓRIA</h3>
            </div>

            {/* Dados do Verso */}
            <div className="flex-1 p-2 text-xs space-y-1">
              <div>
                <strong>ENDEREÇO:</strong>
                <div className="border-b border-dotted border-gray-400">
                  {member.endereco}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <strong>NÚMERO:</strong>
                  <div className="border-b border-dotted border-gray-400">
                    {member.numeroCasa}
                  </div>
                </div>
                <div className="flex-1">
                  <strong>BAIRRO:</strong>
                  <div className="border-b border-dotted border-gray-400">
                    {member.bairro}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <strong>CIDADE:</strong>
                  <div className="border-b border-dotted border-gray-400">
                    {member.cidade}
                  </div>
                </div>
                <div className="flex-1">
                  <strong>ESTADO:</strong>
                  <div className="border-b border-dotted border-gray-400">
                    {member.estado}
                  </div>
                </div>
              </div>
              
              <div>
                <strong>ESTADO CIVIL:</strong>
                <div className="border-b border-dotted border-gray-400">
                  {member.estadoCivil}
                </div>
              </div>
              
              <div>
                <strong>DATA BATISMO:</strong>
                <div className="border-b border-dotted border-gray-400">
                  {formatDate(member.dataBatismo)}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <strong>CPF:</strong>
                  <div className="border-b border-dotted border-gray-400">
                    {member.cpf}
                  </div>
                </div>
                <div className="flex-1">
                  <strong>RG:</strong>
                  <div className="border-b border-dotted border-gray-400">
                    {member.rg}
                  </div>
                </div>
              </div>
              
              <div>
                <strong>TELEFONE:</strong>
                <div className="border-b border-dotted border-gray-400">
                  {member.telefone}
                </div>
              </div>
            </div>

            {/* Assinatura */}
            <div className="p-2 text-center">
              <div className="border-b border-black w-full mb-1"></div>
              <p className="text-xs font-bold">ASSINATURA DO PASTOR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções de impressão */}
      <div className="no-print text-center text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
        <p className="font-semibold mb-2">Instruções para impressão:</p>
        <ul className="space-y-1">
          <li>• Configure a impressora para papel A4</li>
          <li>• Certifique-se de que as margens estão configuradas corretamente</li>
          <li>• A carteirinha tem dimensões padrão: 85,6mm x 53,98mm</li>
          <li>• Recomenda-se usar papel cartão ou papel fotográfico para melhor qualidade</li>
        </ul>
      </div>
    </div>
  );
};

export default MemberCard;
