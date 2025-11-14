'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Calendar, Users, TrendingDown } from 'lucide-react';
import type { FlightSearchParams } from '@/types';

interface FlightSearchProps {
  onSearch: (params: FlightSearchParams) => void;
  loading?: boolean;
}

export function FlightSearch({ onSearch, loading = false }: FlightSearchProps) {
  const [origin, setOrigin] = useState('EZE');
  const [destination, setDestination] = useState('SFO');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [departMonth, setDepartMonth] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState<'economy' | 'business' | 'first'>('economy');
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [searchCheapest, setSearchCheapest] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Si busca fechas flexibles o más baratas, usar fecha aproximada o actual
    let searchDepartDate: Date;

    if (searchCheapest || flexibleDates) {
      if (departMonth) {
        // Usar el primer día del mes seleccionado
        searchDepartDate = new Date(departMonth + '-01');
      } else {
        // Usar fecha 30 días adelante por defecto
        searchDepartDate = new Date();
        searchDepartDate.setDate(searchDepartDate.getDate() + 30);
      }
    } else {
      if (!departDate) {
        alert('Por favor selecciona una fecha de ida o activa "Fechas flexibles"');
        return;
      }
      searchDepartDate = new Date(departDate);
    }

    const params: FlightSearchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate: searchDepartDate,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      passengers,
      class: flightClass,
      flexDays: searchCheapest ? 30 : flexibleDates ? 7 : 0,
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

          {/* Opciones de búsqueda flexible */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flexibleDates}
                onChange={(e) => {
                  setFlexibleDates(e.target.checked);
                  if (e.target.checked) setSearchCheapest(false);
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Fechas flexibles (±7 días)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchCheapest}
                onChange={(e) => {
                  setSearchCheapest(e.target.checked);
                  if (e.target.checked) setFlexibleDates(false);
                }}
                className="rounded border-gray-300"
              />
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Buscar fecha más barata (±30 días)</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de ida o mes */}
            <div className="space-y-2">
              <Label htmlFor={searchCheapest || flexibleDates ? "departMonth" : "departDate"} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {searchCheapest || flexibleDates ? 'Mes aproximado (opcional)' : 'Fecha de ida (opcional)'}
              </Label>
              {searchCheapest || flexibleDates ? (
                <Input
                  id="departMonth"
                  type="month"
                  value={departMonth}
                  onChange={(e) => setDepartMonth(e.target.value)}
                  min={new Date().toISOString().slice(0, 7)}
                  placeholder="Ej: 2025-03"
                />
              ) : (
                <Input
                  id="departDate"
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="Selecciona una fecha"
                />
              )}
              <p className="text-xs text-muted-foreground">
                {searchCheapest
                  ? 'Buscaremos el precio más bajo en ±30 días'
                  : flexibleDates
                  ? 'Buscaremos en ±7 días de esta fecha'
                  : 'Deja vacío para búsqueda general'}
              </p>
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
                min={departDate || new Date().toISOString().split('T')[0]}
                placeholder="Solo ida si vacío"
              />
              <p className="text-xs text-muted-foreground">
                Déjalo vacío para solo ida
              </p>
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
