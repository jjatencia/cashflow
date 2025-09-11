# 💈 Sistema de Gestión de Caja - Barberías

Sistema completo de gestión de flujo de caja diseñado específicamente para las barberías ubicadas en **Parets del Vallès** y **Lliçà d'Amunt**. Optimizado para uso en iPad con interfaz táctil y colores corporativos.

## 🚀 Características Principales

- **Gestión Diaria de Caja**: Apertura y cierre de caja con controles automáticos
- **Registro de Movimientos**: Tracking completo de entradas y salidas de efectivo
- **Conciliación Automática**: Comparación entre facturación y datáfono
- **Historial Completo**: Visualización de registros históricos por ubicación
- **Autenticación Segura**: Sistema de login con Supabase Auth
- **Optimizado para iPad**: Interfaz táctil con elementos de tamaño apropiado

## 🎨 Diseño

- **Colores Corporativos**: Implementa la paleta oficial de la marca
- **Responsive Design**: Funciona perfectamente en iPad (portrait y landscape)
- **Interfaz Táctil**: Elementos de UI optimizados para touch interaction
- **Shadcn/UI**: Componentes modernos y accesibles

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Auth + Database + Edge Functions)
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **Deployment**: Compatible con Vercel, Netlify, etc.

## 📱 Optimizaciones iPad

- Botones mínimo 44px x 44px
- Inputs de 48px+ de altura
- Espaciado generoso (24px padding en cards)
- Media queries específicas para tablet
- Touch targets optimizados

## 🏪 Ubicaciones

- **Parets del Vallès**
- **Lliçà d'Amunt**

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
```

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/gestion-caja-barberias.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar en desarrollo
npm run dev
```

## 📖 Uso

1. **Login**: Accede con tu cuenta de usuario
2. **Seleccionar Ubicación**: Elige entre Parets del Vallès o Lliçà d'Amunt
3. **Operaciones Diarias**: 
   - Abrir caja con dinero inicial
   - Registrar movimientos durante el día
   - Cerrar caja introduciendo facturación y conteo final
4. **Verificación**: El sistema calcula automáticamente las diferencias
5. **Historial**: Consulta registros anteriores por fecha y ubicación

## 🔒 Seguridad

- Autenticación obligatoria para acceder al sistema
- Datos almacenados de forma segura en Supabase
- Sesiones manejadas automáticamente
- Validación de datos en frontend y backend

## 🎯 Funcionalidades Clave

### Apertura de Caja
- Registro de dinero inicial
- Timestamp automático
- Validación de usuario

### Movimientos de Efectivo
- Entradas y salidas con motivo
- Registro de persona responsable
- Categorización automática

### Cierre de Caja
- Facturación en efectivo y tarjeta
- Datos del datáfono
- Conteo final de caja
- Cálculo automático de diferencias

### Conciliación
- ✅ **Efectivo**: Caja inicial + Ventas efectivo + Movimientos = Conteo final
- ✅ **Tarjeta**: Facturación tarjeta = Datáfono
- ⚠️ **Alertas**: Notificaciones automáticas si hay diferencias

## 📊 Base de Datos

Utiliza Supabase con un sistema de KV store para máxima flexibilidad y facilidad de prototipado.

## 🔄 Estados del Sistema

- **Caja Cerrada**: Estado inicial, solo permite apertura
- **Caja Abierta**: Permite registrar movimientos
- **Listo para Cierre**: Cuando hay datos para cerrar
- **Caja Cerrada**: Después del cierre, muestra resumen

## 📄 Licencia

Propietario - Barberías Parets del Vallès & Lliçà d'Amunt

---

**Desarrollado con ❤️ para optimizar la gestión diaria de las barberías**