# Directrices de Diseño para iPad - Gestión de Caja Barberías

## Paleta de Colores Corporativa
* **#555BF6** - Color principal (40% de uso, elementos primarios)
* **#FD778B** - Color secundario (20% de uso, acentos y destacados)
* **#FCFFA8** - Color complementario (10% de uso)
* **#B7F1F4** - Color complementario (10% de uso)
* **#D2E9FF** - Color complementario (10% de uso)
* **#02145C** - Color complementario (10% de uso, textos principales)

## Optimización para iPad

### Diseño Responsivo iPad
* **Breakpoints**: Optimizar específicamente para pantallas 768px - 1024px+ (iPad estándar y Pro)
* **Orientación**: Diseñar layouts que funcionen tanto en portrait como landscape
* **Espaciado**: Usar espaciado generoso para aprovechar el espacio de pantalla más grande
* **Grids**: Usar layouts de 2-3 columnas cuando sea posible para maximizar el uso del espacio

### Interacción Táctil
* **Tamaño mínimo de botones**: 44px x 44px para facilitar el toque
* **Áreas de toque**: Separación mínima de 8px entre elementos interactivos
* **Feedback visual**: Hover states claros y transitions suaves
* **Gestos**: Considerar swipe y pinch donde sea apropiado

### Typography y Spacing
* **Tamaño de fuente**: Mantener legibilidad óptima para distancia de tablet
* **Line height**: 1.5 para óptima legibilidad
* **Padding**: Usar padding generoso (16px-24px) en cards y contenedores
* **Margins**: Espaciado consistente entre secciones (24px-32px)

### Layout Específico iPad
* **Header**: Height mínimo de 60px para facilitar navegación táctil
* **Cards**: Width máximo de 600px para evitar líneas de lectura muy largas
* **Forms**: Layouts horizontales cuando el espacio lo permita
* **Tables**: Optimizar para scroll horizontal si es necesario

### Componentes UI
* **Tabs**: Usar tabs grandes y fáciles de tocar
* **Input fields**: Height mínimo de 48px
* **Select dropdowns**: Listas amplias con opciones bien espaciadas
* **Modals**: Aprovechar el espacio para mostrar más información sin abrumar

## Directrices Generales
* Usar flexbox y grid para layouts responsivos
* Evitar positioning absoluto salvo cuando sea estrictamente necesario
* Mantener código limpio y componentes reutilizables
* Priorizar la experiencia táctil sobre la de desktop

## Colores de Estado
* **Success**: Usar tonos del color principal (#555BF6) con opacity
* **Warning**: Usar color secundario (#FD778B) para alertas
* **Error**: Mantener rojo estándar pero coordinado con la paleta
* **Info**: Usar colores complementarios azules (#D2E9FF, #B7F1F4)

## Especificaciones Técnicas
* **Font-size base**: 16px para óptima legibilidad en iPad
* **Input height**: Mínimo 48px para facilitar toque
* **Button height**: Mínimo 44px con padding horizontal de 16px
* **Card padding**: 20px-24px para espaciado apropiado
* **Grid gaps**: 16px-24px entre elementos