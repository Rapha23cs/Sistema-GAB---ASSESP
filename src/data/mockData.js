export const DUMMY_ORDERS = [
  { 
    id: '1',
    numero_os: 'OS-65/2026', 
    contrato: 'CT-012/2026', 
    processo: 'Proc-2026-001',
    sei: 'SEI-12345.67890/2026',
    tipo_servico: 'Preventiva',
    equipamento: 'Esteira Raio-X',
    modelo: 'Rapiscan 620XR',
    numero_serie: 'SN-XR-88902',
    unidade: 'Unidade Prisional Central',
    data_assinatura: '10 Jul 2026',
    status: 'Em Andamento',
    cronograma: 'Semanal',
    tarefas: [
      { 
        id: 'T1', 
        descricao: 'Troca de disco rígido preventivo', 
        data_tarefa: '11 Jul 2026',
        observacoes: 'Disco original apresentava lentidão.',
        concluida: true,
        tratativas: [
          {
            id: 'TR1',
            descricao: 'Disco substituído e sistema reinstalado',
            data_tratativa: '11 Jul 2026',
            observacoes: 'Testes de I/O OK.',
            tratativa_retorno: '',
            observacoes_retorno: ''
          }
        ]
      }, 
      { 
        id: 'T2', 
        descricao: 'Limpeza interna e lubrificação', 
        data_tarefa: '12 Jul 2026',
        observacoes: 'Necessário desengraxante especial.',
        concluida: false,
        tratativas: []
      }
    ]
  },
  { 
    id: '2',
    numero_os: 'OS-66/2026', 
    contrato: 'CT-015/2026', 
    processo: 'Proc-2026-002',
    sei: 'SEI-98765.43210/2026',
    tipo_servico: 'Corretiva',
    equipamento: 'Pórtico Detector',
    modelo: 'Garrett PD 6500i',
    numero_serie: 'SN-PT-55611',
    unidade: 'Sede Administrativa',
    data_assinatura: '08 Jul 2026',
    status: 'Concluída',
    cronograma: 'Emergencial',
    tarefas: [
      { 
        id: 'T3', 
        descricao: 'Substituição da placa mãe', 
        data_tarefa: '09 Jul 2026',
        observacoes: 'Placa queimada por pico de energia.',
        concluida: true,
        tratativas: [
           {
            id: 'TR2',
            descricao: 'Instalação de nova placa original',
            data_tratativa: '09 Jul 2026',
            observacoes: 'Calibração realizada',
            tratativa_retorno: 'Acompanhar em 48h',
            observacoes_retorno: 'Tudo normal.'
          }
        ]
      }
    ]
  }
];

export const DUMMY_EQUIPMENTS = [
  { id: 'EQ-001', type: 'Esteira Raio - X', unit: 'Unidade Prisional Central', serial: 'SN-XR-88902', model: 'Rapiscan 620XR', contract: 'com_contrato', currentOS: '65/2026', status: 'operante' },
  { id: 'EQ-002', type: 'Bodyscann', unit: 'Unidade Prisional Norte', serial: 'SN-BS-11203', model: 'Conpass Smart', contract: 'garantia', currentOS: null, status: 'operante' },
  { id: 'EQ-003', type: 'Pórtico', unit: 'Unidade Prisional Central', serial: 'SN-PT-55611', model: 'Garrett PD 6500i', contract: 'sem_contrato', currentOS: '67/2026', status: 'inoperante' },
];

export const DUMMY_CONTRACTS = [
  {
    id: 'CT-012/2026',
    vigencia: '01/01/2026 a 31/12/2026',
    processoMae: 'Proc-2025-8849',
    tipo: 'Serviço Contínuo',
    recursoFinanceiro: 'Tesouro Estadual',
    valorGlobal: 'R$ 1.200.000,00',
    valorMensal: 'R$ 100.000,00',
    objeto: 'Prestação de serviços de manutenção preventiva e corretiva com reposição de peças para os equipamentos de Bodyscann, incluindo suporte técnico 24x7 e calibração periódica.',
    quantidade: '12 unidades',
    execucao: '35%',
    pendencia: 'R$ 780.000,00',
    prazoEntrega: 'Contínuo',
    statusLicitacao: 'Em Execução',
    localizacao: 'Sede Administrativa / Regionais',
    ultimaConsulta: '13 Jul 2026',
    responsavel: 'Carlos Almeida'
  },
  {
    id: 'CT-015/2026',
    vigencia: '15/03/2026 a 15/03/2027',
    processoMae: 'Proc-2026-1022',
    tipo: 'Aquisição de Bens',
    recursoFinanceiro: 'Fundo Penitenciário Nacional',
    valorGlobal: 'R$ 450.000,00',
    valorMensal: 'N/A',
    objeto: 'Aquisição de Pórticos Detectores de Metais com entrega, instalação e treinamento operacional em diversas unidades.',
    quantidade: '5 unidades',
    execucao: '10%',
    pendencia: 'R$ 405.000,00',
    prazoEntrega: '15 Ago 2026',
    statusLicitacao: 'Empenhado',
    localizacao: 'Almoxarifado Central',
    ultimaConsulta: '10 Jul 2026',
    responsavel: 'Mariana Costa'
  }
];
export const DUMMY_LICITACOES = [
  {
    id: 'Lic-045/2026',
    processo: 'Proc-2026-1022',
    autorizacao: 'Aut-2026-085',
    memoAbertura: 'Memo-105/2026',
    modalidade: 'Pregão Eletrônico',
    fonteCusteio: 'Tesouro Estadual',
    valorPrevisto: 'R$ 450.000,00',
    objeto: 'Aquisição de Pórticos Detectores de Metais',
    quantidade: '5 unidades',
    status: 'em_andamento',
    localizacao: 'Sede / Unidades Regionais',
    data: '15 Ago 2026',
    consultor: 'Ana Beatriz Mendes'
  },
  {
    id: 'Lic-048/2026',
    processo: 'Proc-2026-1044',
    autorizacao: 'Aut-2026-092',
    memoAbertura: 'Memo-110/2026',
    modalidade: 'Dispensa de Licitação',
    fonteCusteio: 'Fundo Penitenciário Nacional',
    valorPrevisto: 'R$ 38.000,00',
    objeto: 'Manutenção corretiva emergencial de Bodyscann',
    quantidade: '1 unidade',
    status: 'homologada',
    localizacao: 'Unidade Prisional Central',
    data: '02 Set 2026',
    consultor: 'Roberto Silva'
  }
];

export const DUMMY_TASKS = [
  { id: 'TSK-01', text: 'Atualize o status dos equipamentos no galpão central', author: 'Mariana Costa', assignee: 'Raphael S.', date: '13 Jul 2026', completed: false, priority: 'alta' },
  { id: 'TSK-02', text: 'Verificar aditivo de contrato CT-012/2026', author: 'Carlos Almeida', assignee: 'Raphael S.', date: '12 Jul 2026', completed: true, priority: 'media' },
  { id: 'TSK-03', text: 'Liberar OS #65/2026 para execução técnica', author: 'Raphael S.', assignee: 'Equipe de Manutenção', date: '13 Jul 2026', completed: false, priority: 'alta' }
];
