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
import { applyCpfMask, applyCepMask, applyPhoneMask, fetchAddressByCep, calculateAge, BRAZILIAN_STATES } from '../lib/masks';

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
      nomeCompleto: '',
      imagemLink: '',
      email: '',
      telefone: '',
      endereco: '',
      bairro: '',
      numeroCasa: '',
      cidade: '',
      estado: '',
      cep: '',
      cpf: '',
      rg: '',
      cidadeNascimento: '',
      estadoCidadeNascimento: '',
      dataNascimento: '',
      idade: undefined,
      estadoCivil: 'Solteiro(a)',
      profissao: '',
      temFilho: 'Não',
      dataBatismo: '',
      funcaoMinisterial: 'Membro',
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
        nomeCompleto: member.nomeCompleto || '',
        imagemLink: member.foto || '',
        email: member.email || '',
        telefone: member.telefone || '',
        endereco: member.endereco || '',
        bairro: member.bairro || '',
        numeroCasa: member.numeroCasa || '',
        cidade: member.cidade || '',
        estado: member.estado || '',
        cep: member.cep || '',
        cpf: member.cpf || '',
        rg: member.rg || '',
        cidadeNascimento: member.cidadeNascimento || '',
        estadoCidadeNascimento: member.estadoCidadeNascimento || '',
        dataNascimento: member.dataNascimento || '',
        idade: member.idade || undefined,
        estadoCivil: member.estadoCivil || 'Solteiro(a)',
        profissao: member.profissao || '',
        temFilho: 'Não', // Campo novo, valor padrão
        dataBatismo: member.dataBatismo || '',
        funcaoMinisterial: member.funcaoMinisterial || 'Membro',
        igreja: '', // Campo legado
        cargo: member.funcaoMinisterial || '',
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
  
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCepMask(e.target.value);
    setValue('cep', maskedValue);
    
    // Auto-fetch address when CEP is complete
    const cleanCep = maskedValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const addressData = await fetchAddressByCep(cleanCep);
      if (addressData) {
        setValue('endereco', addressData.endereco || '');
        setValue('bairro', addressData.bairro || '');
        setValue('cidade', addressData.cidade || '');
        setValue('estado', addressData.estado || '');
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value);
    setValue('telefone', maskedValue);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCpfMask(e.target.value);
    setValue('cpf', maskedValue);
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = e.target.value;
    setValue('dataNascimento', birthDate);
    
    // Auto-calculate age
    if (birthDate) {
      const age = calculateAge(birthDate);
      setValue('idade', age);
    }
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    {...register('nomeCompleto')}
                    className={errors.nomeCompleto ? 'border-red-500' : ''}
                  />
                  {errors.nomeCompleto && (
                    <p className="text-sm text-red-500">{errors.nomeCompleto.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imagemLink">Link da Imagem</Label>
                  <Input
                    id="imagemLink"
                    {...register('imagemLink')}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className={errors.imagemLink ? 'border-red-500' : ''}
                  />
                  {errors.imagemLink && (
                    <p className="text-sm text-red-500">{errors.imagemLink.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imagemArquivo">Upload de Imagem</Label>
                  <Input
                    id="imagemArquivo"
                    type="file"
                    accept="image/*"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
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
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
                <div className="space-y-2 sm:col-span-2">
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
                  <Label htmlFor="numeroCasa">Número *</Label>
                  <Input
                    id="numeroCasa"
                    {...register('numeroCasa')}
                    className={errors.numeroCasa ? 'border-red-500' : ''}
                  />
                  {errors.numeroCasa && (
                    <p className="text-sm text-red-500">{errors.numeroCasa.message}</p>
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
                
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select onValueChange={(value) => setValue('estado', value)} value={watch('estado')}>
                    <SelectTrigger className={errors.estado ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.value} - {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado && (
                    <p className="text-sm text-red-500">{errors.estado.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    {...register('cep')}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    className={errors.cep ? 'border-red-500' : ''}
                  />
                  {errors.cep && (
                    <p className="text-sm text-red-500">{errors.cep.message}</p>
                  )}
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    {...register('cpf')}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
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
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Dados de Nascimento */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Nascimento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="cidadeNascimento">Cidade de Nascimento *</Label>
                  <Input
                    id="cidadeNascimento"
                    {...register('cidadeNascimento')}
                    className={errors.cidadeNascimento ? 'border-red-500' : ''}
                  />
                  {errors.cidadeNascimento && (
                    <p className="text-sm text-red-500">{errors.cidadeNascimento.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estadoCidadeNascimento">Estado da Cidade *</Label>
                  <Select onValueChange={(value) => setValue('estadoCidadeNascimento', value)} value={watch('estadoCidadeNascimento')}>
                    <SelectTrigger className={errors.estadoCidadeNascimento ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.value} - {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estadoCidadeNascimento && (
                    <p className="text-sm text-red-500">{errors.estadoCidadeNascimento.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    {...register('dataNascimento')}
                    onChange={handleBirthDateChange}
                    className={errors.dataNascimento ? 'border-red-500' : ''}
                  />
                  {errors.dataNascimento && (
                    <p className="text-sm text-red-500">{errors.dataNascimento.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade (calculada automaticamente)</Label>
                  <Input
                    id="idade"
                    type="number"
                    {...register('idade', { valueAsNumber: true })}
                    readOnly
                    className={`bg-gray-100 ${errors.idade ? 'border-red-500' : ''}`}
                  />
                  {errors.idade && (
                    <p className="text-sm text-red-500">{errors.idade.message}</p>
                  )}
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
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
                
                <div className="space-y-2">
                  <Label htmlFor="temFilho">Tem Filho? *</Label>
                  <Select onValueChange={(value) => setValue('temFilho', value as any)}>
                    <SelectTrigger className={errors.temFilho ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.temFilho && (
                    <p className="text-sm text-red-500">{errors.temFilho.message}</p>
                  )}
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
          
          {/* Dados Religiosos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Religiosos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="dataBatismo">Data de Batismo</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="funcaoMinisterial">Função Ministerial *</Label>
                  <Select onValueChange={(value) => setValue('funcaoMinisterial', value as any)}>
                    <SelectTrigger className={errors.funcaoMinisterial ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pastor">Pastor</SelectItem>
                      <SelectItem value="Presbítero">Presbítero</SelectItem>
                      <SelectItem value="Diácono">Diácono</SelectItem>
                      <SelectItem value="Obreiro">Obreiro</SelectItem>
                      <SelectItem value="Membro">Membro</SelectItem>
                      <SelectItem value="Missionário">Missionário</SelectItem>
                      <SelectItem value="Evangelista">Evangelista</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.funcaoMinisterial && (
                    <p className="text-sm text-red-500">{errors.funcaoMinisterial.message}</p>
                  )}
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    {...register('observacoes')}
                    className={errors.observacoes ? 'border-red-500' : ''}
                  />
                  {errors.observacoes && (
                    <p className="text-sm text-red-500">{errors.observacoes.message}</p>
                  )}
                </div>
              </ResponsiveGrid>
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
