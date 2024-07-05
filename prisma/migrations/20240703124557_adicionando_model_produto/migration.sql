-- CreateTable
CREATE TABLE "Produtos" (
    "id" SERIAL NOT NULL,
    "nomeproduto" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "precovenda" DOUBLE PRECISION NOT NULL,
    "validade" TIMESTAMP(3) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "dataregistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attregistro" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produtos_pkey" PRIMARY KEY ("id")
);
