import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Edit2, Trash2, Calendar, History } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cashFlowService } from '../services/cashFlowService';

// Component for individual record row
function RecordRow({ 
  record, 
  onEdit, 
  onDelete, 
  getCashDifference, 
  getCardDifference 
}: {
  record: DailyRecord;
  onEdit: (record: DailyRecord) => void;
  onDelete: (record: DailyRecord) => void;
  getCashDifference: () => Promise<number>;
  getCardDifference: () => number;
}) {
  const [cashDiff, setCashDiff] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DailyRecord>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCashDifference().then(setCashDiff);
  }, [record]);

  const cardDiff = getCardDifference();
  const isBalanced = cashDiff === 0 && cardDiff === 0;

  const handleEdit = () => {
    setEditForm(record);
    onEdit(record);
  };

  // Función para manejar el focus en inputs numéricos
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleccionar todo el texto cuando el input recibe focus
    e.target.select();
  };

  // Función para interceptar teclas en inputs de importe
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const currentValue = input.value;
    
    // Si el valor actual es exactamente "0" y el usuario presiona un dígito del 1-9
    if (currentValue === '0' && /[1-9]/.test(e.key)) {
      e.preventDefault();
      const fieldName = input.getAttribute('data-field');
      if (fieldName) {
        setEditForm({...editForm, [fieldName]: parseFloat(e.key) || 0});
      }
    }
  };

  // Función para manejar cambios en inputs con mejor UX
  const handleAmountChange = (value: string, fieldName: string) => {
    // Si está vacío, setear a 0
    if (value === '') {
      setEditForm({...editForm, [fieldName]: 0});
      return;
    }

    // Si el valor empieza con "0" seguido de un dígito (como "01", "02", etc.)
    // PERO NO si empieza con "0." (decimales válidos)
    let cleanValue = value;
    if (/^0[1-9]/.test(value)) {
      cleanValue = value.substring(1);
    }

    setEditForm({...editForm, [fieldName]: parseFloat(cleanValue) || 0});
  };

  const handleUpdate = async () => {
    if (!editForm || loading) return;

    const updatedRecord = {
      ...record,
      ...editForm,
      openingCash: parseFloat(editForm.openingCash?.toString() || '0'),
      cashSales: parseFloat(editForm.cashSales?.toString() || '0'),
      cardSales: parseFloat(editForm.cardSales?.toString() || '0'),
      datafoneSales: parseFloat(editForm.datafoneSales?.toString() || '0'),
      finalCashCount: parseFloat(editForm.finalCashCount?.toString() || '0'),
    };

    try {
      setLoading(true);
      await cashFlowService.saveDailyRecord(updatedRecord);
      // Reload the parent component
      window.location.reload();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Error al actualizar el registro. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        {new Date(record.date).toLocaleDateString('es-ES')}
      </TableCell>
      <TableCell>{record.user}</TableCell>
      <TableCell>{record.cashSales.toFixed(2)}€</TableCell>
      <TableCell>{record.cardSales.toFixed(2)}€</TableCell>
      <TableCell className={cashDiff === 0 ? 'text-green-600' : 'text-red-600'}>
        {cashDiff !== null ? `${cashDiff.toFixed(2)}€` : 'Calculando...'}
      </TableCell>
      <TableCell className={cardDiff === 0 ? 'text-green-600' : 'text-red-600'}>
        {cardDiff.toFixed(2)}€
      </TableCell>
      <TableCell>
        <Badge variant={isBalanced ? 'default' : 'destructive'}>
          {cashDiff !== null ? (isBalanced ? 'OK' : 'Diferencias') : 'Calculando...'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Registro - {new Date(record.date).toLocaleDateString('es-ES')}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="body-text">Caja inicial (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.openingCash?.toString() || ''}
                    onChange={(e) => handleAmountChange(e.target.value, 'openingCash')}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    data-field="openingCash"
                    placeholder="0.00"
                    className="body-text"
                  />
                </div>
                <div>
                  <Label className="body-text">Ventas efectivo (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.cashSales?.toString() || ''}
                    onChange={(e) => handleAmountChange(e.target.value, 'cashSales')}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    data-field="cashSales"
                    placeholder="0.00"
                    className="body-text"
                  />
                </div>
                <div>
                  <Label className="body-text">Ventas tarjeta (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.cardSales?.toString() || ''}
                    onChange={(e) => handleAmountChange(e.target.value, 'cardSales')}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    data-field="cardSales"
                    placeholder="0.00"
                    className="body-text"
                  />
                </div>
                <div>
                  <Label className="body-text">Datáfono (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.datafoneSales?.toString() || ''}
                    onChange={(e) => handleAmountChange(e.target.value, 'datafoneSales')}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    data-field="datafoneSales"
                    placeholder="0.00"
                    className="body-text"
                  />
                </div>
                <div>
                  <Label className="body-text">Conteo final (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.finalCashCount?.toString() || ''}
                    onChange={(e) => handleAmountChange(e.target.value, 'finalCashCount')}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    data-field="finalCashCount"
                    placeholder="0.00"
                    className="body-text"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" disabled={loading} className="button-text">
                  Cancelar
                </Button>
                <Button onClick={handleUpdate} disabled={loading} className="button-text">
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará el registro del {new Date(record.date).toLocaleDateString('es-ES')} permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(record)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface RecordsHistoryProps {
  location: string;
}

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

export function RecordsHistory({ location }: RecordsHistoryProps) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DailyRecord[]>([]);
  const [filterPeriod, setFilterPeriod] = useState('all');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [location]);

  useEffect(() => {
    filterRecords();
  }, [records, filterPeriod]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const locationRecords = await cashFlowService.getRecordsHistory(location);
      const sortedRecords = locationRecords.sort((a: DailyRecord, b: DailyRecord) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;
    const today = new Date();
    
    switch (filterPeriod) {
      case 'today':
        filtered = records.filter(r => r.date === today.toISOString().split('T')[0]);
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = records.filter(r => new Date(r.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = records.filter(r => new Date(r.date) >= monthAgo);
        break;
      default:
        filtered = records;
    }
    
    setFilteredRecords(filtered);
  };

  const getMovementsForDate = async (date: string): Promise<Movement[]> => {
    try {
      return await cashFlowService.getMovements(location, date);
    } catch (error) {
      console.error('Error getting movements for date:', error);
      return [];
    }
  };

  const calculateExpectedCash = async (record: DailyRecord): Promise<number> => {
    const movements = await getMovementsForDate(record.date);
    const totalMovements = movements.reduce((acc: number, movement: Movement) => {
      return acc + (movement.type === 'entrada' ? movement.amount : -movement.amount);
    }, 0);
    return record.openingCash + record.cashSales + totalMovements;
  };

  const getCashDifference = async (record: DailyRecord): Promise<number> => {
    const expected = await calculateExpectedCash(record);
    return record.finalCashCount - expected;
  };

  const getCardDifference = (record: DailyRecord) => {
    return record.cardSales - record.datafoneSales;
  };

  const handleEditRecord = (record: DailyRecord) => {
    // This will be handled by the RecordRow component
  };

  const handleDeleteRecord = async (record: DailyRecord) => {
    try {
      setLoading(true);
      await cashFlowService.deleteDailyRecord(record.location, record.date);
      await loadRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el registro. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getTotals = () => {
    return filteredRecords.reduce((acc, record) => ({
      cashSales: acc.cashSales + record.cashSales,
      cardSales: acc.cardSales + record.cardSales,
      totalSales: acc.totalSales + record.cashSales + record.cardSales,
      cashDifferences: acc.cashDifferences + getCashDifference(record),
      cardDifferences: acc.cardDifferences + getCardDifference(record)
    }), {
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      cashDifferences: 0,
      cardDifferences: 0
    });
  };

  const totals = getTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-blue-600" />
        <h2>Historial de Registros</h2>
      </div>

      {/* Filtros y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="period-filter">Período</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredRecords.length} registros de {records.length} totales
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div>Ventas Efectivo:</div>
                <div className="text-lg">{totals.cashSales.toFixed(2)}€</div>
              </div>
              <div>
                <div>Ventas Tarjeta:</div>
                <div className="text-lg">{totals.cardSales.toFixed(2)}€</div>
              </div>
              <div>
                <div>Total Ventas:</div>
                <div className="text-lg">{totals.totalSales.toFixed(2)}€</div>
              </div>
              <div>
                <div>Diferencias:</div>
                <Badge variant={totals.cashDifferences === 0 && totals.cardDifferences === 0 ? 'default' : 'destructive'}>
                  {totals.cashDifferences === 0 && totals.cardDifferences === 0 ? 'Sin diferencias' : 'Con diferencias'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros para mostrar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Ventas Efectivo</TableHead>
                  <TableHead>Ventas Tarjeta</TableHead>
                  <TableHead>Dif. Efectivo</TableHead>
                  <TableHead>Dif. Tarjeta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteRecord}
                    getCashDifference={() => getCashDifference(record)}
                    getCardDifference={() => getCardDifference(record)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}