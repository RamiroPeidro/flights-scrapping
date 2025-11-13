import { NextRequest, NextResponse } from 'next/server';
import { searchGoogleFlights } from '@/lib/scrapers/google-flights';
import { PriceAnalyzer } from '@/lib/analyzers/price-analyzer';
import { storage } from '@/lib/storage';
import type { FlightSearchParams } from '@/types';
import { z } from 'zod';

// Schema de validación
const searchSchema = z.object({
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departDate: z.string().transform((str) => new Date(str)),
  returnDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  flexDays: z.number().optional().default(0),
  passengers: z.number().optional().default(1),
  class: z.enum(['economy', 'business', 'first']).optional().default('economy'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar parámetros
    const validatedParams = searchSchema.parse(body);

    const params: FlightSearchParams = {
      ...validatedParams,
    };

    console.log('🔍 Search request:', params);

    // Generar cache key
    const cacheKey = JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate.toISOString().split('T')[0],
      returnDate: params.returnDate?.toISOString().split('T')[0],
    });

    // Verificar cache (5 minutos)
    const cachedResults = storage.getCachedFlightResults(cacheKey);
    if (cachedResults && cachedResults.length > 0) {
      console.log('✅ Returning cached results');

      // Obtener análisis de precios
      const route = `${params.origin}-${params.destination}`;
      const priceHistory = storage.getPriceHistory(route);
      const bestDeal = PriceAnalyzer.findBestDeal(cachedResults);

      let analysis = null;
      if (bestDeal) {
        analysis = PriceAnalyzer.analyze(bestDeal.price, priceHistory);
      }

      return NextResponse.json({
        success: true,
        flights: cachedResults,
        cached: true,
        analysis,
        timestamp: new Date().toISOString(),
      });
    }

    // Si no hay cache, buscar en Google Flights
    console.log('🚀 Searching Google Flights...');
    const flights = await searchGoogleFlights(params);

    if (flights.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No flights found',
        flights: [],
      }, { status: 404 });
    }

    // Cachear resultados
    storage.cacheFlightResults(cacheKey, flights);

    // Guardar en histórico de precios
    const route = `${params.origin}-${params.destination}`;
    const bestDeal = PriceAnalyzer.findBestDeal(flights);

    if (bestDeal) {
      storage.addPricePoint(route, bestDeal.price, bestDeal.currency);
      storage.updateRouteStats(route, bestDeal.price);
    }

    // Analizar precios
    const priceHistory = storage.getPriceHistory(route);
    const analysis = bestDeal
      ? PriceAnalyzer.analyze(bestDeal.price, priceHistory)
      : null;

    // Guardar búsqueda reciente
    storage.addRecentSearch(params);

    console.log(`✅ Found ${flights.length} flights`);

    return NextResponse.json({
      success: true,
      flights,
      cached: false,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in search API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// GET para obtener búsquedas recientes
export async function GET() {
  try {
    const recentSearches = storage.getRecentSearches();

    return NextResponse.json({
      success: true,
      searches: recentSearches.slice(0, 10),
    });
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get recent searches',
      },
      { status: 500 }
    );
  }
}
