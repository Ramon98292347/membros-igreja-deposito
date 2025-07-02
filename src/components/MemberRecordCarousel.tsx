import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, ExternalLink, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/member';
import { useMemberContext } from '@/context/MemberContext';

const MemberRecordCarousel: React.FC = () => {
  const { members } = useMemberContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filtrar apenas membros que têm link de ficha
  const membersWithRecords = members.filter(member => member.linkFicha && member.linkFicha.trim() !== '');
  
  if (membersWithRecords.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma ficha disponível</h3>
          <p className="text-muted-foreground">
            Não há membros com links de fichas cadastrados no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === membersWithRecords.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? membersWithRecords.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentMember = membersWithRecords[currentIndex];

  const openRecord = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Fichas de Membros
        </h2>
        <Badge variant="outline">
          {currentIndex + 1} de {membersWithRecords.length}
        </Badge>
      </div>

      <div className="relative">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {currentMember.foto ? (
                    <img 
                      src={currentMember.foto} 
                      alt={currentMember.nomeCompleto}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentMember.nomeCompleto}</h3>
                  <p className="text-sm opacity-90">{currentMember.funcaoMinisterial}</p>
                </div>
              </div>
              <Button
                onClick={() => openRecord(currentMember.linkFicha!)}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Ficha
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{currentMember.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{currentMember.email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                  <p className="text-sm">{currentMember.cidade}, {currentMember.estado}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Batismo</label>
                  <p className="text-sm">
                    {currentMember.dataBatismo ? 
                      new Date(currentMember.dataBatismo).toLocaleDateString('pt-BR') : 
                      'Não informado'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Igreja do Batismo</label>
                  <p className="text-sm">{currentMember.igrejaBatismo || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={currentMember.ativo ? "default" : "secondary"}>
                    {currentMember.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <label className="text-sm font-medium text-muted-foreground">Link da Ficha</label>
              <p className="text-sm break-all">{currentMember.linkFicha}</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {membersWithRecords.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {membersWithRecords.length > 1 && (
        <div className="flex justify-center space-x-2">
          {membersWithRecords.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberRecordCarousel;