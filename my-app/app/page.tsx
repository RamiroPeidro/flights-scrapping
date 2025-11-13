'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, Plane, Bell, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import type { DashboardStats, RouteStats, Alert } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [routes, setRoutes] = useState<RouteStats[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRoutes(data.routes || []);
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitorea precios de vuelos y recibe alertas de ofertas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {stats?.totalAlerts || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rutas Monitoreadas</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.routesMonitored || 0}</div>
            <p className="text-xs text-muted-foreground">
              rutas con histórico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averagePrice ? formatCurrency(stats.averagePrice) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              todas las rutas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Oferta Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.bestDealToday ? formatCurrency(stats.bestDealToday.price) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.bestDealToday?.route || 'No hay datos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Empieza a buscar vuelos o crear alertas de precio
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Link href="/search" className="flex-1">
            <Button className="w-full" size="lg">
              <SearchIcon className="mr-2 h-5 w-5" />
              Buscar Vuelos
            </Button>
          </Link>
          <Link href="/alerts" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <Bell className="mr-2 h-5 w-5" />
              Crear Alerta
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Routes */}
      {routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rutas Monitoreadas</CardTitle>
            <CardDescription>
              Tus rutas con histórico de precios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routes.slice(0, 5).map((route) => (
                <div
                  key={route.route}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{route.route}</p>
                    <p className="text-sm text-muted-foreground">
                      Precio actual: {formatCurrency(route.currentPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        route.trend === 'falling' ? 'success' :
                        route.trend === 'rising' ? 'destructive' : 'secondary'
                      }
                    >
                      {route.trend === 'falling' ? '↓ Bajando' :
                       route.trend === 'rising' ? '↑ Subiendo' : '→ Estable'}
                    </Badge>
                    <Link href={`/analytics?route=${route.route}`}>
                      <Button variant="ghost" size="sm">
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Activas</CardTitle>
            <CardDescription>
              Tus alertas de precio configuradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{alert.route}</p>
                    <p className="text-sm text-muted-foreground">
                      Objetivo: {formatCurrency(alert.targetPrice)}
                      {alert.currentPrice && (
                        <span className="ml-2">
                          • Actual: {formatCurrency(alert.currentPrice)}
                        </span>
                      )}
                    </p>
                  </div>
                  <Link href="/alerts">
                    <Button variant="ghost" size="sm">
                      Gestionar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome message for new users */}
      {routes.length === 0 && alerts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Plane className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              ¡Bienvenido a Flight Price Monitor!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empieza buscando vuelos para ver precios en tiempo real y crea alertas
              para recibir notificaciones cuando los precios bajen.
            </p>
            <Link href="/search">
              <Button size="lg">
                <SearchIcon className="mr-2 h-5 w-5" />
                Buscar mi primer vuelo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
