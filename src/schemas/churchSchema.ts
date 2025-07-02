import { z } from 'zod';

export const churchSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, 'Nome da igreja deve ter pelo menos 2 caracteres'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  pastor: z.string().min(1, 'Nome do pastor é obrigatório'),
  classificacao: z.enum(['Estadual', 'Setorial', 'Central', 'Regional', 'Local']),
  regiao: z.string().min(1, 'Região é obrigatória'),
  dataFundacao: z.string().optional(),
  observacoes: z.string().optional(),
  ativa: z.boolean().default(true),
  dataRegistro: z.string().optional(),
  dataAtualizacao: z.string().optional()
});

export type ChurchFormData = z.infer<typeof churchSchema>;

// Schema para criação (sem ID)
export const createChurchSchema = churchSchema.omit({ id: true, dataRegistro: true, dataAtualizacao: true });

// Schema para atualização (ID obrigatório)
export const updateChurchSchema = churchSchema.required({ id: true });