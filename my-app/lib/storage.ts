import type { Alert, FlightResult, PricePoint, RouteStats } from '@/types';

/**
 * Storage temporal para MVP
 * En producción, esto será reemplazado por Supabase
 */

// In-memory storage para server-side
const serverStorage = new Map<string, any>();

class Storage {
  private isClient = typeof window !== 'undefined';

  private getItem(key: string): string | null {
    if (this.isClient) {
      return localStorage.getItem(key);
    } else {
      return serverStorage.get(key) || null;
    }
  }

  private setItem(key: string, value: string): void {
    if (this.isClient) {
      localStorage.setItem(key, value);
    } else {
      serverStorage.set(key, value);
    }
  }

  private removeItem(key: string): void {
    if (this.isClient) {
      localStorage.removeItem(key);
    } else {
      serverStorage.delete(key);
    }
  }

  // Alerts
  getAlerts(): Alert[] {
    const data = this.getItem('alerts');
    if (!data) return [];

    try {
      const alerts = JSON.parse(data);
      // Convertir fechas de string a Date
      return alerts.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        departDate: alert.departDate ? new Date(alert.departDate) : undefined,
        returnDate: alert.returnDate ? new Date(alert.returnDate) : undefined,
        lastChecked: alert.lastChecked ? new Date(alert.lastChecked) : undefined,
      }));
    } catch (error) {
      console.error('Error parsing alerts:', error);
      return [];
    }
  }

  saveAlert(alert: Alert): void {
    const alerts = this.getAlerts();
    const existingIndex = alerts.findIndex((a) => a.id === alert.id);

    if (existingIndex >= 0) {
      alerts[existingIndex] = alert;
    } else {
      alerts.push(alert);
    }

    this.setItem('alerts', JSON.stringify(alerts));
  }

  deleteAlert(id: string): void {
    const alerts = this.getAlerts();
    const filtered = alerts.filter((a) => a.id !== id);
    this.setItem('alerts', JSON.stringify(filtered));
  }

  getAlert(id: string): Alert | null {
    const alerts = this.getAlerts();
    return alerts.find((a) => a.id === id) || null;
  }

  // Price History
  getPriceHistory(route: string): PricePoint[] {
    const key = `price_history_${route}`;
    const data = this.getItem(key);
    if (!data) return [];

    try {
      const history = JSON.parse(data);
      return history.map((point: any) => ({
        ...point,
        date: new Date(point.date),
      }));
    } catch (error) {
      console.error('Error parsing price history:', error);
      return [];
    }
  }

  addPricePoint(route: string, price: number, currency: string = 'USD'): void {
    const history = this.getPriceHistory(route);
    const newPoint: PricePoint = {
      date: new Date(),
      price,
      currency,
    };

    history.push(newPoint);

    // Mantener solo últimos 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const filtered = history.filter((p) => p.date >= ninetyDaysAgo);

    const key = `price_history_${route}`;
    this.setItem(key, JSON.stringify(filtered));
  }

  // Flight Results (cache temporal)
  getCachedFlightResults(cacheKey: string): FlightResult[] | null {
    const key = `flight_cache_${cacheKey}`;
    const data = this.getItem(key);
    if (!data) return null;

    try {
      const cached = JSON.parse(data);
      const cacheTime = new Date(cached.timestamp);
      const now = new Date();

      // Cache válido por 5 minutos
      const fiveMinutes = 5 * 60 * 1000;
      if (now.getTime() - cacheTime.getTime() > fiveMinutes) {
        this.removeItem(key);
        return null;
      }

      return cached.results.map((result: any) => ({
        ...result,
        departTime: new Date(result.departTime),
        arriveTime: new Date(result.arriveTime),
      }));
    } catch (error) {
      console.error('Error parsing cached results:', error);
      return null;
    }
  }

  cacheFlightResults(cacheKey: string, results: FlightResult[]): void {
    const key = `flight_cache_${cacheKey}`;
    const cached = {
      timestamp: new Date().toISOString(),
      results,
    };
    this.setItem(key, JSON.stringify(cached));
  }

  // Route Stats
  getRouteStats(): RouteStats[] {
    const data = this.getItem('route_stats');
    if (!data) return [];

    try {
      const stats = JSON.parse(data);
      return stats.map((stat: any) => ({
        ...stat,
        lastUpdated: new Date(stat.lastUpdated),
        priceHistory: stat.priceHistory.map((p: any) => ({
          ...p,
          date: new Date(p.date),
        })),
      }));
    } catch (error) {
      console.error('Error parsing route stats:', error);
      return [];
    }
  }

  updateRouteStats(route: string, price: number): void {
    const allStats = this.getRouteStats();
    const existingIndex = allStats.findIndex((s) => s.route === route);

    const priceHistory = this.getPriceHistory(route);

    if (priceHistory.length === 0) {
      this.addPricePoint(route, price);
    }

    const prices = [...priceHistory.map((p) => p.price), price];
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const lowestPrice = Math.min(...prices);

    // Detectar tendencia simple
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (priceHistory.length >= 2) {
      const recent = priceHistory.slice(-5).map((p) => p.price);
      const older = priceHistory.slice(-10, -5).map((p) => p.price);

      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

        if (recentAvg > olderAvg * 1.05) {
          trend = 'rising';
        } else if (recentAvg < olderAvg * 0.95) {
          trend = 'falling';
        }
      }
    }

    const newStat: RouteStats = {
      route,
      currentPrice: price,
      lowestPrice30Days: lowestPrice,
      avgPrice30Days: Math.round(avgPrice),
      trend,
      lastUpdated: new Date(),
      priceHistory: priceHistory,
    };

    if (existingIndex >= 0) {
      allStats[existingIndex] = newStat;
    } else {
      allStats.push(newStat);
    }

    this.setItem('route_stats', JSON.stringify(allStats));
  }

  // Recent Searches
  getRecentSearches(): any[] {
    const data = this.getItem('recent_searches');
    if (!data) return [];

    try {
      const searches = JSON.parse(data);
      return searches.map((search: any) => ({
        ...search,
        departDate: new Date(search.departDate),
        returnDate: search.returnDate ? new Date(search.returnDate) : undefined,
      }));
    } catch (error) {
      console.error('Error parsing recent searches:', error);
      return [];
    }
  }

  addRecentSearch(search: any): void {
    const searches = this.getRecentSearches();
    searches.unshift(search);

    // Mantener solo las últimas 20 búsquedas
    const limited = searches.slice(0, 20);
    this.setItem('recent_searches', JSON.stringify(limited));
  }

  // Clear all data
  clearAll(): void {
    if (this.isClient) {
      localStorage.clear();
    } else {
      serverStorage.clear();
    }
  }
}

export const storage = new Storage();
