
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMemberContext } from '@/context/MemberContext';
import { Printer, ArrowLeft } from 'lucide-react';

const MemberRecord = () => {
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho com botões (não imprime) */}
      <div className="no-print flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ficha de Membro</h1>
          <p className="text-muted-foreground">Visualização completa dos dados</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handlePrint} className="church-gradient text-white">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Ficha
          </Button>
        </div>
      </div>

      {/* Ficha para impressão */}
      <div className="print:shadow-none">
        <Card className="print:border-2 print:border-black">
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <img 
                src="/lovable-uploads/5cab3472-2cff-4f24-861b-7a00213f6fa3.png" 
                alt="Igreja Pentecostal Deus é Amor" 
                className="h-16 w-16"
              />
              <div>
                <CardTitle className="text-2xl gradient-text print:text-black">
                  {config.nomeIgreja}
                </CardTitle>
                <p className="text-lg font-semibold">Ficha de Cadastro de Membros</p>
                <p className="text-sm text-muted-foreground print:text-black">
                  Setorial de Vitória
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b church-gradient-light text-white px-3 py-1 print:bg-gray-200 print:text-black">
                DADOS PESSOAIS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2">
                  <div className="flex">
                    <span className="font-semibold w-32">Nome Completo:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.nomeCompleto}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-24">Endereço:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.endereco}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-24">Número:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.numeroCasa}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">Bairro:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.bairro}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">Cidade:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.cidade}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">Estado:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.estado}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">CEP:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.cep}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">RG:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.rg}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">CPF:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.cpf}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-32">Data de Nascimento:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {formatDate(member.dataNascimento)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">Idade:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.idade} anos
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-32">Cidade de Nascimento:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.cidadeNascimento}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-32">Estado de Nascimento:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.estadoCidadeNascimento}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-24">Estado Civil:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.estadoCivil}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">Email:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.email}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-24">Profissão:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.profissao}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-20">Telefone:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.telefone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dados Ministeriais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b church-gradient-light text-white px-3 py-1 print:bg-gray-200 print:text-black">
                DADOS MINISTERIAIS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex">
                    <span className="font-semibold w-32">Data de Batismo:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {formatDate(member.dataBatismo)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex">
                    <span className="font-semibold w-32">Data da Ordenação:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {formatDate(member.dataOrdenacao || '')}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex">
                    <span className="font-semibold w-32">Função Ministerial:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1 pl-2">
                      {member.funcaoMinisterial}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assinatura */}
            <div className="pt-12 text-center space-y-8">
              <div>
                <div className="border-b border-black w-64 mx-auto mb-2"></div>
                <p className="text-sm font-semibold">ASSINATURA DO MEMBRO</p>
              </div>
              
              <div>
                <div className="border-b border-black w-64 mx-auto mb-2"></div>
                <p className="text-sm font-semibold">ASSINATURA DO PASTOR</p>
              </div>
            </div>

            {/* Data de emissão */}
            <div className="text-right text-sm pt-4">
              <p>Vitória, {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberRecord;
