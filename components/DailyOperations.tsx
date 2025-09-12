import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CalendarDays, DollarSign, CreditCard, Calculator } from 'lucide-react';
import { cashFlowService } from '../services/cashFlowService';

interface DailyOperationsProps {
  location: string;
  user: string;
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

export function DailyOperations({ location, user }: DailyOperationsProps) {
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [openingCash, setOpeningCash] = useState('');
  const [cashSales, setCashSales] = useState('');
  const [cardSales, setCardSales] = useState('');
  const [datafoneSales, setDatafoneSales] = useState('');
  const [finalCashCount, setFinalCashCount] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
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
      const setter = input.getAttribute('data-setter');
      if (setter === 'openingCash') setOpeningCash(e.key);
      else if (setter === 'cashSales') setCashSales(e.key);
      else if (setter === 'cardSales') setCardSales(e.key);
      else if (setter === 'datafoneSales') setDatafoneSales(e.key);
      else if (setter === 'finalCashCount') setFinalCashCount(e.key);
    }
    // Si el valor es "0" y presiona ".", permitir que continue normalmente para "0."
    // Si el valor es "0" y presiona "0", permitir que continue normalmente para "00"
  };

  // Función para manejar cambios en inputs con mejor UX
  const handleAmountChange = (value: string, setter: (value: string) => void) => {
    // Si está vacío, mantener vacío
    if (value === '') {
      setter('');
      return;
    }

    // Si el valor empieza con "0" seguido de un dígito (como "01", "02", etc.)
    // PERO NO si empieza con "0." (decimales válidos)
    if (/^0[1-9]/.test(value)) {
      setter(value.substring(1));
      return;
    }

    // Si el valor es exactamente "0" y se está escribiendo algo más, 
    // esto ya se maneja con la selección automática en onFocus
    
    // Para todos los demás casos (incluyendo "0.", "0.5", etc.), usar el valor tal como viene
    setter(value);
  };

  useEffect(() => {
    loadTodayRecord();
    loadMovements();
  }, [location]);

  const loadTodayRecord = async () => {
    try {
      setLoading(true);
      const existing = await cashFlowService.getDailyRecord(location, today);
      
      if (existing) {
        setTodayRecord(existing);
        setOpeningCash(existing.openingCash.toString());
        setCashSales(existing.cashSales.toString());
        setCardSales(existing.cardSales.toString());
        setDatafoneSales(existing.datafoneSales.toString());
        setFinalCashCount(existing.finalCashCount.toString());
      }
    } catch (error) {
      console.error('Error loading today record:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    try {
      const todayMovements = await cashFlowService.getMovements(location, today);
      setMovements(todayMovements);
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  const getMovements = () => {
    return movements;
  };

  const calculateExpectedCash = () => {
    const opening = parseFloat(openingCash) || 0;
    const sales = parseFloat(cashSales) || 0;
    const movements = getMovements();
    
    const totalMovements = movements.reduce((acc: number, movement: any) => {
      return acc + (movement.type === 'entrada' ? movement.amount : -movement.amount);
    }, 0);

    return opening + sales + totalMovements;
  };

  const getCashDifference = () => {
    const expected = calculateExpectedCash();
    const actual = parseFloat(finalCashCount) || 0;
    return actual - expected;
  };

  const getCardDifference = () => {
    const sales = parseFloat(cardSales) || 0;
    const datafone = parseFloat(datafoneSales) || 0;
    return sales - datafone;
  };

  const handleOpenCash = async () => {
    if (!openingCash || loading) return;
    
    const newRecord: DailyRecord = {
      id: `${today}-${location}`,
      date: today,
      location,
      user,
      openingCash: parseFloat(openingCash),
      cashSales: 0,
      cardSales: 0,
      datafoneSales: 0,
      finalCashCount: 0
    };

    try {
      setLoading(true);
      await cashFlowService.saveDailyRecord(newRecord);
      setTodayRecord(newRecord);
    } catch (error) {
      console.error('Error opening cash:', error);
      alert('Error al abrir la caja. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!todayRecord || !cashSales || !cardSales || !datafoneSales || !finalCashCount || loading) return;

    const updatedRecord = {
      ...todayRecord,
      cashSales: parseFloat(cashSales),
      cardSales: parseFloat(cardSales),
      datafoneSales: parseFloat(datafoneSales),
      finalCashCount: parseFloat(finalCashCount)
    };

    try {
      setLoading(true);
      await cashFlowService.saveDailyRecord(updatedRecord);
      setTodayRecord(updatedRecord);
    } catch (error) {
      console.error('Error closing cash:', error);
      alert('Error al cerrar la caja. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold section-title">Operaciones del día - {new Date().toLocaleDateString('es-ES')}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Apertura de Caja */}
        <Card className="shadow-lg">
          <CardHeader className="px-6 pt-6 pb-6">
            <CardTitle className="flex items-center gap-3 text-lg section-title">
              <DollarSign className="w-6 h-6 text-primary" />
              Apertura de Caja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="opening-cash" className="text-base font-medium mb-3 block body-text">
                Dinero inicial en caja (€)
              </Label>
              <Input
                id="opening-cash"
                type="number"
                step="0.01"
                value={openingCash}
                onChange={(e) => handleAmountChange(e.target.value, setOpeningCash)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                data-setter="openingCash"
                placeholder="0.00"
                disabled={!!todayRecord}
                className="h-12 text-lg body-text"
              />
            </div>
            <Button 
              onClick={handleOpenCash}
              disabled={!!todayRecord || !openingCash || loading}
              className="w-full h-12 text-base button-text"
              size="lg"
            >
              {loading ? 'Procesando...' : (todayRecord ? 'Caja Abierta' : 'Abrir Caja')}
            </Button>
          </CardContent>
        </Card>

        {/* Cierre de Caja */}
        <Card className="shadow-lg">
          <CardHeader className="px-6 pt-6 pb-6">
            <CardTitle className="flex items-center gap-3 text-lg section-title">
              <Calculator className="w-6 h-6 text-primary" />
              Cierre de Caja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cash-sales" className="text-base font-medium mb-3 block body-text">
                  Facturación efectivo (€)
                </Label>
                <Input
                  id="cash-sales"
                  type="number"
                  step="0.01"
                  value={cashSales}
                  onChange={(e) => handleAmountChange(e.target.value, setCashSales)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  data-setter="cashSales"
                  placeholder="0.00"
                  disabled={!todayRecord}
                  className="h-12 text-lg body-text"
                />
              </div>
              <div>
                <Label htmlFor="card-sales" className="text-base font-medium mb-3 block body-text">
                  Facturación tarjeta (€)
                </Label>
                <Input
                  id="card-sales"
                  type="number"
                  step="0.01"
                  value={cardSales}
                  onChange={(e) => handleAmountChange(e.target.value, setCardSales)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  data-setter="cardSales"
                  placeholder="0.00"
                  disabled={!todayRecord}
                  className="h-12 text-lg body-text"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="datafone-sales" className="text-base font-medium mb-3 block body-text">
                  Datáfono (€)
                </Label>
                <Input
                  id="datafone-sales"
                  type="number"
                  step="0.01"
                  value={datafoneSales}
                  onChange={(e) => handleAmountChange(e.target.value, setDatafoneSales)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  data-setter="datafoneSales"
                  placeholder="0.00"
                  disabled={!todayRecord}
                  className="h-12 text-lg body-text"
                />
              </div>
              <div>
                <Label htmlFor="final-count" className="text-base font-medium mb-3 block body-text">
                  Conteo final caja (€)
                </Label>
                <Input
                  id="final-count"
                  type="number"
                  step="0.01"
                  value={finalCashCount}
                  onChange={(e) => handleAmountChange(e.target.value, setFinalCashCount)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  data-setter="finalCashCount"
                  placeholder="0.00"
                  disabled={!todayRecord}
                  className="h-12 text-lg body-text"
                />
              </div>
            </div>
            <Button 
              onClick={handleCloseCash}
              disabled={!todayRecord || !cashSales || !cardSales || !datafoneSales || !finalCashCount || loading}
              className="w-full h-12 text-base button-text"
              size="lg"
            >
              {loading ? 'Procesando...' : 'Cerrar Caja'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumen del día optimizado para iPad */}
      {todayRecord && (
        <Card className="shadow-lg">
          <CardHeader className="px-6 pt-6 pb-6">
            <CardTitle className="text-xl section-title">Resumen del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary section-title">Efectivo</h4>
                <div className="space-y-3 text-base">
                  <div className="flex justify-between py-2">
                    <span>Caja inicial:</span>
                    <span className="font-medium">{parseFloat(openingCash).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Ventas efectivo:</span>
                    <span className="font-medium">{parseFloat(cashSales || '0').toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Movimientos:</span>
                    <span className="font-medium">{getMovements().reduce((acc: number, m: any) => 
                      acc + (m.type === 'entrada' ? m.amount : -m.amount), 0
                    ).toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Esperado:</span>
                    <span className="font-semibold">{calculateExpectedCash().toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Real:</span>
                    <span className="font-semibold">{parseFloat(finalCashCount || '0').toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Diferencia:</span>
                    <Badge 
                      variant={getCashDifference() === 0 ? 'default' : 'destructive'}
                      className="text-base py-2 px-3"
                    >
                      {getCashDifference().toFixed(2)}€
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary section-title">Tarjeta</h4>
                <div className="space-y-3 text-base">
                  <div className="flex justify-between py-2">
                    <span>Facturación:</span>
                    <span className="font-medium">{parseFloat(cardSales || '0').toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Datáfono:</span>
                    <span className="font-medium">{parseFloat(datafoneSales || '0').toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Diferencia:</span>
                    <Badge 
                      variant={getCardDifference() === 0 ? 'default' : 'destructive'}
                      className="text-base py-2 px-3"
                    >
                      {getCardDifference().toFixed(2)}€
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary section-title">Estado General</h4>
                <div className="flex flex-col gap-4">
                  <Badge 
                    variant={getCashDifference() === 0 && getCardDifference() === 0 ? 'default' : 'destructive'}
                    className="text-center py-4 text-lg font-medium"
                  >
                    {getCashDifference() === 0 && getCardDifference() === 0 
                      ? '✓ Todo Cuadra' 
                      : '⚠ Hay Diferencias'
                    }
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}