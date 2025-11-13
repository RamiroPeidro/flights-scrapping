'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, X } from 'lucide-react';
import type { Alert } from '@/types';

interface AlertFormProps {
  alert?: Alert | null;
  onSave: (alert: Partial<Alert>) => void;
  onCancel: () => void;
}

export function AlertForm({ alert, onSave, onCancel }: AlertFormProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [flexDays, setFlexDays] = useState(0);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyTelegram, setNotifyTelegram] = useState(false);
  const [notifyBrowser, setNotifyBrowser] = useState(true);

  useEffect(() => {
    if (alert) {
      setOrigin(alert.origin);
      setDestination(alert.destination);
      setTargetPrice(alert.targetPrice.toString());
      setFlexDays(alert.flexDays);
      setDepartDate(alert.departDate ? alert.departDate.toISOString().split('T')[0] : '');
      setReturnDate(alert.returnDate ? alert.returnDate.toISOString().split('T')[0] : '');
      setNotifyEmail(alert.notificationSettings.email || false);
      setNotifyTelegram(alert.notificationSettings.telegram || false);
      setNotifyBrowser(alert.notificationSettings.browser || false);
    }
  }, [alert]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Alert> = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      route: `${origin.toUpperCase()}-${destination.toUpperCase()}`,
      targetPrice: parseFloat(targetPrice),
      flexDays,
      departDate: departDate ? new Date(departDate) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      notificationSettings: {
        email: notifyEmail,
        telegram: notifyTelegram,
        browser: notifyBrowser,
      },
    };

    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {alert ? 'Editar Alerta' : 'Nueva Alerta de Precio'}
            </CardTitle>
            <CardDescription>
              Recibe notificaciones cuando el precio baje del objetivo
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ruta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-origin">Origen</Label>
              <Input
                id="alert-origin"
                placeholder="EZE"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                maxLength={3}
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-destination">Destino</Label>
              <Input
                id="alert-destination"
                placeholder="SFO"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                maxLength={3}
                required
                className="uppercase"
              />
            </div>
          </div>

          {/* Precio objetivo */}
          <div className="space-y-2">
            <Label htmlFor="alert-price">Precio objetivo (USD)</Label>
            <Input
              id="alert-price"
              type="number"
              placeholder="800"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              min={1}
              step={1}
              required
            />
            <p className="text-xs text-muted-foreground">
              Te notificaremos cuando el precio esté por debajo de este valor
            </p>
          </div>

          {/* Flexibilidad de fechas */}
          <div className="space-y-2">
            <Label htmlFor="alert-flex">Flexibilidad de fechas (±días)</Label>
            <Input
              id="alert-flex"
              type="number"
              value={flexDays}
              onChange={(e) => setFlexDays(parseInt(e.target.value))}
              min={0}
              max={7}
            />
            <p className="text-xs text-muted-foreground">
              Buscar precios ±{flexDays} días de las fechas especificadas
            </p>
          </div>

          {/* Fechas (opcional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-depart">Fecha de ida (opcional)</Label>
              <Input
                id="alert-depart"
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-return">Fecha de vuelta (opcional)</Label>
              <Input
                id="alert-return"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Notificaciones */}
          <div className="space-y-2">
            <Label>Métodos de notificación</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyBrowser}
                  onChange={(e) => setNotifyBrowser(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Notificaciones del navegador</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Email (próximamente)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={notifyTelegram}
                  onChange={(e) => setNotifyTelegram(e.target.checked)}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Telegram (próximamente)</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {alert ? 'Actualizar Alerta' : 'Crear Alerta'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
