'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Calendar, Users } from 'lucide-react';
import type { FlightSearchParams } from '@/types';

interface FlightSearchProps {
  onSearch: (params: FlightSearchParams) => void;
  loading?: boolean;
}

export function FlightSearch({ onSearch, loading = false }: FlightSearchProps) {
  const [origin, setOrigin] = useState('EZE');
  const [destination, setDestination] = useState('SFO');
  const [departDate, setDepartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 37);
    return date.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState<'economy' | 'business' | 'first'>('economy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: FlightSearchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate: new Date(departDate),
      returnDate: returnDate ? new Date(returnDate) : undefined,
      passengers,
      class: flightClass,
      flexDays: 0,
    };

    onSearch(params);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Buscar Vuelos
        </CardTitle>
        <CardDescription>
          Encuentra los mejores precios para tu próximo viaje
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origen */}
            <div className="space-y-2">
              <Label htmlFor="origin">Origen</Label>
              <Input
                id="origin"
                placeholder="EZE (Buenos Aires)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                maxLength={3}
                required
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Código IATA de 3 letras
              </p>
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destino</Label>
              <Input
                id="destination"
                placeholder="SFO (San Francisco)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                maxLength={3}
                required
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Código IATA de 3 letras
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de ida */}
            <div className="space-y-2">
              <Label htmlFor="departDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de ida
              </Label>
              <Input
                id="departDate"
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Fecha de vuelta */}
            <div className="space-y-2">
              <Label htmlFor="returnDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de vuelta (opcional)
              </Label>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pasajeros */}
            <div className="space-y-2">
              <Label htmlFor="passengers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pasajeros
              </Label>
              <Input
                id="passengers"
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                required
              />
            </div>

            {/* Clase */}
            <div className="space-y-2">
              <Label htmlFor="class">Clase</Label>
              <select
                id="class"
                value={flightClass}
                onChange={(e) => setFlightClass(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="economy">Económica</option>
                <option value="business">Ejecutiva</option>
                <option value="first">Primera</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Buscando vuelos...
              </>
            ) : (
              <>
                <Plane className="mr-2 h-4 w-4" />
                Buscar Vuelos
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
