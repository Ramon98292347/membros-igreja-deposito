import { z } from 'zod';

export const memberSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  telefone: z.string().min(1, 'Telefone é obrigatório').regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  cep: z.string().min(8, 'CEP deve ter 8 ou 9 caracteres').max(9, 'CEP deve ter 8 ou 9 caracteres').regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000'),
  estadoCivil: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']),
  profissao: z.string().min(1, 'Profissão é obrigatória'),
  escolaridade: z.enum(['Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação']),
  batizado: z.enum(['Sim', 'Não']),
  dataBatismo: z.string().optional(),
  igreja: z.string().min(1, 'Igreja é obrigatória'),
  cargo: z.string().optional(),
  observacoes: z.string().optional(),
  foto: z.string().optional(),
  ativo: z.boolean().default(true),
  dataRegistro: z.string().optional(),
  dataAtualizacao: z.string().optional()
});

export type MemberFormData = z.infer<typeof memberSchema>;

// Schema para criação (sem ID)
export const createMemberSchema = memberSchema.omit({ id: true, dataRegistro: true, dataAtualizacao: true }).strict();

// Schema para atualização (ID obrigatório)
export const updateMemberSchema = memberSchema.required({ id: true });