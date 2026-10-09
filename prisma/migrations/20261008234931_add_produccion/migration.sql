-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produccion" (
    "id" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "paddy" DOUBLE PRECISION NOT NULL,
    "blanco" DOUBLE PRECISION NOT NULL,
    "rendimiento" DOUBLE PRECISION NOT NULL,
    "etapa" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'En proceso',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produccion_lote_key" ON "Produccion"("lote");
