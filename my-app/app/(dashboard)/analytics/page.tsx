'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PriceChart } from '@/components/price-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { PricePoint, RouteStats } from '@/types';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const routeParam = searchParams.get('route');

  const [route, setRoute] = useState(routeParam || 'EZE-SFO');
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [weekdayPatterns, setWeekdayPatterns] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeParam) {
      fetchPriceHistory(routeParam);
    }
  }, [routeParam]);

  const fetchPriceHistory = async (routeToFetch: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prices/history?route=${routeToFetch}`);
      const data = await response.json();

      if (data.success) {
        setPriceHistory(data.priceHistory || []);
        setRouteStats(data.stats);
        setWeekdayPatterns(data.weekdayPatterns);
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPriceHistory(route.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Analiza históricos de precios y patrones de rutas
        </p>
      </div>

      {/* Search form */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Ruta</CardTitle>
          <CardDescription>
            Ingresa una ruta para ver su histórico de precios (ej: EZE-SFO)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="route" className="sr-only">
                Ruta
              </Label>
              <Input
                id="route"
                placeholder="EZE-SFO"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="uppercase"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Price chart */}
          <PriceChart route={route.toUpperCase()} priceHistory={priceHistory} days={30} />

          {/* Weekday patterns */}
          {weekdayPatterns && (
            <Card>
              <CardHeader>
                <CardTitle>Patrones por Día de la Semana</CardTitle>
                <CardDescription>
                  Análisis de precios según el día de la semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                      <p className="text-sm text-muted-foreground">Día más barato</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-400">
                        {weekdayPatterns.cheapestDay}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                      <p className="text-sm text-muted-foreground">Día más caro</p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-400">
                        {weekdayPatterns.expensiveDay}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Precio promedio por día:</p>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(weekdayPatterns.dayAverages).map(([day, price]) => (
                        <div key={day} className="text-center p-2 border rounded">
                          <p className="text-xs text-muted-foreground">{day.slice(0, 3)}</p>
                          <p className="text-sm font-semibold">${price as number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}


export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
