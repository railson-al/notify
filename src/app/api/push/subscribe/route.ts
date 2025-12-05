// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Em produção, você armazenaria as inscrições em um banco de dados
// Esta é uma solução simples na memória
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não fornecida' },
        { status: 400 }
      );
    }

    // Usar endpoint como chave única
    const key = subscription.endpoint;
    subscriptions.set(key, subscription);

    // IMPORTANTE: Em produção, salvar no banco de dados
    console.log('Inscrição salva:', key);
    console.log('Total de inscrições:', subscriptions.size);

    return NextResponse.json(
      { message: 'Inscrição salva com sucesso', endpoint: key },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao salvar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar inscrição' },
      { status: 500 }
    );
  }
}
