import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Alert } from '@/types';
import { z } from 'zod';

// Schema de validación
const alertSchema = z.object({
  route: z.string(),
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  targetPrice: z.number().positive(),
  flexDays: z.number().min(0).max(7).default(0),
  departDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  returnDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  notificationSettings: z.object({
    email: z.boolean().optional(),
    telegram: z.boolean().optional(),
    browser: z.boolean().optional(),
  }).optional(),
});

// GET - Obtener todas las alertas
export async function GET() {
  try {
    const alerts = storage.getAlerts();

    return NextResponse.json({
      success: true,
      alerts: alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get alerts',
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva alerta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = alertSchema.parse(body);

    // Crear nueva alerta
    const newAlert: Alert = {
      id: generateId(),
      route: validatedData.route,
      origin: validatedData.origin,
      destination: validatedData.destination,
      targetPrice: validatedData.targetPrice,
      flexDays: validatedData.flexDays,
      departDate: validatedData.departDate,
      returnDate: validatedData.returnDate,
      isActive: true,
      notificationSettings: validatedData.notificationSettings || {
        email: false,
        telegram: false,
        browser: true,
      },
      createdAt: new Date(),
    };

    storage.saveAlert(newAlert);

    console.log('✅ Alert created:', newAlert.id);

    return NextResponse.json({
      success: true,
      alert: newAlert,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alert data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
      },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar alerta
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert ID is required',
        },
        { status: 400 }
      );
    }

    const existingAlert = storage.getAlert(id);

    if (!existingAlert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    // Actualizar alerta
    const updatedAlert: Alert = {
      ...existingAlert,
      ...updates,
      id, // Mantener el ID original
    };

    storage.saveAlert(updatedAlert);

    console.log('✅ Alert updated:', id);

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
    });
  } catch (error) {
    console.error('Error updating alert:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update alert',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar alerta
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert ID is required',
        },
        { status: 400 }
      );
    }

    const existingAlert = storage.getAlert(id);

    if (!existingAlert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
        },
        { status: 404 }
      );
    }

    storage.deleteAlert(id);

    console.log('✅ Alert deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete alert',
      },
      { status: 500 }
    );
  }
}
