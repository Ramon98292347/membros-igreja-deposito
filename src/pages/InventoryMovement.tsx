import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useInventoryContext } from '@/context/InventoryContext';
import { InventoryItem } from '@/types/inventory';
import { useChurchContext } from '@/context/ChurchContext';
import { Church } from '@/types/church';

const InventoryMovement = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, addMovement, addTransfer, updateItemStock } = useInventoryContext();
  const { churches } = useChurchContext();
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [responsible, setResponsible] = useState('');
  const [observations, setObservations] = useState('');
  
  // Estados específicos para transferência
  const [originChurch, setOriginChurch] = useState<Church | null>(null);
  const [destinationChurch, setDestinationChurch] = useState<Church | null>(null);
  const [churchSearch, setChurchSearch] = useState('');
  const [originChurchSearch, setOriginChurchSearch] = useState('');

  // Filtrar igrejas para busca
  const filteredChurches = churches.filter(church =>
    church.nomeIPDA.toLowerCase().includes(churchSearch.toLowerCase()) ||
    church.endereco.cidade.toLowerCase().includes(churchSearch.toLowerCase())
  );

  const filteredOriginChurches = churches.filter(church =>
    church.nomeIPDA.toLowerCase().includes(originChurchSearch.toLowerCase()) ||
    church.endereco.cidade.toLowerCase().includes(originChurchSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity || !date) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (type === 'saida' || type === 'transferencia') {
      if (quantityNum > selectedItem.quantidadeEstoque) {
        toast({
          title: "Erro",
          description: "Quantidade insuficiente em estoque.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      if (type === 'transferencia') {
        if (!originChurch || !destinationChurch) {
          toast({
            title: "Erro",
            description: "Selecione as igrejas de origem e destino.",
            variant: "destructive",
          });
          return;
        }

        const transferData = {
          itemId: selectedItem.id,
          nomeItem: selectedItem.nomeItem,
          quantidade: quantityNum,
          igrejaOrigemId: originChurch.id,
          igrejaDestinoId: destinationChurch.id,
          nomeIgrejaOrigem: originChurch.nomeIPDA,
          nomeIgrejaDestino: destinationChurch.nomeIPDA,
          dataTransferencia: date,
          responsavelTransferencia: responsible,
          observacoes: observations,
          valorUnitario: selectedItem.valorUnitario,
          valorTotal: quantityNum * selectedItem.valorUnitario,
          status: 'pendente' as const
        };

        addTransfer(transferData);
        updateItemStock(selectedItem.id, -quantityNum);
      } else {
        const movementData = {
          itemId: selectedItem.id,
          nomeItem: selectedItem.nomeItem,
          tipoMovimentacao: type as 'entrada' | 'saida',
          quantidade: quantityNum,
          dataMovimentacao: date,
          origem: type === 'entrada' ? origin : '',
          destino: type === 'saida' ? destination : '',
          responsavel: responsible,
          observacoes: observations,
          valorUnitario: selectedItem.valorUnitario,
          valorTotal: quantityNum * selectedItem.valorUnitario,
          usuarioResponsavel: 'Sistema'
        };

        addMovement(movementData);
        const stockChange = type === 'entrada' ? quantityNum : -quantityNum;
        updateItemStock(selectedItem.id, stockChange);
      }

      toast({
        title: "Sucesso",
        description: `${type === 'entrada' ? 'Entrada' : type === 'saida' ? 'Saída' : 'Transferência'} registrada com sucesso!`,
      });

      // Limpar formulário
      setSelectedItem(null);
      setQuantity('');
      setOrigin('');
      setDestination('');
      setResponsible('');
      setObservations('');
      setOriginChurch(null);
      setDestinationChurch(null);
      setChurchSearch('');
      setOriginChurchSearch('');

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            {type === 'entrada' ? 'Registro de Entrada' : 
             type === 'saida' ? 'Registro de Saída' : 
             'Transferência entre Igrejas'}
          </h1>
          <p className="text-muted-foreground">
            {type === 'entrada' ? 'Registre a entrada de mercadorias no depósito' : 
             type === 'saida' ? 'Registre a saída de mercadorias do depósito' : 
             'Transfira mercadorias entre igrejas'}
          </p>
        </div>
        <Button onClick={() => navigate('/deposito')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Depósito
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'entrada' ? 'Nova Entrada' : 
             type === 'saida' ? 'Nova Saída' : 
             'Nova Transferência'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seleção de Item */}
            <div>
              <Label htmlFor="item">Mercadoria *</Label>
              <Select onValueChange={(value) => {
                const item = items.find(i => i.id === value);
                setSelectedItem(item || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma mercadoria" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nomeItem} - Estoque: {item.quantidadeEstoque}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade */}
            <div>
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
              {selectedItem && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estoque disponível: {selectedItem.quantidadeEstoque} {selectedItem.unidadeMedida}
                </p>
              )}
            </div>

            {/* Data */}
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Campos específicos para transferência */}
            {type === 'transferencia' && (
              <>
                <div>
                  <Label htmlFor="origin-church">Igreja de Origem *</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar igreja de origem..."
                      value={originChurchSearch}
                      onChange={(e) => setOriginChurchSearch(e.target.value)}
                    />
                    {originChurchSearch && (
                      <div className="max-h-32 overflow-y-auto border rounded-md">
                        {filteredOriginChurches.map((church) => (
                          <div
                            key={church.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setOriginChurch(church);
                              setOriginChurchSearch(church.nomeIPDA);
                            }}
                          >
                            <div className="font-medium">{church.nomeIPDA}</div>
                            <div className="text-sm text-gray-600">
                              {church.endereco.cidade}, {church.endereco.estado}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="destination-church">Igreja de Destino *</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar igreja de destino..."
                      value={churchSearch}
                      onChange={(e) => setChurchSearch(e.target.value)}
                    />
                    {churchSearch && (
                      <div className="max-h-32 overflow-y-auto border rounded-md">
                        {filteredChurches.map((church) => (
                          <div
                            key={church.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setDestinationChurch(church);
                              setChurchSearch(church.nomeIPDA);
                            }}
                          >
                            <div className="font-medium">{church.nomeIPDA}</div>
                            <div className="text-sm text-gray-600">
                              {church.endereco.cidade}, {church.endereco.estado}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="responsible">Responsável pela Transferência</Label>
                  <Input
                    id="responsible"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
              </>
            )}

            {/* Campos para entrada */}
            {type === 'entrada' && (
              <div>
                <Label htmlFor="origin">Fornecedor/Origem</Label>
                <Input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ex: Fornecedor X, Doação, etc."
                />
              </div>
            )}

            {/* Campos para saída */}
            {type === 'saida' && (
              <div>
                <Label htmlFor="destination">Destino/Responsável</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: Venda, Doação, Uso Interno, etc."
                />
              </div>
            )}

            {/* Observações */}
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Resumo */}
            {selectedItem && quantity && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Resumo da Movimentação</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Item:</span> {selectedItem.nomeItem}
                  </div>
                  <div>
                    <span className="font-medium">Quantidade:</span> {quantity} {selectedItem.unidadeMedida}
                  </div>
                  <div>
                    <span className="font-medium">Valor Unitário:</span> R$ {selectedItem.valorUnitario.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Valor Total:</span> R$ {(parseInt(quantity || '0') * selectedItem.valorUnitario).toFixed(2)}
                  </div>
                  {type === 'transferencia' && originChurch && destinationChurch && (
                    <>
                      <div className="col-span-2">
                        <span className="font-medium">Origem:</span> {originChurch.nomeIPDA}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Destino:</span> {destinationChurch.nomeIPDA}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/deposito')}>
                Cancelar
              </Button>
              <Button type="submit" className="church-gradient text-white">
                Registrar {type === 'entrada' ? 'Entrada' : type === 'saida' ? 'Saída' : 'Transferência'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryMovement;
