
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInventoryContext } from '@/context/InventoryContext';
import { InventoryItem } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

const InventoryItemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addItem, updateItem, getItemById } = useInventoryContext();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nomeItem: '',
    tipoMercadoria: 'Outros' as InventoryItem['tipoMercadoria'],
    codigo: '',
    descricao: '',
    unidadeMedida: 'Unidade' as InventoryItem['unidadeMedida'],
    valorUnitario: 0,
    quantidadeEstoque: 0,
    estoqueMinimo: 10
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      const item = getItemById(id);
      if (item) {
        setFormData({
          nomeItem: item.nomeItem,
          tipoMercadoria: item.tipoMercadoria,
          codigo: item.codigo,
          descricao: item.descricao,
          unidadeMedida: item.unidadeMedida,
          valorUnitario: item.valorUnitario,
          quantidadeEstoque: item.quantidadeEstoque,
          estoqueMinimo: item.estoqueMinimo || 10
        });
      }
    }
  }, [id, isEditing, getItemById]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeItem.trim()) {
      newErrors.nomeItem = 'Nome do item é obrigatório';
    }
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }
    if (formData.valorUnitario <= 0) {
      newErrors.valorUnitario = 'Valor unitário deve ser maior que zero';
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
      if (isEditing && id) {
        updateItem(id, formData);
        toast({
          title: "Item atualizado",
          description: "O item foi atualizado com sucesso."
        });
      } else {
        addItem(formData);
        toast({
          title: "Item cadastrado",
          description: "O novo item foi cadastrado com sucesso."
        });
      }
      navigate('/deposito');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o item.",
        variant: "destructive"
      });
    }
  };

  const tiposMercadoria = [
    'Manuais Bíblicos - Aluno',
    'Manuais Bíblicos - Professor',
    'Bíblias',
    'Hinários/Livretos',
    'Revistas',
    'Vestuário',
    'Acessórios',
    'CDs Cantados',
    'CDs Oração',
    'CDs Instrumental',
    'CDs Espanhol',
    'CDs Playbacks',
    'Votos',
    'Outros'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">
          {isEditing ? 'Editar Item' : 'Cadastrar Novo Item'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Atualize os dados do item' : 'Preencha os dados do novo item'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nomeItem">Nome da Mercadoria *</Label>
                <Input
                  id="nomeItem"
                  value={formData.nomeItem}
                  onChange={(e) => handleInputChange('nomeItem', e.target.value)}
                  className={errors.nomeItem ? 'border-red-500' : ''}
                />
                {errors.nomeItem && <p className="text-sm text-red-500 mt-1">{errors.nomeItem}</p>}
              </div>

              <div>
                <Label htmlFor="codigo">Código (COD) *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  className={errors.codigo ? 'border-red-500' : ''}
                />
                {errors.codigo && <p className="text-sm text-red-500 mt-1">{errors.codigo}</p>}
              </div>

              <div>
                <Label htmlFor="tipoMercadoria">Tipo de Mercadoria *</Label>
                <Select value={formData.tipoMercadoria} onValueChange={(value) => handleInputChange('tipoMercadoria', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMercadoria.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Ex: A Missão da Igreja, Bíblia Comemorativa 60 Anos"
                />
              </div>

              <div>
                <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                <Select value={formData.unidadeMedida} onValueChange={(value) => handleInputChange('unidadeMedida', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unidade">Unidade</SelectItem>
                    <SelectItem value="Caixa">Caixa</SelectItem>
                    <SelectItem value="Pacote">Pacote</SelectItem>
                    <SelectItem value="Dúzia">Dúzia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valorUnitario">Valor Unitário (R$) *</Label>
                <Input
                  id="valorUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorUnitario}
                  onChange={(e) => handleInputChange('valorUnitario', parseFloat(e.target.value) || 0)}
                  className={errors.valorUnitario ? 'border-red-500' : ''}
                />
                {errors.valorUnitario && <p className="text-sm text-red-500 mt-1">{errors.valorUnitario}</p>}
              </div>

              <div>
                <Label htmlFor="quantidadeEstoque">Quantidade em Estoque</Label>
                <Input
                  id="quantidadeEstoque"
                  type="number"
                  min="0"
                  value={formData.quantidadeEstoque}
                  onChange={(e) => handleInputChange('quantidadeEstoque', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                <Input
                  id="estoqueMinimo"
                  type="number"
                  min="0"
                  value={formData.estoqueMinimo}
                  onChange={(e) => handleInputChange('estoqueMinimo', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/deposito')}>
            Cancelar
          </Button>
          <Button type="submit" className="church-gradient text-white">
            {isEditing ? 'Atualizar Item' : 'Cadastrar Item'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryItemForm;
