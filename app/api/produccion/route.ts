import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        lote,
        fecha: new Date(fecha),
        paddy,
        blanco,
        rendimiento,
        etapa,
        estado,
      } as any,
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (error: any) {
    console.error(error);

    // Error de lote duplicado
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un registro con ese número de lote" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Error al crear el registro" },
      { status: 500 }
    );
  }
}