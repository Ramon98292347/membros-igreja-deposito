import { z } from 'zod';
import { validateCpf } from '../lib/masks';

export const memberSchema = z.object({
  id: z.string().optional(),
  nomeCompleto: z.string().min(1, 'Nome completo é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  
  // Imagem
  imagemLink: z.string().url('Link da imagem deve ser uma URL válida').optional().or(z.literal('')),
  imagemArquivo: z.any().optional(), // Para upload de arquivo
  
  // Contato
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().min(1, 'Telefone é obrigatório').regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  
  // Endereço
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  numeroCasa: z.string().min(1, 'Número da casa é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter 8 ou 9 caracteres').max(9, 'CEP deve ter 8 ou 9 caracteres').regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000'),
  
  // Documentos
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').refine(validateCpf, 'CPF inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  
  // Nascimento
  cidadeNascimento: z.string().min(1, 'Cidade de nascimento é obrigatória'),
  estadoCidadeNascimento: z.string().min(1, 'Estado da cidade de nascimento é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  idade: z.number().min(0, 'Idade deve ser um número positivo').optional(),
  
  // Dados pessoais
  estadoCivil: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']),
  profissao: z.string().min(1, 'Profissão é obrigatória'),
  temFilho: z.enum(['Sim', 'Não']),
  
  // Dados religiosos
  dataBatismo: z.string().optional(),
  funcaoMinisterial: z.enum(['Pastor', 'Presbítero', 'Diácono', 'Obreiro', 'Membro', 'Missionário', 'Evangelista']).default('Membro'),
  
  // Campos do sistema antigo (manter compatibilidade)
  igreja: z.string().optional(),
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