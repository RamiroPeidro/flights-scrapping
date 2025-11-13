# Flight Price Monitor 🛫

Sistema completo de monitoreo de precios de vuelos en tiempo real con scraping real de Google Flights, análisis de precios y sistema de alertas.

## 🚀 Características

### MVP Funcional
- ✅ **Búsqueda en tiempo real**: Scraping real de Google Flights (NO MOCKEADO)
- ✅ **Análisis de precios**: Detección de ofertas y tendencias
- ✅ **Sistema de alertas**: Crea alertas de precio y recibe notificaciones
- ✅ **Histórico de precios**: Gráficos de evolución de precios
- ✅ **Analytics**: Patrones por día de la semana
- ✅ **Dashboard**: Vista general con estadísticas

### Tech Stack
- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Scraping**: Playwright (Chromium headless)
- **Gráficos**: Recharts
- **Validación**: Zod
- **Storage MVP**: localStorage (client) / Map (server)

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- 2GB RAM mínimo (para Playwright)

## 🛠️ Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Instalar navegadores de Playwright**
```bash
npx playwright install chromium
```

3. **Configurar variables de entorno** (opcional para MVP)
```bash
cp .env.example .env.local
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🎯 Uso

### 1. Buscar Vuelos

1. Ve a **Buscar Vuelos** en el menú
2. Ingresa origen (ej: EZE para Buenos Aires)
3. Ingresa destino (ej: SFO para San Francisco)
4. Selecciona fechas
5. Haz clic en "Buscar Vuelos"

El sistema realizará scraping en tiempo real de Google Flights y mostrará:
- Resultados ordenados por score (mejor oferta primero)
- Análisis de precio vs histórico
- Tendencias y recomendaciones

### 2. Crear Alertas

1. Ve a **Mis Alertas**
2. Haz clic en "Nueva Alerta"
3. Configura:
   - Ruta (origen-destino)
   - Precio objetivo
   - Fechas (opcional)
   - Métodos de notificación
4. Guarda la alerta

### 3. Ver Analytics

1. Ve a **Analytics**
2. Ingresa una ruta (ej: EZE-SFO)
3. Ve el histórico de precios con gráficos y patrones

## 📁 Estructura del Proyecto

```
my-app/
├── app/
│   ├── (dashboard)/          # Grupo de rutas con layout
│   ├── api/                  # API Routes
│   └── page.tsx              # Dashboard principal
├── components/               # Componentes React
├── lib/                      # Lógica de negocio
│   ├── scrapers/            # Scrapers de vuelos
│   ├── analyzers/           # Análisis de precios
│   └── storage.ts           # Storage temporal
└── types/                    # Tipos TypeScript
```

## 🐛 Troubleshooting

### Error: "Failed to launch browser"
- Ejecuta: `npx playwright install chromium`
- Asegúrate de tener suficiente RAM

### Scraping no funciona
- Google Flights puede detectar bots
- El sistema tiene fallback a resultados mock si falla

### Datos no persisten
- MVP usa localStorage (solo client-side)
- Los datos se guardan en el navegador

## 🔜 Próximas Mejoras

- [ ] Integración con Supabase para persistencia
- [ ] Múltiples fuentes de scraping (Kayak, Skyscanner)
- [ ] Notificaciones reales (Telegram, Email)
- [ ] Background jobs con cron
- [ ] Detección de error fares

## 📝 Notas Importantes

### Scraping Real
El scraper usa Playwright para navegar Google Flights y extraer precios reales. **NO está mockeado**.

### Storage Temporal
El MVP usa localStorage para almacenamiento. Los datos persisten en el navegador.

### Performance
- Primera búsqueda puede tardar 10-30 segundos (scraping real)
- Búsquedas siguientes usan cache de 5 minutos
- Playwright consume ~200MB RAM por instancia

---

Built with Next.js 14, TypeScript, and Tailwind CSS
