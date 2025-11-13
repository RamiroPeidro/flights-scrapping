'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Trash2, Edit } from 'lucide-react';
import type { Alert } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function AlertCard({ alert, onEdit, onDelete, onToggle }: AlertCardProps) {
  const isPriceBelow = alert.currentPrice && alert.currentPrice <= alert.targetPrice;

  return (
    <Card className={isPriceBelow ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">{alert.route}</span>
              {alert.isActive ? (
                <Badge variant="success">
                  <Bell className="h-3 w-3 mr-1" />
                  Activa
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <BellOff className="h-3 w-3 mr-1" />
                  Pausada
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {alert.origin} → {alert.destination}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(alert.id)}
              title={alert.isActive ? 'Pausar alerta' : 'Activar alerta'}
            >
              {alert.isActive ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(alert)}
              title="Editar alerta"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(alert.id)}
              title="Eliminar alerta"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Precio objetivo vs actual */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Precio objetivo</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(alert.targetPrice)}
              </p>
            </div>
            {alert.currentPrice && (
              <div>
                <p className="text-sm text-muted-foreground">Precio actual</p>
                <p className={`text-2xl font-bold ${isPriceBelow ? 'text-green-600' : ''}`}>
                  {formatCurrency(alert.currentPrice)}
                </p>
              </div>
            )}
          </div>

          {/* Mensaje de alerta */}
          {isPriceBelow && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                🎉 ¡El precio está por debajo de tu objetivo!
              </p>
            </div>
          )}

          {/* Fechas */}
          {alert.departDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Fecha de viaje: </span>
              <span className="font-medium">{formatDate(alert.departDate)}</span>
              {alert.returnDate && (
                <>
                  <span className="text-muted-foreground"> - </span>
                  <span className="font-medium">{formatDate(alert.returnDate)}</span>
                </>
              )}
            </div>
          )}

          {/* Configuración de notificaciones */}
          <div className="flex flex-wrap gap-2">
            {alert.notificationSettings.email && (
              <Badge variant="outline">📧 Email</Badge>
            )}
            {alert.notificationSettings.telegram && (
              <Badge variant="outline">💬 Telegram</Badge>
            )}
            {alert.notificationSettings.browser && (
              <Badge variant="outline">🔔 Browser</Badge>
            )}
          </div>

          {/* Última verificación */}
          {alert.lastChecked && (
            <p className="text-xs text-muted-foreground">
              Última verificación: {formatDate(alert.lastChecked)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
