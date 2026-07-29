-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'operante',
    "contractId" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEquipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "OrderEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "orderEquipmentId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "vigencia" TEXT NOT NULL,
    "processoMae" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "valorGlobal" TEXT NOT NULL,
    "valorMensal" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "quantidade" TEXT NOT NULL,
    "execucao" TEXT NOT NULL,
    "pendencia" TEXT NOT NULL,
    "prazo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "ultimaCons" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licitacao" (
    "id" TEXT NOT NULL,
    "processo" TEXT NOT NULL,
    "autorizacao" TEXT NOT NULL,
    "memoAbertura" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "fonteCusteio" TEXT NOT NULL,
    "valorPrevisto" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "quantidade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "consultor" TEXT NOT NULL,

    CONSTRAINT "Licitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollabTask" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'media',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "date" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,

    CONSTRAINT "CollabTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "OrderEquipment" ADD CONSTRAINT "OrderEquipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEquipment" ADD CONSTRAINT "OrderEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_orderEquipmentId_fkey" FOREIGN KEY ("orderEquipmentId") REFERENCES "OrderEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabTask" ADD CONSTRAINT "CollabTask_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabTask" ADD CONSTRAINT "CollabTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
