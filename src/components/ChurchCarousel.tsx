import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Church, Phone, MapPin, Users, Trash2, Calendar, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Church as ChurchType } from '@/types/church';

import { useChurchContext } from '@/context/ChurchContext';

interface ChurchCarouselProps {
  churches: ChurchType[];
}

const ChurchCarousel: React.FC<ChurchCarouselProps> = ({ churches }) => {
  const { deleteChurch } = useChurchContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | null>(null);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(churches.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= churches.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, churches.length - itemsPerPage) : Math.max(0, prevIndex - itemsPerPage)
    );
  };

  const currentChurches = churches.slice(currentIndex, currentIndex + itemsPerPage);

  if (churches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          Nenhuma igreja encontrada
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
            disabled={currentIndex + itemsPerPage >= churches.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-12">
        {currentChurches.map((church) => (
          <Card key={church.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              {/* Photo Section */}
              <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center cursor-pointer"
                   onClick={() => setSelectedChurch(church)}>
                {church.foto ? (
                  <img
                    src={church.foto}
                    alt={church.nomeIPDA}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para ícone se a imagem não carregar
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`${church.foto ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  <Church className="h-16 w-16 text-gray-400" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant={church.classificacao === 'Local' ? "default" : "secondary"}>
                    {church.classificacao}
                  </Badge>
                </div>
              </div>

              {/* Church Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {church.nomeIPDA}
                  </h3>
                  <Badge variant="outline" className="mt-1">
                    {church.tipoIPDA}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{church.pastor?.telefone || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{church.endereco?.rua}, {church.endereco?.cidade}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{church.membrosAtuais} membros</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcAArZc2VDykV5UQs-r7Q0bkP6h1ApjbZ9XDRHRiEckT78Xg/viewform?usp=dialog', '_blank')}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir a igreja ${church.nomeIPDA}?`)) {
                        deleteChurch(church.id);
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

      {/* Church Details Modal */}
      <Dialog open={!!selectedChurch} onOpenChange={() => setSelectedChurch(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedChurch && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-green-600">
                  Ficha de cadastro de Igreja
                </DialogTitle>
                <div className="text-center text-lg font-semibold text-gray-700">
                  Setorial de Vitória
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header com foto e nome */}
                <div className="flex items-center gap-6 p-4 bg-green-50 rounded-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedChurch.foto ? (
                      <img
                        src={selectedChurch.foto}
                        alt={selectedChurch.nomeIPDA}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Church className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedChurch.nomeIPDA}</h2>
                    <Badge variant="outline" className="mt-1">
                      {selectedChurch.tipoIPDA}
                    </Badge>
                  </div>
                </div>

                {/* Informações da Igreja */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Dados da Igreja</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome IPDA:</strong> {selectedChurch.nomeIPDA}</div>
                      <div><strong>Tipo:</strong> {selectedChurch.tipoIPDA}</div>
                      <div><strong>Classificação:</strong> {selectedChurch.classificacao}</div>
                      <div><strong>Endereço:</strong> {selectedChurch.endereco?.rua}</div>
                      <div><strong>Bairro:</strong> {selectedChurch.endereco?.bairro}</div>
                      <div><strong>Cidade:</strong> {selectedChurch.endereco?.cidade}</div>
                      <div><strong>Estado:</strong> {selectedChurch.endereco?.estado}</div>
                      <div><strong>CEP:</strong> {selectedChurch.endereco?.cep}</div>
                      <div><strong>Membros Iniciais:</strong> {selectedChurch.membrosIniciais}</div>
                      <div><strong>Membros Atuais:</strong> {selectedChurch.membrosAtuais}</div>
                      <div><strong>Almas Batizadas:</strong> {selectedChurch.almasBatizadas}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Dados do Pastor</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome:</strong> {selectedChurch.pastor?.nomeCompleto}</div>
                      <div><strong>Telefone:</strong> {selectedChurch.pastor?.telefone}</div>
                      <div><strong>Email:</strong> {selectedChurch.pastor?.email}</div>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 mt-6">Escola Dominical</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Tem Escola:</strong> {selectedChurch.temEscola ? 'Sim' : 'Não'}</div>
                      {selectedChurch.temEscola && (
                        <>
                          <div><strong>Quantidade de Crianças:</strong> {selectedChurch.quantidadeCriancas}</div>
                          <div><strong>Dias de Funcionamento:</strong> {selectedChurch.diasFuncionamento}</div>
                        </>
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

export default ChurchCarousel;