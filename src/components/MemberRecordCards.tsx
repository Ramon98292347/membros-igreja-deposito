import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMemberContext } from '@/context/MemberContext';
import { FileText, Search, ExternalLink, User, Phone, MapPin } from 'lucide-react';
import { Member } from '@/types/member';

const MemberRecordCards = () => {
  const { members } = useMemberContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debug: verificar dados dos membros
  console.log('🔍 Total de membros no contexto:', members.length);
  console.log('📋 Primeiros 3 membros:', members.slice(0, 3));
  
  // Filtrar apenas membros que têm link de ficha
  const membersWithRecords = members.filter(member => {
    const hasLink = member.linkFicha && member.linkFicha.trim() !== '';
    if (hasLink) {
      console.log('✅ Membro com ficha:', member.nomeCompleto, '- Link:', member.linkFicha);
    }
    return hasLink;
  });
  
  console.log('📄 Membros com fichas encontrados:', membersWithRecords.length);
  
  // Aplicar filtro de busca
  const filteredMembers = membersWithRecords.filter(member =>
    member.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.funcaoMinisterial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openRecord = (url: string) => {
    // Converter URL do Google Drive para visualização direta se necessário
    let viewUrl = url;
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileId) {
        viewUrl = `https://drive.google.com/file/d/${fileId[1]}/preview`;
      }
    }
    window.open(viewUrl, '_blank');
  };

  const MemberRecordCard = ({ member }: { member: Member }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {member.foto ? (
              <img 
                src={member.foto} 
                alt={member.nomeCompleto}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ${member.foto ? 'hidden' : ''}`}>
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {member.nomeCompleto}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {member.funcaoMinisterial}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => openRecord(member.linkFicha)}
            size="sm"
            className="church-gradient text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Ficha
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          {member.telefone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{member.telefone}</span>
            </div>
          )}
          
          {(member.cidade || member.estado) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {[member.cidade, member.estado].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          
          {member.dataNascimento && (
            <div className="text-xs text-gray-500">
              Nascimento: {new Date(member.dataNascimento).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openRecord(member.linkFicha)}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Ficha Completa
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fichas de Membros ({filteredMembers.length})
            </CardTitle>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, função ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Grid de cards */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {membersWithRecords.length === 0 
                ? 'Nenhuma ficha encontrada' 
                : 'Nenhum resultado encontrado'
              }
            </h3>
            <p className="text-gray-500">
              {membersWithRecords.length === 0 
                ? 'Não há membros com fichas cadastradas no momento.'
                : 'Tente ajustar os termos de busca.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberRecordCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberRecordCards;