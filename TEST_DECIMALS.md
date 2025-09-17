# Test de Funcionalidad de Decimales

## Casos de Prueba para Campos de Divisas

### ✅ Casos que DEBEN funcionar:

1. **Campo vacío → escribir "25.50"**
   - Resultado esperado: "25.50"

2. **Campo con "0" → escribir "."**
   - Resultado esperado: "0."
   - Después escribir "50": "0.50"

3. **Campo con "0" → escribir "5"** 
   - Resultado esperado: "5" (reemplaza el 0)
   - Después escribir ".25": "5.25"

4. **Campo con "0" → seleccionar todo y escribir "12.75"**
   - Resultado esperado: "12.75"

5. **Campo con "0" → escribir "0"**
   - Resultado esperado: "00" (permite ceros adicionales)

6. **Campo con "01" automáticamente se convierte a "1"**
   - Resultado esperado: "1"

### 🎯 Funcionalidad aplicada en:

- ✅ DailyOperations.tsx
  - Apertura de caja
  - Facturación efectivo
  - Facturación tarjeta
  - Datáfono
  - Conteo final

- ✅ CashMovements.tsx
  - Campo cantidad en movimientos

- ✅ RecordsHistory.tsx
  - Todos los campos de edición en modal

### 🔧 Características implementadas:

1. **Selección automática al focus**: Cuando tocas un campo, se selecciona todo el contenido
2. **Reemplazo inteligente del "0"**: Si presionas 1-9 cuando hay "0", reemplaza automáticamente
3. **Preservación de decimales**: "0." se mantiene para permitir "0.50"
4. **Limpieza de ceros innecesarios**: "01" se convierte en "1"
5. **step="0.01"**: Permite decimales hasta centésimas

### ⚙️ Configuración técnica:

```tsx
<Input
  type="number"
  step="0.01"
  onFocus={handleInputFocus}        // Selecciona todo al hacer focus
  onKeyDown={handleKeyDown}         // Intercepta teclas para reemplazar "0"
  onChange={handleAmountChange}     // Limpia valores como "01" → "1"
  placeholder="0.00"
/>
```