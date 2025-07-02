import { z } from 'zod';

export const inventoryItemSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, 'Nome do item deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  quantidade: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  quantidadeMinima: z.number().min(0, 'Quantidade mínima deve ser maior ou igual a 0'),
  preco: z.number().min(0, 'Preço deve ser maior ou igual a 0').optional(),
  fornecedor: z.string().optional(),
  localizacao: z.string().optional(),
  dataValidade: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
  dataRegistro: z.string().optional(),
  dataAtualizacao: z.string().optional()
});

export const inventoryMovementSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().min(1, 'Item é obrigatório'),
  tipo: z.enum(['entrada', 'saida']),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  observacoes: z.string().optional(),
  dataMovimento: z.string().min(1, 'Data do movimento é obrigatória'),
  dataRegistro: z.string().optional()
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;
export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;

// Schemas para criação (sem ID)
export const createInventoryItemSchema = inventoryItemSchema.omit({ id: true, dataRegistro: true, dataAtualizacao: true });
export const createInventoryMovementSchema = inventoryMovementSchema.omit({ id: true, dataRegistro: true });

// Schemas para atualização (ID obrigatório)
export const updateInventoryItemSchema = inventoryItemSchema.required({ id: true });
export const updateInventoryMovementSchema = inventoryMovementSchema.required({ id: true });