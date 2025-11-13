import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { PriceAnalyzer } from '@/lib/analyzers/price-analyzer';

// GET - Obtener histórico de precios para una ruta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route');

    if (!route) {
      return NextResponse.json(
        {
          success: false,
          error: 'Route parameter is required',
        },
        { status: 400 }
      );
    }

    const priceHistory = storage.getPriceHistory(route);
    const routeStats = storage.getRouteStats().find((s) => s.route === route);

    // Analizar patrones de día de la semana si hay suficiente histórico
    let weekdayPatterns = null;
    if (priceHistory.length >= 14) {
      weekdayPatterns = PriceAnalyzer.analyzeWeekdayPatterns(priceHistory);
    }

    return NextResponse.json({
      success: true,
      route,
      priceHistory,
      stats: routeStats || null,
      weekdayPatterns,
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get price history',
      },
      { status: 500 }
    );
  }
}
