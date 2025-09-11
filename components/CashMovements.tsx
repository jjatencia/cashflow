import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { cashFlowService } from '../services/cashFlowService';

interface CashMovementsProps {
  location: string;
  user: string;
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

export function CashMovements({ location, user }: CashMovementsProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'entrada' | 'salida'>('entrada');
  const [reason, setReason] = useState('');
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
    // (NO interceptar si presiona "." para decimales o "0" para seguir con ceros)
    if (currentValue === '0' && /[1-9]/.test(e.key)) {
      // Prevenir el comportamiento por defecto y reemplazar el valor
      e.preventDefault();
      setAmount(e.key);
    }
    // Si el valor es "0" y presiona ".", permitir que continue normalmente para "0."
    // Si el valor es "0" y presiona "0", permitir que continue normalmente para "00"
  };

  // Función para manejar cambios en inputs con mejor UX
  const handleAmountChange = (value: string) => {
    // Si está vacío, mantener vacío
    if (value === '') {
      setAmount('');
      return;
    }

    // Si el valor empieza con "0" seguido de un dígito (como "01", "02", etc.)
    // PERO NO si empieza con "0." (decimales válidos)
    if (/^0[1-9]/.test(value)) {
      setAmount(value.substring(1));
      return;
    }

    // Para todos los demás casos (incluyendo "0.", "0.5", etc.), usar el valor tal como viene
    setAmount(value);
  };

  useEffect(() => {
    loadMovements();
  }, [location]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const locationMovements = await cashFlowService.getMovements(location, today);
      setMovements(locationMovements);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovement = async () => {
    if (!amount || !reason.trim() || loading) return;

    const newMovement: Movement = {
      id: editingMovement?.id || `${Date.now()}-${Math.random()}`,
      date: today,
      location,
      type,
      amount: parseFloat(amount),
      reason: reason.trim(),
      user,
      timestamp: new Date().toISOString()
    };

    try {
      setLoading(true);
      let updatedMovements;
      
      if (editingMovement) {
        updatedMovements = movements.filter(m => m.id !== editingMovement.id);
        updatedMovements.push(newMovement);
      } else {
        updatedMovements = [...movements, newMovement];
      }

      await cashFlowService.saveMovements(location, today, updatedMovements);
      
      setAmount('');
      setReason('');
      setType('entrada');
      setEditingMovement(null);
      await loadMovements();
    } catch (error) {
      console.error('Error saving movement:', error);
      alert('Error al guardar el movimiento. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMovement = (movement: Movement) => {
    setEditingMovement(movement);
    setAmount(movement.amount.toString());
    setType(movement.type);
    setReason(movement.reason);
  };

  const handleDeleteMovement = async (movementId: string) => {
    try {
      setLoading(true);
      const updatedMovements = movements.filter(m => m.id !== movementId);
      await cashFlowService.saveMovements(location, today, updatedMovements);
      await loadMovements();
    } catch (error) {
      console.error('Error deleting movement:', error);
      alert('Error al eliminar el movimiento. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingMovement(null);
    setAmount('');
    setReason('');
    setType('entrada');
  };

  const getTotalMovements = () => {
    return movements.reduce((acc, movement) => {
      return acc + (movement.type === 'entrada' ? movement.amount : -movement.amount);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowUpCircle className="w-5 h-5 text-blue-600" />
        <h2 className="section-title">Movimientos de Efectivo - {new Date().toLocaleDateString('es-ES')}</h2>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="section-title">
            {editingMovement ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="movement-type" className="body-text">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as 'entrada' | 'salida')}>
                <SelectTrigger className="h-12 text-lg body-text">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="movement-amount" className="body-text">Cantidad (€)</Label>
              <Input
                id="movement-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder="0.00"
                className="h-12 text-lg body-text"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="movement-reason" className="body-text">Motivo</Label>
              <Textarea
                id="movement-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe el motivo del movimiento"
                rows={1}
                className="min-h-[48px] text-lg body-text"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAddMovement}
              disabled={!amount || !reason.trim() || loading}
              className="flex-1 h-12 button-text"
            >
              {loading ? 'Procesando...' : (editingMovement ? 'Actualizar' : 'Agregar')} Movimiento
            </Button>
            {editingMovement && (
              <Button variant="outline" onClick={cancelEdit} className="h-12 button-text">
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {movements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="section-title">Resumen del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl text-green-600">{movements.filter(m => m.type === 'entrada').reduce((acc, m) => acc + m.amount, 0).toFixed(2)}€</div>
                <div className="text-sm text-muted-foreground">Total Entradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-red-600">{movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0).toFixed(2)}€</div>
                <div className="text-sm text-muted-foreground">Total Salidas</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl ${getTotalMovements() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getTotalMovements().toFixed(2)}€
                </div>
                <div className="text-sm text-muted-foreground">Balance Neto</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="section-title">Movimientos del Día</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay movimientos registrados para hoy
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.timestamp).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={movement.type === 'entrada' ? 'default' : 'secondary'}>
                          {movement.type === 'entrada' ? (
                            <ArrowUpCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownCircle className="w-3 h-3 mr-1" />
                          )}
                          {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </TableCell>
                      <TableCell className={movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {movement.type === 'entrada' ? '+' : '-'}{movement.amount.toFixed(2)}€
                      </TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMovement(movement)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el movimiento permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMovement(movement.id)}
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
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}