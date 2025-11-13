'use client';

import { useState } from 'react';
import { FlightSearch } from '@/components/flight-search';
import { FlightResults } from '@/components/flight-search/FlightResults';
import type { FlightSearchParams, FlightResult, PriceAnalysis } from '@/types';

export default function SearchPage() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.success) {
        setFlights(data.flights || []);
        setAnalysis(data.analysis || null);
      } else {
        setError(data.error || 'Error al buscar vuelos');
        setFlights([]);
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Error searching flights:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
      setFlights([]);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buscar Vuelos</h1>
        <p className="text-muted-foreground">
          Encuentra los mejores precios en tiempo real
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <FlightSearch onSearch={handleSearch} loading={loading} />
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <FlightResults flights={flights} analysis={analysis} loading={loading} />
        </div>
      </div>
    </div>
  );
}
