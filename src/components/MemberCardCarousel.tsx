import React from 'react';
import { CreditCard, User, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/member';
import { useMemberContext } from '@/context/MemberContext';

const MemberCardCarousel: React.FC = () => {
  const { members } = useMemberContext();
  
  // Debug: verificar dados das carteirinhas
  console.log('🆔 Total de membros no contexto (carteirinhas):', members.length);
  console.log('📋 Primeiros 3 membros (carteirinhas):', members.slice(0, 3));
  
  // Filtrar apenas membros que têm dados de carteirinha
  const membersWithCards = members.filter(member => {
    const hasCarteirinha = member.dadosCarteirinha && member.dadosCarteirinha.trim() !== '';
    if (hasCarteirinha) {
      console.log('✅ Membro com carteirinha:', member.nomeCompleto, '- Link:', member.dadosCarteirinha);
    }
    return hasCarteirinha;
  });
  
  console.log('🆔 Membros com carteirinhas encontrados:', membersWithCards.length);
  
  if (membersWithCards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma carteirinha disponível</h3>
          <p className="text-muted-foreground">
            Não há membros com dados de carteirinhas cadastrados no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const openCarteirinha = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Carteirinhas de Membros
        </h2>
        <Badge variant="outline">
          {membersWithCards.length} carteirinhas
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membersWithCards.map((member, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {member.foto ? (
                      <img 
                        src={member.foto} 
                        alt={member.nomeCompleto}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{member.nomeCompleto}</h3>
                    <p className="text-sm opacity-90">{member.funcaoMinisterial}</p>
                  </div>
                </div>
                <Button
                  onClick={() => openCarteirinha(member.dadosCarteirinha!)}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Carteirinha
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-sm">{member.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{member.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                    <p className="text-sm">{member.cidade}, {member.estado}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={member.ativo ? "default" : "secondary"}>
                      {member.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MemberCardCarousel;