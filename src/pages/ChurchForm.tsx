import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useChurchContext } from '@/context/ChurchContext';
import { Church } from '@/types/church';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { applyCpfMask, applyCepMask, applyPhoneMask, validateCpf, fetchAddressByCep, BRAZILIAN_STATES } from '@/lib/masks';

const ChurchForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addChurch, updateChurch, getChurchById } = useChurchContext();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    classificacao: 'Local' as Church['classificacao'],
    nomeIPDA: '',
    tipoIPDA: 'Congregação' as Church['tipoIPDA'],
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    pastor: {
      nomeCompleto: '',
      cpf: '',
      telefone: '',
      email: '',
      dataNascimento: '',
      dataBatismo: '',
      estadoCivil: 'Solteiro' as Church['pastor']['estadoCivil'],
      funcaoMinisterial: '',
      possuiCFO: false,
      dataConclusaoCFO: '',
      dataAssumiu: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }
    },
    membrosIniciais: 0,
    membrosAtuais: 0,
    almasBatizadas: 0,
    temEscola: false,
    quantidadeCriancas: 0,
    diasFuncionamento: [] as string[],
    foto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const diasSemana = [
    { value: 'domingo', label: 'Domingo' },
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terca', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sabado', label: 'Sábado' }
  ];

  useEffect(() => {
    if (isEditing && id) {
      const church = getChurchById(id);
      if (church) {
        setFormData({
          classificacao: church.classificacao,
          nomeIPDA: church.nomeIPDA,
          tipoIPDA: church.tipoIPDA,
          endereco: { ...church.endereco },
          pastor: { 
            ...church.pastor, 
            dataConclusaoCFO: church.pastor.dataConclusaoCFO || '',
            cpf: church.pastor.cpf || '',
            endereco: church.pastor.endereco || {
              rua: '',
              numero: '',
              bairro: '',
              cidade: '',
              estado: '',
              cep: ''
            }
          },
          membrosIniciais: church.membrosIniciais,
          membrosAtuais: church.membrosAtuais,
          almasBatizadas: church.almasBatizadas,
          temEscola: church.temEscola,
          quantidadeCriancas: church.quantidadeCriancas || 0,
          diasFuncionamento: Array.isArray(church.diasFuncionamento) ? church.diasFuncionamento : [],
          foto: church.foto || ''
        });
      }
    }
  }, [id, isEditing, getChurchById]);

  const handleInputChange = async (field: string, value: any, nested?: string, subNested?: string) => {
    let processedValue = value;
    
    // Apply masks
    if (field === 'cep' && typeof value === 'string') {
      processedValue = applyCepMask(value);
      
      // Auto-fetch address when CEP is complete
      if (value.replace(/\D/g, '').length === 8) {
        const addressData = await fetchAddressByCep(value);
        if (addressData) {
          if (nested === 'pastor' && subNested === 'endereco') {
            setFormData(prev => ({
              ...prev,
              pastor: {
                ...prev.pastor,
                endereco: {
                  ...prev.pastor.endereco,
                  cep: processedValue,
                  rua: addressData.endereco,
                  bairro: addressData.bairro,
                  cidade: addressData.cidade,
                  estado: addressData.estado
                }
              }
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              endereco: {
                ...prev.endereco,
                cep: processedValue,
                rua: addressData.endereco,
                bairro: addressData.bairro,
                cidade: addressData.cidade,
                estado: addressData.estado
              }
            }));
          }
          return;
        }
      }
    } else if (field === 'telefone' && typeof value === 'string') {
      processedValue = applyPhoneMask(value);
    } else if (field === 'cpf' && typeof value === 'string') {
      processedValue = applyCpfMask(value);
    }
    
    if (subNested) {
      setFormData(prev => ({
        ...prev,
        [nested!]: {
          ...(prev[nested! as keyof typeof prev] as any),
          [subNested]: {
            ...(prev[nested! as keyof typeof prev] as any)[subNested],
            [field]: processedValue
          }
        }
      }));
    } else if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...(prev[nested as keyof typeof prev] as object),
          [field]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: processedValue }));
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDiaChange = (dia: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      diasFuncionamento: checked 
        ? [...prev.diasFuncionamento, dia]
        : prev.diasFuncionamento.filter(d => d !== dia)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, foto: url }));
      toast({
        title: "Arquivo carregado",
        description: "A foto foi carregada com sucesso."
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeIPDA.trim()) {
      newErrors.nomeIPDA = 'Nome da IPDA é obrigatório';
    }
    if (!formData.pastor.nomeCompleto.trim()) {
      newErrors.pastorNome = 'Nome do pastor é obrigatório';
    }
    if (!formData.endereco.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    if (!formData.endereco.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }
    if (!formData.pastor.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos em destaque.",
        variant: "destructive"
      });
      return;
    }

    try {
      const churchData = {
        ...formData,
        pastor: {
          ...formData.pastor,
          possuiCFO: formData.pastor.possuiCFO,
          dataConclusaoCFO: formData.pastor.possuiCFO ? formData.pastor.dataConclusaoCFO : undefined
        },
        quantidadeCriancas: formData.temEscola ? formData.quantidadeCriancas : undefined,
        diasFuncionamento: formData.temEscola ? formData.diasFuncionamento : undefined
      };

      if (isEditing && id) {
        updateChurch(id, churchData);
        toast({
          title: "Igreja atualizada",
          description: "Os dados da igreja foram atualizados com sucesso."
        });
      } else {
        addChurch(churchData);
        toast({
          title: "Igreja cadastrada",
          description: "A nova igreja foi cadastrada com sucesso."
        });
      }
      navigate('/igrejas');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">
          {isEditing ? 'Editar Igreja' : 'Cadastrar Nova Igreja'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Atualize os dados da igreja' : 'Preencha os dados da nova igreja'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classificação e Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação e Dados Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classificacao">Classificação *</Label>
                <Select value={formData.classificacao} onValueChange={(value) => handleInputChange('classificacao', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estadual">Estadual</SelectItem>
                    <SelectItem value="Setorial">Setorial</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoIPDA">Esta IPDA é *</Label>
                <Select value={formData.tipoIPDA} onValueChange={(value) => handleInputChange('tipoIPDA', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sede">Sede</SelectItem>
                    <SelectItem value="Congregação">Congregação</SelectItem>
                    <SelectItem value="Ponto de Pregação">Ponto de Pregação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="nomeIPDA">Nome da IPDA *</Label>
                <Input
                  id="nomeIPDA"
                  value={formData.nomeIPDA}
                  onChange={(e) => handleInputChange('nomeIPDA', e.target.value)}
                  className={errors.nomeIPDA ? 'border-red-500' : ''}
                />
                {errors.nomeIPDA && <p className="text-sm text-red-500 mt-1">{errors.nomeIPDA}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="foto">Foto da Igreja (Link ou arquivo)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="foto"
                    value={formData.foto}
                    onChange={(e) => handleInputChange('foto', e.target.value)}
                    placeholder="Digite o link da imagem ou selecione um arquivo"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value, 'endereco')}
                  placeholder="00000-000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={formData.endereco.rua}
                  onChange={(e) => handleInputChange('rua', e.target.value, 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.endereco.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value, 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value, 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value, 'endereco')}
                  className={errors.cidade ? 'border-red-500' : ''}
                />
                {errors.cidade && <p className="text-sm text-red-500 mt-1">{errors.cidade}</p>}
              </div>
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Select value={formData.endereco.estado} onValueChange={(value) => handleInputChange('estado', value, 'endereco')}>
                  <SelectTrigger className={errors.estado ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && <p className="text-sm text-red-500 mt-1">{errors.estado}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Pastor */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Pastor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="pastorNome">Nome Completo do Pastor *</Label>
                <Input
                  id="pastorNome"
                  value={formData.pastor.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value, 'pastor')}
                  className={errors.pastorNome ? 'border-red-500' : ''}
                />
                {errors.pastorNome && <p className="text-sm text-red-500 mt-1">{errors.pastorNome}</p>}
              </div>

              <div>
                <Label htmlFor="pastorCpf">CPF</Label>
                <Input
                  id="pastorCpf"
                  value={formData.pastor.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value, 'pastor')}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.pastor.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value, 'pastor')}
                  placeholder="(00) 99999-9999"
                  className={errors.telefone ? 'border-red-500' : ''}
                />
                {errors.telefone && <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.pastor.email}
                  onChange={(e) => handleInputChange('email', e.target.value, 'pastor')}
                />
              </div>

              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.pastor.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value, 'pastor')}
                />
              </div>

              <div>
                <Label htmlFor="dataBatismo">Data do Batismo</Label>
                <Input
                  id="dataBatismo"
                  type="date"
                  value={formData.pastor.dataBatismo}
                  onChange={(e) => handleInputChange('dataBatismo', e.target.value, 'pastor')}
                />
              </div>

              <div>
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select value={formData.pastor.estadoCivil} onValueChange={(value) => handleInputChange('estadoCivil', value, 'pastor')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="Viúvo">Viúvo</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="funcaoMinisterial">Função Ministerial</Label>
                <Input
                  id="funcaoMinisterial"
                  value={formData.pastor.funcaoMinisterial}
                  onChange={(e) => handleInputChange('funcaoMinisterial', e.target.value, 'pastor')}
                />
              </div>

              <div>
                <Label htmlFor="possuiCFO">Possui o curso de CFO</Label>
                <Select value={formData.pastor.possuiCFO ? 'Sim' : 'Não'} onValueChange={(value) => handleInputChange('possuiCFO', value === 'Sim', 'pastor')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.pastor.possuiCFO && (
                <div>
                  <Label htmlFor="dataConclusaoCFO">Data da Conclusão CFO</Label>
                  <Input
                    id="dataConclusaoCFO"
                    type="date"
                    value={formData.pastor.dataConclusaoCFO}
                    onChange={(e) => handleInputChange('dataConclusaoCFO', e.target.value, 'pastor')}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="dataAssumiu">Data que assumiu a IPDA</Label>
                <Input
                  id="dataAssumiu"
                  type="date"
                  value={formData.pastor.dataAssumiu}
                  onChange={(e) => handleInputChange('dataAssumiu', e.target.value, 'pastor')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço do Pastor */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço do Pastor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pastorCep">CEP</Label>
                <Input
                  id="pastorCep"
                  value={formData.pastor.endereco.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value, 'pastor', 'endereco')}
                  placeholder="00000-000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="pastorRua">Rua</Label>
                <Input
                  id="pastorRua"
                  value={formData.pastor.endereco.rua}
                  onChange={(e) => handleInputChange('rua', e.target.value, 'pastor', 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="pastorNumero">Número</Label>
                <Input
                  id="pastorNumero"
                  value={formData.pastor.endereco.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value, 'pastor', 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="pastorBairro">Bairro</Label>
                <Input
                  id="pastorBairro"
                  value={formData.pastor.endereco.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value, 'pastor', 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="pastorCidade">Cidade</Label>
                <Input
                  id="pastorCidade"
                  value={formData.pastor.endereco.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value, 'pastor', 'endereco')}
                />
              </div>
              <div>
                <Label htmlFor="pastorEstado">Estado</Label>
                <Select value={formData.pastor.endereco.estado} onValueChange={(value) => handleInputChange('estado', value, 'pastor', 'endereco')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Gestão */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Gestão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="membrosIniciais">Membros quando assumiu</Label>
                <Input
                  id="membrosIniciais"
                  type="number"
                  value={formData.membrosIniciais}
                  onChange={(e) => handleInputChange('membrosIniciais', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="membrosAtuais">Membros atualmente</Label>
                <Input
                  id="membrosAtuais"
                  type="number"
                  value={formData.membrosAtuais}
                  onChange={(e) => handleInputChange('membrosAtuais', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="almasBatizadas">Almas batizadas na gestão</Label>
                <Input
                  id="almasBatizadas"
                  type="number"
                  value={formData.almasBatizadas}
                  onChange={(e) => handleInputChange('almasBatizadas', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escola Pequeno Galileu */}
        <Card>
          <CardHeader>
            <CardTitle>Escola Pequeno Galileu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="temEscola">Tem a Escola o Pequeno Galileu</Label>
              <Select value={formData.temEscola ? 'Sim' : 'Não'} onValueChange={(value) => handleInputChange('temEscola', value === 'Sim')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.temEscola && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantidadeCriancas">Quantas crianças tem na escola</Label>
                  <Input
                    id="quantidadeCriancas"
                    type="number"
                    value={formData.quantidadeCriancas}
                    onChange={(e) => handleInputChange('quantidadeCriancas', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Dias que funciona</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {diasSemana.map((dia) => (
                      <div key={dia.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={dia.value}
                          checked={formData.diasFuncionamento.includes(dia.value)}
                          onCheckedChange={(checked) => handleDiaChange(dia.value, checked as boolean)}
                        />
                        <Label htmlFor={dia.value} className="text-sm">{dia.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/igrejas')}>
            Cancelar
          </Button>
          <Button type="submit" className="church-gradient text-white">
            {isEditing ? 'Atualizar Igreja' : 'Cadastrar Igreja'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChurchForm;
