// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configurar VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { subscription, notification } = await request.json();

    if (!subscription || !notification) {
      return NextResponse.json(
        { error: 'Inscrição ou notificação não fornecida' },
        { status: 400 }
      );
    }

    // Enviar notificação via push
    await webpush.sendNotification(subscription, JSON.stringify(notification));

    return NextResponse.json(
      { message: 'Notificação enviada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);

    if (error instanceof webpush.WebPushError) {
      // Se o erro for 410 (inscrição inválida), informar
      if (error.statusCode === 410) {
        return NextResponse.json(
          { error: 'Inscrição expirada ou inválida' },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}
