'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { PricePoint } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PriceChartProps {
  route: string;
  priceHistory: PricePoint[];
  days?: 30 | 60 | 90;
  showPrediction?: boolean;
  highlightDeals?: boolean;
}

export function PriceChart({
  route,
  priceHistory,
  days = 30,
  showPrediction = false,
  highlightDeals = true,
}: PriceChartProps) {
  if (priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Precios - {route}</CardTitle>
          <CardDescription>Últimos {days} días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No hay datos históricos disponibles aún
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar por días
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filteredData = priceHistory
    .filter((p) => new Date(p.date) >= cutoffDate)
    .map((p) => ({
      date: new Date(p.date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
      price: p.price,
      fullDate: new Date(p.date),
    }))
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Precios - {route}</CardTitle>
          <CardDescription>Últimos {days} días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No hay suficientes datos para este período
          </div>
        </CardContent>
      </Card>
    );
  }

  const prices = filteredData.map((d) => d.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].value === minPrice && (
            <p className="text-xs text-green-600 font-medium">Precio mínimo</p>
          )}
          {payload[0].value === maxPrice && (
            <p className="text-xs text-red-600 font-medium">Precio máximo</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Precios - {route}</CardTitle>
        <CardDescription>
          Últimos {days} días • Promedio: {formatCurrency(avgPrice)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Mínimo</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(minPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Promedio</p>
            <p className="text-lg font-bold">{formatCurrency(avgPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Máximo</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(maxPrice)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
