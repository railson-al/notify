// app/api/push/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não fornecida' },
        { status: 400 }
      );
    }

    const key = subscription.endpoint;

    // Em produção, remover do banco de dados
    console.log('Inscrição removida:', key);

    return NextResponse.json(
      { message: 'Inscrição removida com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar remoção' },
      { status: 500 }
    );
  }
}
