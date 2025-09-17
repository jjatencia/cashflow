import { projectId, publicAnonKey } from '../utils/supabase/info';
import { authService } from './authService';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fac344bb`;

interface DailyRecord {
  id: string;
  date: string;
  location: string;
  user: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  datafoneSales: number;
  finalCashCount: number;
}

interface Movement {
  id: string;
  date: string;
  location: string;
  type: 'entrada' | 'salida';
  amount: number;
  reason: string;
  user: string;
  timestamp: string;
}

interface VentasData {
  efectivo: number;
  tarjeta: number;
}

const getHeaders = async () => {
  const session = await authService.getCurrentSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.accessToken || publicAnonKey}`
  };
};

// Mapeo de ubicaciones a IDs de sucursal
const SUCURSAL_IDS = {
  "Parets del Vallès": "parets",
  "Lliçà d'Amunt": "llica"
};


export const cashFlowService = {
  // Daily Records
  async getDailyRecord(location: string, date: string): Promise<DailyRecord | null> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/daily-record/${encodeURIComponent(location)}/${date}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily record');
      }
      
      const data = await response.json();
      return data.record;
    } catch (error) {
      console.error('Error fetching daily record:', error);
      throw error;
    }
  },

  async saveDailyRecord(record: DailyRecord): Promise<void> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/daily-record`, {
        method: 'POST',
        headers,
        body: JSON.stringify(record)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save daily record');
      }
    } catch (error) {
      console.error('Error saving daily record:', error);
      throw error;
    }
  },

  async deleteDailyRecord(location: string, date: string): Promise<void> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/daily-record/${encodeURIComponent(location)}/${date}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete daily record');
      }
    } catch (error) {
      console.error('Error deleting daily record:', error);
      throw error;
    }
  },

  // Movements
  async getMovements(location: string, date: string): Promise<Movement[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/movements/${encodeURIComponent(location)}/${date}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch movements');
      }
      
      const data = await response.json();
      return data.movements;
    } catch (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
  },

  async saveMovements(location: string, date: string, movements: Movement[]): Promise<void> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/movements`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ location, date, movements })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save movements');
      }
    } catch (error) {
      console.error('Error saving movements:', error);
      throw error;
    }
  },

  // Records History
  async getRecordsHistory(location: string): Promise<DailyRecord[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/records/${encodeURIComponent(location)}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch records history');
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error('Error fetching records history:', error);
      throw error;
    }
  },

  // Ventas del día
  async getVentasDelDia(location: string, fecha: string): Promise<VentasData> {
    try {
      const sucursalId = SUCURSAL_IDS[location as keyof typeof SUCURSAL_IDS];
      if (!sucursalId) {
        throw new Error(`Sucursal no encontrada: ${location}`);
      }

      const response = await fetch(`https://api.exora.app/api/ventas/dia/total-ventas?fecha=${fecha}&sucursal=${sucursalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ventas del día');
      }

      const data = await response.json();

      return {
        efectivo: data.efectivo || 0,
        tarjeta: data.tarjeta || 0
      };
    } catch (error) {
      console.error('Error fetching ventas del día:', error);
      throw error;
    }
  }
};