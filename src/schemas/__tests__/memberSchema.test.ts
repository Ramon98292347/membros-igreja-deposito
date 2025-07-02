import { memberSchema, createMemberSchema, updateMemberSchema } from '../memberSchema';

describe('memberSchema', () => {
  const validMemberData = {
    nome: 'João Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1990-01-01',
    telefone: '(11) 99999-9999',
    email: 'joao@email.com',
    endereco: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    cep: '01234-567',
    estadoCivil: 'Solteiro(a)' as const,
    profissao: 'Engenheiro',
    escolaridade: 'Superior Completo' as const,
    batizado: 'Sim' as const,
    dataBatismo: '2010-01-01',
    igreja: 'Igreja Central',
    cargo: 'Diácono',
    observacoes: 'Membro ativo',
    ativo: true
  };

  it('deve validar dados válidos do membro', () => {
    const result = memberSchema.safeParse(validMemberData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar nome vazio', () => {
    const invalidData = { ...validMemberData, nome: '' };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome é obrigatório');
    }
  });

  it('deve rejeitar nome muito curto', () => {
    const invalidData = { ...validMemberData, nome: 'A' };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome deve ter pelo menos 2 caracteres');
    }
  });

  it('deve rejeitar CPF inválido', () => {
    const invalidData = { ...validMemberData, cpf: '123.456.789-0' };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('CPF inválido');
    }
  });

  it('deve rejeitar email inválido', () => {
    const invalidData = { ...validMemberData, email: 'email-invalido' };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido');
    }
  });

  it('deve aceitar email vazio', () => {
    const validData = { ...validMemberData, email: '' };
    const result = memberSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar telefone vazio', () => {
    const invalidData = { ...validMemberData, telefone: '' };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Telefone é obrigatório');
    }
  });

  it('deve rejeitar CEP inválido', () => {
    const invalidData = { ...validMemberData, cep: '123' };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('CEP deve ter 8 ou 9 caracteres');
    }
  });

  it('deve aceitar CEP com 8 caracteres', () => {
    const validData = { ...validMemberData, cep: '01234567' };
    const result = memberSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve aceitar CEP com 9 caracteres (com hífen)', () => {
    const validData = { ...validMemberData, cep: '01234-567' };
    const result = memberSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar estado civil inválido', () => {
    const invalidData = { ...validMemberData, estadoCivil: 'Inválido' as any };
    const result = memberSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('deve aceitar todos os estados civis válidos', () => {
    const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
    
    estadosCivis.forEach(estadoCivil => {
      const validData = { ...validMemberData, estadoCivil: estadoCivil as any };
      const result = memberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it('deve aceitar batizado como Sim ou Não', () => {
    const batizadoOptions = ['Sim', 'Não'];
    
    batizadoOptions.forEach(batizado => {
      const validData = { ...validMemberData, batizado: batizado as any };
      const result = memberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it('deve aceitar campos opcionais vazios', () => {
    const validData = {
      ...validMemberData,
      email: '',
      cargo: '',
      observacoes: '',
      dataBatismo: ''
    };
    const result = memberSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('createMemberSchema', () => {
  it('deve validar dados para criação sem id', () => {
    const createData = {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1990-01-01',
      telefone: '(11) 99999-9999',
      email: 'joao@email.com',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      cep: '01234-567',
      estadoCivil: 'Solteiro(a)' as const,
      profissao: 'Engenheiro',
      escolaridade: 'Superior Completo' as const,
      batizado: 'Sim' as const,
      dataBatismo: '2010-01-01',
      igreja: 'Igreja Central',
      cargo: 'Diácono',
      observacoes: 'Membro ativo',
      ativo: true
    };

    const result = createMemberSchema.safeParse(createData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar dados com id para criação', () => {
    const invalidCreateData = {
      id: '123',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1990-01-01',
      telefone: '(11) 99999-9999',
      email: 'joao@email.com',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      cep: '01234-567',
      estadoCivil: 'Solteiro(a)' as const,
      profissao: 'Engenheiro',
      escolaridade: 'Superior Completo' as const,
      batizado: 'Sim' as const,
      dataBatismo: '2010-01-01',
      igreja: 'Igreja Central',
      cargo: 'Diácono',
      observacoes: 'Membro ativo',
      ativo: true
    };

    const result = createMemberSchema.safeParse(invalidCreateData);
    expect(result.success).toBe(false);
  });
});

describe('updateMemberSchema', () => {
  it('deve validar dados para atualização com id', () => {
    const updateData = {
      id: '123',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1990-01-01',
      telefone: '(11) 99999-9999',
      email: 'joao@email.com',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      cep: '01234-567',
      estadoCivil: 'Solteiro(a)' as const,
      profissao: 'Engenheiro',
      escolaridade: 'Superior Completo' as const,
      batizado: 'Sim' as const,
      dataBatismo: '2010-01-01',
      igreja: 'Igreja Central',
      cargo: 'Diácono',
      observacoes: 'Membro ativo',
      ativo: true
    };

    const result = updateMemberSchema.safeParse(updateData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar dados sem id para atualização', () => {
    const invalidUpdateData = {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1990-01-01',
      telefone: '(11) 99999-9999',
      email: 'joao@email.com',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      cep: '01234-567',
      estadoCivil: 'Solteiro(a)' as const,
      profissao: 'Engenheiro',
      escolaridade: 'Superior Completo' as const,
      batizado: 'Sim' as const,
      dataBatismo: '2010-01-01',
      igreja: 'Igreja Central',
      cargo: 'Diácono',
      observacoes: 'Membro ativo',
      ativo: true
    };

    const result = updateMemberSchema.safeParse(invalidUpdateData);
    expect(result.success).toBe(false);
  });
});