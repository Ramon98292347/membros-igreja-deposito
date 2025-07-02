import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { useMember, useCreateMember, useUpdateMember } from '@/hooks/useMembers';
import { memberSchema, MemberFormData } from '@/schemas/memberSchema';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { applyCpfMask, applyCepMask, applyPhoneMask } from '@/lib/masks';

const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { data: member, isLoading: memberLoading } = useMember(id || '');
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      telefone: '',
      email: '',
      endereco: '',
      bairro: '',
      cidade: '',
      cep: '',
      estadoCivil: 'Solteiro(a)',
      profissao: '',
      escolaridade: 'Médio Completo',
      batizado: 'Não',
      dataBatismo: '',
      igreja: '',
      cargo: '',
      observacoes: '',
      ativo: true
    }
  });
  
  // Carregar dados do membro para edição
  useEffect(() => {
    if (isEditing && member) {
      reset({
        nome: member.nome || '',
        cpf: member.cpf || '',
        rg: member.rg || '',
        dataNascimento: member.dataNascimento || '',
        telefone: member.telefone || '',
        email: member.email || '',
        endereco: member.endereco || '',
        bairro: member.bairro || '',
        cidade: member.cidade || '',
        cep: member.cep || '',
        estadoCivil: member.estadoCivil || 'Solteiro(a)',
        profissao: member.profissao || '',
        escolaridade: member.escolaridade || 'Médio Completo',
        batizado: member.batizado || 'Não',
        dataBatismo: member.dataBatismo || '',
        igreja: member.igreja || '',
        cargo: member.cargo || '',
        observacoes: member.observacoes || '',
        ativo: member.ativo ?? true
      });
    }
  }, [member, isEditing, reset]);
  
  const onSubmit = async (data: MemberFormData) => {
    try {
      if (isEditing && id) {
        await updateMember.mutateAsync({ id, data });
        toast({
          title: 'Sucesso',
          description: 'Membro atualizado com sucesso!'
        });
      } else {
        await createMember.mutateAsync(data);
        toast({
          title: 'Sucesso',
          description: 'Membro criado com sucesso!'
        });
      }
      navigate('/membros');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar membro. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCpfMask(e.target.value);
    setValue('cpf', masked);
  };
  
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCepMask(e.target.value);
    setValue('cep', masked);
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setValue('telefone', masked);
  };
  
  if (memberLoading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados do membro...</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }
  
  return (
    <ResponsiveContainer size="lg" className="py-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
              {isEditing ? 'Editar Membro' : 'Cadastrar Novo Membro'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualize as informações do membro' : 'Preencha os dados do novo membro'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/membros')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    {...register('nome')}
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500">{errors.nome.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    {...register('cpf')}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? 'border-red-500' : ''}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-red-500">{errors.cpf.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rg">RG *</Label>
                  <Input
                    id="rg"
                    {...register('rg')}
                    className={errors.rg ? 'border-red-500' : ''}
                  />
                  {errors.rg && (
                    <p className="text-sm text-red-500">{errors.rg.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    {...register('dataNascimento')}
                    className={errors.dataNascimento ? 'border-red-500' : ''}
                  />
                  {errors.dataNascimento && (
                    <p className="text-sm text-red-500">{errors.dataNascimento.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    {...register('telefone')}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-500">{errors.telefone.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil *</Label>
                  <Select onValueChange={(value) => setValue('estadoCivil', value as any)}>
                    <SelectTrigger className={errors.estadoCivil ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="União Estável">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.estadoCivil && (
                    <p className="text-sm text-red-500">{errors.estadoCivil.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão *</Label>
                  <Input
                    id="profissao"
                    {...register('profissao')}
                    className={errors.profissao ? 'border-red-500' : ''}
                  />
                  {errors.profissao && (
                    <p className="text-sm text-red-500">{errors.profissao.message}</p>
                  )}
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    {...register('cep')}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    className={errors.cep ? 'border-red-500' : ''}
                  />
                  {errors.cep && (
                    <p className="text-sm text-red-500">{errors.cep.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    {...register('endereco')}
                    className={errors.endereco ? 'border-red-500' : ''}
                  />
                  {errors.endereco && (
                    <p className="text-sm text-red-500">{errors.endereco.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    {...register('bairro')}
                    className={errors.bairro ? 'border-red-500' : ''}
                  />
                  {errors.bairro && (
                    <p className="text-sm text-red-500">{errors.bairro.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    {...register('cidade')}
                    className={errors.cidade ? 'border-red-500' : ''}
                  />
                  {errors.cidade && (
                    <p className="text-sm text-red-500">{errors.cidade.message}</p>
                  )}
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Informações Eclesiásticas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Eclesiásticas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="batizado">Batizado *</Label>
                  <Select onValueChange={(value) => setValue('batizado', value as any)}>
                    <SelectTrigger className={errors.batizado ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.batizado && (
                    <p className="text-sm text-red-500">{errors.batizado.message}</p>
                  )}
                </div>
                
                {watch('batizado') === 'Sim' && (
                  <div className="space-y-2">
                    <Label htmlFor="dataBatismo">Data do Batismo</Label>
                    <Input
                      id="dataBatismo"
                      type="date"
                      {...register('dataBatismo')}
                      className={errors.dataBatismo ? 'border-red-500' : ''}
                    />
                    {errors.dataBatismo && (
                      <p className="text-sm text-red-500">{errors.dataBatismo.message}</p>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="igreja">Igreja *</Label>
                  <Input
                    id="igreja"
                    {...register('igreja')}
                    className={errors.igreja ? 'border-red-500' : ''}
                  />
                  {errors.igreja && (
                    <p className="text-sm text-red-500">{errors.igreja.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo/Função</Label>
                  <Input
                    id="cargo"
                    {...register('cargo')}
                    placeholder="Ex: Pastor, Diácono, Membro..."
                  />
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <textarea
                  id="observacoes"
                  {...register('observacoes')}
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                  placeholder="Informações adicionais sobre o membro..."
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/membros')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="church-gradient text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Atualizando...' : 'Salvando...'}
                </>
              ) : (
                isEditing ? 'Atualizar Membro' : 'Salvar Membro'
              )}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveContainer>
  );
};

export default MemberForm;
