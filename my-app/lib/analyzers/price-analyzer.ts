import type { FlightResult, PriceAnalysis, PricePoint } from '@/types';

export class PriceAnalyzer {
  /**
   * Analiza el precio actual comparándolo con el histórico
   */
  static analyze(
    currentPrice: number,
    priceHistory: PricePoint[]
  ): PriceAnalysis {
    if (priceHistory.length === 0) {
      // Sin histórico, retornar análisis básico
      return {
        currentPrice,
        avgPrice30Days: currentPrice,
        minPrice30Days: currentPrice,
        maxPrice30Days: currentPrice,
        percentageVsAvg: 0,
        trend: 'stable',
        prediction7Days: 'stable',
        isGoodDeal: false,
        dealScore: 50,
        alertTrigger: false,
      };
    }

    // Filtrar últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent30Days = priceHistory.filter(
      (p) => new Date(p.date) >= thirtyDaysAgo
    );

    if (recent30Days.length === 0) {
      return this.analyze(currentPrice, []);
    }

    const prices = recent30Days.map((p) => p.price);
    const avgPrice30Days = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice30Days = Math.min(...prices);
    const maxPrice30Days = Math.max(...prices);

    const percentageVsAvg = ((currentPrice - avgPrice30Days) / avgPrice30Days) * 100;

    // Detectar tendencia (últimos 7 días vs previos 7 días)
    const trend = this.detectTrend(recent30Days);

    // Predicción basada en tendencia y estacionalidad
    const prediction7Days = this.predictPriceMovement(recent30Days, trend);

    // Determinar si es buen deal
    const isGoodDeal = this.isGoodDeal(currentPrice, avgPrice30Days, minPrice30Days);

    // Calcular deal score (0-100)
    const dealScore = this.calculateDealScore(
      currentPrice,
      avgPrice30Days,
      minPrice30Days,
      maxPrice30Days
    );

    // Determinar si debe disparar alerta
    const alertTrigger = isGoodDeal && dealScore >= 70;

    return {
      currentPrice,
      avgPrice30Days: Math.round(avgPrice30Days),
      minPrice30Days,
      maxPrice30Days,
      percentageVsAvg: Math.round(percentageVsAvg * 10) / 10,
      trend,
      prediction7Days,
      isGoodDeal,
      dealScore,
      alertTrigger,
    };
  }

  /**
   * Detecta la tendencia de precio
   */
  private static detectTrend(
    priceHistory: PricePoint[]
  ): 'rising' | 'falling' | 'stable' {
    if (priceHistory.length < 7) {
      return 'stable';
    }

    // Comparar últimos 7 días vs previos 7 días
    const sortedHistory = [...priceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const last7Days = sortedHistory.slice(0, 7);
    const previous7Days = sortedHistory.slice(7, 14);

    if (previous7Days.length === 0) {
      return 'stable';
    }

    const avgLast7 =
      last7Days.reduce((sum, p) => sum + p.price, 0) / last7Days.length;
    const avgPrevious7 =
      previous7Days.reduce((sum, p) => sum + p.price, 0) / previous7Days.length;

    const difference = avgLast7 - avgPrevious7;
    const percentageDiff = (difference / avgPrevious7) * 100;

    if (percentageDiff > 5) {
      return 'rising';
    } else if (percentageDiff < -5) {
      return 'falling';
    } else {
      return 'stable';
    }
  }

  /**
   * Predice el movimiento de precio para los próximos 7 días
   */
  private static predictPriceMovement(
    priceHistory: PricePoint[],
    currentTrend: 'rising' | 'falling' | 'stable'
  ): 'likely_drop' | 'likely_rise' | 'stable' {
    // Predicción simple basada en tendencia actual
    // En una implementación real, se usaría ML o análisis más sofisticado

    if (currentTrend === 'falling') {
      // Si está cayendo, es probable que siga cayendo o se estabilice
      return 'likely_drop';
    } else if (currentTrend === 'rising') {
      // Si está subiendo, es probable que siga subiendo
      return 'likely_rise';
    } else {
      // Si está estable, analizar variabilidad
      const prices = priceHistory.map((p) => p.price);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance =
        prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) /
        prices.length;
      const stdDev = Math.sqrt(variance);

      // Si la variabilidad es alta, es más probable que haya cambios
      if (stdDev > avg * 0.15) {
        return 'likely_drop'; // Optimista: esperamos que baje
      }

      return 'stable';
    }
  }

  /**
   * Determina si el precio actual es un buen deal
   */
  private static isGoodDeal(
    currentPrice: number,
    avgPrice: number,
    minPrice: number
  ): boolean {
    // Es buen deal si está en el 25% inferior de precios
    // o al menos 15% por debajo del promedio
    const percentilThreshold = minPrice + (avgPrice - minPrice) * 0.25;
    const avgThreshold = avgPrice * 0.85;

    return currentPrice <= percentilThreshold || currentPrice <= avgThreshold;
  }

  /**
   * Calcula un score de 0-100 indicando qué tan buena es la oferta
   */
  private static calculateDealScore(
    currentPrice: number,
    avgPrice: number,
    minPrice: number,
    maxPrice: number
  ): number {
    const range = maxPrice - minPrice;

    if (range === 0) {
      return 50; // Sin variación, score neutral
    }

    // Score basado en posición dentro del rango
    const position = (maxPrice - currentPrice) / range;
    let score = position * 100;

    // Bonus si está por debajo del promedio
    if (currentPrice < avgPrice) {
      const belowAvgPercentage = ((avgPrice - currentPrice) / avgPrice) * 100;
      score += belowAvgPercentage * 0.5;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Detecta "error fares" - precios anormalmente bajos
   */
  static detectErrorFare(
    currentPrice: number,
    priceHistory: PricePoint[]
  ): boolean {
    if (priceHistory.length < 5) {
      return false;
    }

    const prices = priceHistory.map((p) => p.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);

    // Error fare si está más de 50% por debajo del promedio
    // o más de 30% por debajo del mínimo histórico
    return (
      currentPrice < avg * 0.5 ||
      (min > 0 && currentPrice < min * 0.7)
    );
  }

  /**
   * Analiza múltiples vuelos y retorna el mejor
   */
  static findBestDeal(flights: FlightResult[]): FlightResult | null {
    if (flights.length === 0) {
      return null;
    }

    // Ordenar por scoreValue
    const sorted = [...flights].sort((a, b) => b.scoreValue - a.scoreValue);

    return sorted[0];
  }

  /**
   * Detecta patrones de precio por día de la semana
   */
  static analyzeWeekdayPatterns(priceHistory: PricePoint[]): {
    cheapestDay: string;
    expensiveDay: string;
    dayAverages: Record<string, number>;
  } {
    const dayNames = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];

    const dayPrices: Record<number, number[]> = {};

    priceHistory.forEach((point) => {
      const day = new Date(point.date).getDay();
      if (!dayPrices[day]) {
        dayPrices[day] = [];
      }
      dayPrices[day].push(point.price);
    });

    const dayAverages: Record<string, number> = {};
    let cheapestDay = '';
    let expensiveDay = '';
    let lowestAvg = Infinity;
    let highestAvg = 0;

    Object.entries(dayPrices).forEach(([day, prices]) => {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const dayName = dayNames[parseInt(day)];
      dayAverages[dayName] = Math.round(avg);

      if (avg < lowestAvg) {
        lowestAvg = avg;
        cheapestDay = dayName;
      }

      if (avg > highestAvg) {
        highestAvg = avg;
        expensiveDay = dayName;
      }
    });

    return {
      cheapestDay,
      expensiveDay,
      dayAverages,
    };
  }
}
