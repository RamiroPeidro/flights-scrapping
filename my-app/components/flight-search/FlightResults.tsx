'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Clock, TrendingDown, TrendingUp, Minus, ExternalLink } from 'lucide-react';
import type { FlightResult, PriceAnalysis } from '@/types';
import { formatCurrency, formatDuration, formatDate } from '@/lib/utils';

interface FlightResultsProps {
  flights: FlightResult[];
  analysis?: PriceAnalysis | null;
  loading?: boolean;
}

export function FlightResults({ flights, analysis, loading = false }: FlightResultsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Buscando los mejores precios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Plane className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Realiza una búsqueda para ver resultados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'success' as const, label: 'Excelente oferta' };
    if (score >= 60) return { variant: 'default' as const, label: 'Buen precio' };
    if (score >= 40) return { variant: 'secondary' as const, label: 'Precio normal' };
    return { variant: 'warning' as const, label: 'Precio alto' };
  };

  const getStopsText = (stops: number) => {
    if (stops === 0) return 'Directo';
    if (stops === 1) return '1 escala';
    return `${stops} escalas`;
  };

  return (
    <div className="space-y-6">
      {/* Análisis de precios */}
      {analysis && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {analysis.trend === 'falling' && <TrendingDown className="h-5 w-5 text-green-500" />}
              {analysis.trend === 'rising' && <TrendingUp className="h-5 w-5 text-red-500" />}
              {analysis.trend === 'stable' && <Minus className="h-5 w-5 text-blue-500" />}
              Análisis de Precios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Precio Actual</p>
                <p className="text-2xl font-bold">{formatCurrency(analysis.currentPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio 30 días</p>
                <p className="text-2xl font-bold">{formatCurrency(analysis.avgPrice30Days)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mínimo 30 días</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analysis.minPrice30Days)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tendencia</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      analysis.trend === 'falling' ? 'success' :
                      analysis.trend === 'rising' ? 'destructive' : 'secondary'
                    }
                  >
                    {analysis.trend === 'falling' ? 'Bajando' :
                     analysis.trend === 'rising' ? 'Subiendo' : 'Estable'}
                  </Badge>
                </div>
              </div>
            </div>

            {analysis.isGoodDeal && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  🎉 ¡Excelente momento para comprar! El precio está {Math.abs(analysis.percentageVsAvg).toFixed(1)}% por debajo del promedio.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de vuelos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {flights.length} {flights.length === 1 ? 'Vuelo encontrado' : 'Vuelos encontrados'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {flights.map((flight) => {
            const scoreBadge = getScoreBadge(flight.scoreValue);

            return (
              <div
                key={flight.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Información del vuelo */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{flight.airline}</h3>
                      <Badge variant={scoreBadge.variant}>
                        {scoreBadge.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(flight.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Plane className="h-4 w-4" />
                        <span>{getStopsText(flight.stops)}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Salida: </span>
                      <span className="font-medium">{formatDate(flight.departTime)}</span>
                    </div>
                  </div>

                  {/* Precio y acción */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(flight.price, flight.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {flight.scoreValue}/100
                      </p>
                    </div>

                    <Button
                      onClick={() => window.open(flight.bookingUrl, '_blank')}
                      variant="default"
                    >
                      Ver detalles
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
