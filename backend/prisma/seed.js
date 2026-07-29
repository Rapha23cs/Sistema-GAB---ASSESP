const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Criar um usuário
  const user = await prisma.user.upsert({
    where: { email: 'raphael@sistemagab.com' },
    update: {},
    create: {
      name: 'Raphael S.',
      email: 'raphael@sistemagab.com',
      password: 'hashedpassword',
      role: 'admin',
    },
  });

  // 2. Criar Equipamentos
  const eq1 = await prisma.equipment.create({
    data: {
      name: 'Esteira de Raio-X Heimann',
      status: 'inoperante'
    }
  });
  const eq2 = await prisma.equipment.create({
    data: {
      name: 'Pórtico Detector de Metais',
      status: 'operante'
    }
  });

  // 3. Criar uma OS
  const order = await prisma.order.create({
    data: {
      id: 'OS-2026-089',
      type: 'preventiva',
      client: 'Unidade Prisional A',
      status: 'em_andamento',
    }
  });

  // 4. Vincular Equipamentos à OS e criar tarefas
  const oe1 = await prisma.orderEquipment.create({
    data: {
      orderId: order.id,
      equipmentId: eq1.id,
    }
  });
  
  await prisma.task.create({
    data: {
      id: 'TSK-089-1',
      description: 'Limpeza dos roletes',
      status: 'concluido',
      orderEquipmentId: oe1.id
    }
  });
  await prisma.task.create({
    data: {
      id: 'TSK-089-2',
      description: 'Troca da esteira principal',
      status: 'pendente',
      orderEquipmentId: oe1.id
    }
  });

  // 5. Criar Tarefa de Colaboração
  await prisma.collabTask.create({
    data: {
      id: 'COL-01',
      text: 'Verificar por que a tela de Contratos tá dando erro.',
      priority: 'alta',
      completed: false,
      date: '2026-07-13T10:00:00Z',
      authorId: user.id,
      assigneeId: user.id
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
