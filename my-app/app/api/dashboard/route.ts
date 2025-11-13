import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import type { DashboardStats } from '@/types';

// GET - Obtener estadísticas del dashboard
export async function GET() {
  try {
    const alerts = storage.getAlerts();
    const activeAlerts = alerts.filter((a) => a.isActive);
    const routeStats = storage.getRouteStats();
    const recentSearches = storage.getRecentSearches();

    // Calcular precio promedio de todas las rutas
    const avgPrice =
      routeStats.length > 0
        ? Math.round(
            routeStats.reduce((sum, stat) => sum + stat.currentPrice, 0) /
              routeStats.length
          )
        : 0;

    // Encontrar el mejor deal de hoy (ruta con mejor score)
    let bestDealToday = null;
    if (routeStats.length > 0) {
      const sortedStats = [...routeStats].sort(
        (a, b) => a.currentPrice - b.currentPrice
      );

      if (sortedStats[0]) {
        const bestRoute = sortedStats[0];
        bestDealToday = {
          id: `deal-${bestRoute.route}`,
          price: bestRoute.currentPrice,
          currency: 'USD',
          airline: 'Various',
          duration: 660,
          stops: 0,
          departTime: new Date(),
          arriveTime: new Date(),
          bookingUrl: `https://www.google.com/travel/flights`,
          source: 'google' as const,
          scoreValue: 85,
          route: bestRoute.route,
        };
      }
    }

    const stats: DashboardStats = {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      bestDealToday: bestDealToday || undefined,
      averagePrice: avgPrice,
      routesMonitored: routeStats.length,
      recentSearches: recentSearches.slice(0, 5),
    };

    return NextResponse.json({
      success: true,
      stats,
      alerts: activeAlerts.slice(0, 5), // Últimas 5 alertas activas
      routes: routeStats.slice(0, 10), // Top 10 rutas monitoreadas
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get dashboard statistics',
      },
      { status: 500 }
    );
  }
}
