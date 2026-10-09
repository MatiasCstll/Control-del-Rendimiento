import { NextRequest, NextResponse } from "next/server";
// ¡IMPORTANTE! Aquí importamos tu cliente Prisma configurado (db.ts)
// NO importamos de "@prisma/client" ni creamos un "new PrismaClient()"
import prisma from "@/src/prisma/db";

export async function GET() {
  try {
    const registros = await prisma.registroRendimiento.findMany({
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(registros);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al obtener los registros" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lote, fecha, paddy, blanco, rendimiento, etapa, estado } = body;

    // Validación básica
    if (!lote || !fecha || paddy == null || blanco == null) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const nuevo = await prisma.registroRendimiento.create({
      data: {
        loteSilo: lote, // Ajustado al nombre de tu schema.prisma
        fecha: new Date(fecha),
        variedad: "Desconocida", // Ajustado a tu schema (puedes cambiarlo luego)
        rendimiento: Number(rendimiento) || 0, // Ajustado a tu schema
      },
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al crear el registro" },
      { status: 500 }
    );
  }
}