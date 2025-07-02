import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Phone, MapPin, Briefcase, Trash2, X, Calendar, Mail, IdCard, Heart, Church } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Member } from '@/types/member';
import { Link } from 'react-router-dom';
import { useMemberContext } from '@/context/MemberContext';

interface MemberCarouselProps {
  members: Member[];
}

const MemberCarousel: React.FC<MemberCarouselProps> = ({ members }) => {
  const { deleteMember } = useMemberContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(members.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= members.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, members.length - itemsPerPage) : Math.max(0, prevIndex - itemsPerPage)
    );
  };

  const currentMembers = members.slice(currentIndex, currentIndex + itemsPerPage);

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          Nenhum membro encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
            onClick={nextSlide}
            disabled={currentIndex + itemsPerPage >= members.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-12">
        {currentMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              {/* Photo Section */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center cursor-pointer"
                   onClick={() => setSelectedMember(member)}>
                {member.foto ? (
                  <img
                    src={member.foto}
                    alt={member.nomeCompleto}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback para ícone se a imagem não carregar
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`${member.foto ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant={member.ativo ? "default" : "secondary"}>
                    {member.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>

              {/* Member Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {member.nomeCompleto}
                  </h3>
                  <Badge variant="outline" className="mt-1">
                    {member.funcaoMinisterial}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{member.telefone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{member.cidade}, {member.estado}</span>
                  </div>
                  
                  {member.profissao && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{member.profissao}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfLK72gpQMWE8AzuccdtxsFnvJmKTT05ic7nTC_K5kczJ_27Q/viewform?usp=sf_link', '_blank')}
                  >
                    Editar
                  </Button>
                  <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex-1"
                     onClick={() => {
                       const fichaUrl = member['Merged Doc URL - Cadastro de Membros'] || member.fichaUrl;
                       if (fichaUrl) {
                         window.open(fichaUrl, '_blank');
                       } else {
                         toast({
                           title: "Aviso",
                           description: "URL da ficha não encontrada para este membro",
                           variant: "destructive"
                         });
                       }
                     }}
                   >
                     Ficha
                   </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir o membro ${member.nomeCompleto}?`)) {
                        deleteMember(member.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsPerPage) === index
                  ? 'bg-primary'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
            />
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-blue-600">
                  Ficha de cadastro de Membros
                </DialogTitle>
                <div className="text-center text-lg font-semibold text-gray-700">
                  Setorial de Vitória
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header com foto e nome */}
                <div className="flex items-center gap-6 p-4 bg-blue-50 rounded-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedMember.foto ? (
                      <img
                        src={selectedMember.foto}
                        alt={selectedMember.nomeCompleto}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedMember.nomeCompleto}</h2>
                    <Badge variant="outline" className="mt-1">
                      {selectedMember.funcaoMinisterial}
                    </Badge>
                  </div>
                </div>

                {/* Informações Pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Dados Pessoais</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome:</strong> {selectedMember.nomeCompleto}</div>
                      <div><strong>Endereço:</strong> {selectedMember.endereco}, {selectedMember.numeroCasa}</div>
                      <div><strong>Bairro:</strong> {selectedMember.bairro}</div>
                      <div><strong>Cidade:</strong> {selectedMember.cidade}</div>
                      <div><strong>Estado:</strong> {selectedMember.estado}</div>
                      <div><strong>CEP:</strong> {selectedMember.cep}</div>
                      <div><strong>RG:</strong> {selectedMember.rg}</div>
                      <div><strong>CPF:</strong> {selectedMember.cpf}</div>
                      <div><strong>Data de Nascimento:</strong> {new Date(selectedMember.dataNascimento).toLocaleDateString('pt-BR')}</div>
                      <div><strong>Cidade de Nascimento:</strong> {selectedMember.cidadeNascimento}</div>
                      <div><strong>Estado Civil:</strong> {selectedMember.estadoCivil}</div>
                      <div><strong>Telefone:</strong> {selectedMember.telefone}</div>
                      <div><strong>Email:</strong> {selectedMember.email}</div>
                      <div><strong>Profissão:</strong> {selectedMember.profissao}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Dados Ministeriais</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Data de Batismo:</strong> {new Date(selectedMember.dataBatismo).toLocaleDateString('pt-BR')}</div>
                      <div><strong>Função Ministerial:</strong> {selectedMember.funcaoMinisterial}</div>
                      {selectedMember.dataOrdenacao && (
                        <div><strong>Data de Ordenação:</strong> {new Date(selectedMember.dataOrdenacao).toLocaleDateString('pt-BR')}</div>
                      )}
                      <div><strong>Igreja de Batismo:</strong> {selectedMember.igrejaBatismo}</div>
                      <div><strong>Status:</strong> 
                        <Badge variant={selectedMember.ativo ? "default" : "secondary"} className="ml-2">
                          {selectedMember.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {selectedMember.observacoes && (
                        <div><strong>Observações:</strong> {selectedMember.observacoes}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rodapé com endereço da igreja */}
                <div className="text-center text-sm text-gray-600 border-t pt-4">
                  Av Santo Antonio N° 366, Caratoira, Vitória Es
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberCarousel;