'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCard } from '@/components/alert-card';
import { AlertForm } from '@/components/alert-card/AlertForm';
import { Plus } from 'lucide-react';
import type { Alert } from '@/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();

      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlert = async (alertData: Partial<Alert>) => {
    try {
      const url = editingAlert ? '/api/alerts' : '/api/alerts';
      const method = editingAlert ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAlert ? { id: editingAlert.id, ...alertData } : alertData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAlerts();
        setShowForm(false);
        setEditingAlert(null);
      }
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta alerta?')) return;

    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleToggleAlert = async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isActive: !alert.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setShowForm(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Alertas</h1>
          <p className="text-muted-foreground">
            Gestiona tus alertas de precio para recibir notificaciones
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAlert(null);
            setShowForm(!showForm);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Alerta
        </Button>
      </div>

      {showForm && (
        <AlertForm
          alert={editingAlert}
          onSave={handleSaveAlert}
          onCancel={() => {
            setShowForm(false);
            setEditingAlert(null);
          }}
        />
      )}

      {alerts.length === 0 ? (
        <div className="border-dashed border-2 rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No tienes alertas configuradas aún
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear mi primera alerta
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onEdit={handleEditAlert}
              onDelete={handleDeleteAlert}
              onToggle={handleToggleAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}
