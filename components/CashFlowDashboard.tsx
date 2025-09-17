import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, MapPin } from 'lucide-react';
import { DailyOperations } from './DailyOperations';
import { CashMovements } from './CashMovements';
import { RecordsHistory } from './RecordsHistory';
import { ThemeToggle } from './ThemeToggle';

interface CashFlowDashboardProps {
  user: string;
  onLogout: () => void;
}

const LOCATIONS = [
  'Parets del Vallès',
  'Lliçà d\'Amunt'
];

export function CashFlowDashboard({ user, onLogout }: CashFlowDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header optimizado para iPad con diseño sólido */}
      <header className="bg-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-semibold text-primary-foreground brand-title">
                Gestión de caja LBJ
              </h1>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 px-4 py-2 text-base">
                <MapPin className="w-4 h-4 mr-2" />
                {selectedLocation || 'Selecciona ubicación'}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-base text-white/80 hidden sm:inline body-text">Bienvenido, {user}</span>
              <ThemeToggle />
              <Button variant="secondary" size="lg" onClick={onLogout} className="h-12 px-6 bg-white/10 text-white hover:bg-white/20 border-white/20 button-text">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {!selectedLocation ? (
          <Card className="max-w-lg mx-auto shadow-lg border-0 bg-card">
            <CardHeader className="pb-6 bg-muted/30 rounded-t-lg">
              <CardTitle className="text-xl text-center text-foreground section-title">Selecciona la ubicación</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-14 text-lg border-border">
                  <SelectValue placeholder="Elige una barbería" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location} className="text-lg py-4">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full">
            {/* Header con información de ubicación mejorado */}
            <div className="bg-card rounded-lg p-6 mb-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-lg font-medium text-foreground section-title">Barbería: {selectedLocation}</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedLocation('')}
                  className="h-10 px-4 button-text"
                >
                  Cambiar ubicación
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="operations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted h-14 p-1 mb-8 rounded-lg border border-border">
                <TabsTrigger value="operations" className="text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground button-text">
                  Operaciones Diarias
                </TabsTrigger>
                <TabsTrigger value="movements" className="text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground button-text">
                  Movimientos
                </TabsTrigger>
                <TabsTrigger value="history" className="text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground button-text">
                  Historial
                </TabsTrigger>
              </TabsList>
            
              <TabsContent value="operations" className="mt-0">
                <DailyOperations location={selectedLocation} user={user} />
              </TabsContent>
              
              <TabsContent value="movements" className="mt-0">
                <CashMovements location={selectedLocation} user={user} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <RecordsHistory location={selectedLocation} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
