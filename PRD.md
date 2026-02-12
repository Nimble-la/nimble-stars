# Nimble S.T.A.R.S — Product Requirements Document

> **S**ourcing **T**alent **A**nd **R**ecruiting **S**olutions
>
> Versión: 0.5
> Fecha: 2025-02-11
> Autor: Nimble.LA
> Estado: En iteración

---

## 1. Visión del Producto

Nimble S.T.A.R.S es una plataforma web liviana que permite a Nimble compartir perfiles de candidatos con sus clientes de forma organizada, profesional y colaborativa. Los clientes pueden revisar candidatos, dejar feedback, y mover candidatos a través de un pipeline simplificado — todo sin necesidad de acceder a herramientas internas de Nimble.

### Problema que resuelve

Hoy la comunicación de candidatos con clientes se hace por email, docs compartidos o llamadas. Esto genera:
- Pérdida de trazabilidad del feedback
- Fricción para que el cliente revise candidatos
- Falta de visibilidad sobre el estado de cada candidato
- Dificultad para escalar el proceso con múltiples clientes y posiciones

### Propuesta de valor

Una interfaz simple y dedicada donde el cliente tiene todo en un solo lugar: candidatos, CVs, notas, y un pipeline claro para tomar decisiones. Cada cliente ve la plataforma con su propio branding, generando una experiencia white-label profesional.

---

## 2. Usuarios y Roles

### 2.1 Admin (Nimble)
- Acceso total al sistema
- Crea y gestiona clientes (organizaciones) con branding personalizado
- Crea usuarios para cada cliente
- Crea posiciones y asigna candidatos
- Sube archivos (CV, documentos) de cualquier tipo y tamaño
- Ve todo el feedback y actividad de los clientes
- Puede mover candidatos entre fases
- Ve todas las posiciones (abiertas y cerradas)
- Accede al link de Manatal de cada candidato (referencia interna)

### 2.2 Cliente
- Acceso con usuario/contraseña
- Ve solo las posiciones **abiertas** de su organización (las cerradas quedan ocultas)
- Ve todos los datos del candidato: nombre, email, teléfono, resumen, archivos
- Descarga archivos adjuntos del candidato
- Deja comentarios y notas en cada candidato
- Los comentarios son visibles para todos los usuarios de la misma organización (colaborativos)
- Mueve candidatos entre fases del pipeline
- Ve el historial de actividad (quién cambió qué y cuándo)
- Puede haber múltiples usuarios por cliente/organización
- Todos los usuarios de un mismo cliente tienen los mismos permisos (v1)
- **No ve** el link de Manatal (es solo para uso interno de Nimble)
- **No ve** posiciones cerradas

---

## 3. Modelo de Datos (Conceptual)

```
Organization (Cliente)
├── id, name, logo_url?, primary_color?, created_at
│
├── Users (1..n)
│   └── id, email, password_hash, name, role (admin | client), org_id?
│
├── Positions (1..n)
│   ├── id, title, description?, status (open | closed), org_id, created_at
│   │
│   └── CandidatePositions (junction table — muchos a muchos)
│       ├── id, candidate_id, position_id
│       ├── stage: presentado | a_entrevistar | aprobado | rechazado
│       ├── created_at, updated_at
│       ├── last_interaction_at (se actualiza con cada comentario o cambio de fase)
│       │
│       ├── Comments (0..n)
│       │   └── id, body, user_id, candidate_position_id, created_at
│       │
│       └── Activity Log (0..n)
│           └── id, action, from_stage?, to_stage?, user_id, user_name, candidate_position_id, created_at

Candidates (global, compartido entre orgs)
├── id, full_name, email?, phone?, current_role?, current_company?
├── summary (texto breve sobre el candidato)
├── files[] (array de archivos — CV, docs, cualquier tipo/tamaño)
│   └── { file_url, file_name, file_type, uploaded_at }
├── manatal_url? (link a Manatal — solo visible para admins)
├── created_at, updated_at
```

### Notas sobre el modelo

- **Organization** = un cliente de Nimble. Aísla completamente los datos visibles.
- **Candidates** son entidades globales. Un mismo candidato puede estar asignado a múltiples posiciones en diferentes clientes.
- **CandidatePosition** es la tabla de unión. El **stage**, **comentarios** y **actividad** viven acá — porque un mismo candidato puede estar en fase distinta en cada posición.
- **last_interaction_at** en CandidatePosition se actualiza cada vez que alguien comenta o cambia la fase. Permite ordenar candidatos por última interacción.
- **Activity Log** registra cada acción con el nombre del usuario, la acción realizada, y timestamp. Es visible tanto para admins como para clientes.
- **Admin users** (Nimble) no pertenecen a una org — ven todo.
- **manatal_url** es un campo opcional en el candidato, visible solo en el panel admin.
- **logo_url** y **primary_color** en Organization permiten branding por cliente.
- **files** es un array flexible: se pueden subir múltiples archivos de cualquier tipo y sin límite de tamaño.

---

## 4. Funcionalidades — v1 (MVP)

### 4.1 Autenticación
- Login con email/contraseña (Supabase Auth)
- Dos roles: `admin` y `client`
- El admin crea las cuentas de los clientes (no hay self-registration)
- Sesiones con JWT
- Redirect automático según rol después del login

### 4.2 Branding por Cliente
- Cada organización tiene un **logo** y un **color principal** configurables
- El cliente ve la plataforma con su logo en el header/sidebar y el color principal aplicado a elementos de UI (botones, acentos, links)
- Los admins ven la plataforma con branding Nimble
- El logo y color se configuran al dar de alta al cliente (y se pueden editar después)

### 4.3 Panel Admin (Nimble)

| Funcionalidad | Descripción |
|---|---|
| Dashboard | Vista general: clientes activos, posiciones abiertas, candidatos por fase |
| Gestión de Clientes | CRUD de organizaciones (nombre, logo, color principal) |
| Gestión de Usuarios | Crear/editar usuarios para cada cliente |
| Gestión de Posiciones | Crear posiciones dentro de un cliente, abrir/cerrar posiciones |
| Banco de Candidatos | Pool global de candidatos, con búsqueda. Crear candidato con datos + archivos + link Manatal |
| Asignar Candidatos | Asignar un candidato existente a una o más posiciones (mismo o distinto cliente) |
| Ver Actividad | Ver comentarios, cambios de fase y todo el historial de actividad |
| Link Manatal | Acceso rápido al perfil del candidato en Manatal desde su ficha |

### 4.4 Panel Cliente — Flujo Principal

El flujo del cliente es lineal y simple:

```
Mis Posiciones (lista) → Posición (candidatos) → Perfil del Candidato (detalle + acciones)
```

#### Paso 1: Mis Posiciones
- Lista de posiciones **abiertas** de su organización
- Cada posición muestra: título, cantidad de candidatos, y un resumen de candidatos por fase

#### Paso 2: Candidatos de una Posición (dos vistas)

**Vista Kanban (default)**
- Candidatos en columnas por fase: Presentado | A Entrevistar | Aprobado | Rechazado
- Drag & drop para mover candidatos entre fases
- Click en tarjeta para ir al detalle

**Vista Lista**
- Tabla de candidatos con columnas: nombre, fase actual, fecha de carga, última interacción
- **Filtrable por fase** (dropdown o tabs)
- **Ordenable por**:
  - Fecha de carga (created_at) — más nuevos primero por defecto
  - Última interacción (last_interaction_at) — para ver quién tuvo actividad reciente
- Click en fila para ir al detalle

El usuario puede alternar entre vista Kanban y vista Lista con un toggle.

#### Paso 3: Perfil del Candidato
- **Datos completos**: nombre, email, teléfono, rol actual, empresa actual
- **Resumen**: texto descriptivo del candidato
- **Archivos**: lista de archivos adjuntos, descargables (CV, documentos, etc.)
- **Fase actual**: indicador visual + botón/dropdown para cambiar fase
- **Comentarios**: sección para leer y dejar notas (visibles para toda la org)
- **Historial de actividad**: timeline cronológico mostrando:
  - Quién cambió la fase, de qué fase a cuál, y cuándo
  - Quién dejó un comentario y cuándo
  - Cuándo fue asignado el candidato a la posición

### 4.5 Historial de Actividad (Activity Log)

El historial es un componente central visible en el perfil del candidato tanto para admins como para clientes.

Muestra entradas como:
```
🔄 María López movió a Juan Pérez de "Presentado" a "A Entrevistar" — hace 2 horas
💬 Carlos García dejó un comentario — hace 1 día
📋 Admin asignó a Juan Pérez a esta posición — 15 Feb 2025
```

Reglas:
- Se registra automáticamente cada cambio de fase (con from_stage y to_stage)
- Se registra automáticamente cada comentario nuevo
- Se registra la asignación inicial del candidato a la posición
- Cada entrada incluye: usuario, acción, timestamp
- El log es inmutable (no se puede editar ni borrar)
- Ordenado de más reciente a más antiguo

### 4.6 Visibilidad de Posiciones

| Estado | Admin | Cliente |
|---|---|---|
| Abierta | ✅ Visible y editable | ✅ Visible, puede interactuar |
| Cerrada | ✅ Visible y editable | ❌ No visible |

Cuando un admin cierra una posición, desaparece de la vista del cliente inmediatamente. El admin puede reabrir una posición y vuelve a ser visible.

### 4.7 Notificaciones (v1 - mínimo)
- Notificación in-app al admin cuando un cliente cambia la fase de un candidato
- Notificación in-app al admin cuando un cliente deja un comentario

---

## 5. Diseño y Sistema Visual

### 5.1 Filosofía de Diseño

Minimalista, profesional y limpio — alineado con la estética actual de nimble.la. La plataforma debe sentirse como una extensión natural del sitio de Nimble: espaciosa, moderna, con mucho aire y tipografía clara.

Principios:
- **Menos es más**: sin decoración innecesaria, sin bordes pesados, sin sombras excesivas
- **Contenido primero**: la interfaz se borra y deja que los datos hablen
- **Consistencia**: usar componentes shadcn/ui sin customización excesiva
- **Jerarquía visual clara**: tamaños de fuente, peso y color guían la lectura

### 5.2 Paleta de Colores — Nimble (Admin)

Basada en la identidad actual de nimble.la:

```
/* Nimble Brand */
--nimble-black:       #0A0A0A;    /* Fondo principal (dark mode feel) */
--nimble-white:       #FAFAFA;    /* Texto sobre fondos oscuros */
--nimble-gray-50:     #F9FAFB;    /* Fondos claros, cards */
--nimble-gray-100:    #F3F4F6;    /* Bordes sutiles, separadores */
--nimble-gray-200:    #E5E7EB;    /* Bordes de inputs */
--nimble-gray-400:    #9CA3AF;    /* Texto secundario */
--nimble-gray-600:    #4B5563;    /* Texto body */
--nimble-gray-900:    #111827;    /* Texto principal (light mode) */

/* Acentos funcionales */
--stage-presentado:   #3B82F6;    /* Azul — nuevo, pendiente */
--stage-entrevistar:  #F59E0B;    /* Ámbar — en proceso */
--stage-aprobado:     #10B981;    /* Verde — éxito */
--stage-rechazado:    #EF4444;    /* Rojo — descartado */
```

### 5.3 Paleta de Colores — Cliente (Theming Dinámico)

Cada organización define un `primary_color`. Este color se inyecta como CSS variable y reemplaza los acentos de la UI:

```css
:root {
  --client-primary: var(--org-primary-color, #3B82F6);
  --client-primary-hover: /* primary darkened 10% */;
  --client-primary-light: /* primary at 10% opacity */;
}
```

Se aplica a: botones primarios, links, badges activos, bordes de focus, sidebar/header accent. Los colores de las fases del pipeline se mantienen fijos (azul/ámbar/verde/rojo) independientemente del branding del cliente para mantener consistencia funcional.

### 5.4 Tipografía

Usar la misma fuente que nimble.la o una equivalente del sistema:

```
/* Font stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Escala */
--text-xs:    0.75rem;   /* 12px — captions, timestamps */
--text-sm:    0.875rem;  /* 14px — texto secundario, labels */
--text-base:  1rem;      /* 16px — texto body */
--text-lg:    1.125rem;  /* 18px — subtítulos */
--text-xl:    1.25rem;   /* 20px — títulos de sección */
--text-2xl:   1.5rem;    /* 24px — títulos de página */
--text-3xl:   1.875rem;  /* 30px — headers principales */

/* Pesos */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### 5.5 Componentes UI (shadcn/ui + Tailwind)

| Componente | Uso |
|---|---|
| `Button` | Acciones primarias y secundarias. Primario: filled con color de acento. Secundario: outline/ghost. |
| `Card` | Tarjetas de candidato en kanban, cards de posiciones |
| `Table` | Vista lista de candidatos, lista de usuarios |
| `Badge` | Indicadores de fase (coloreados), contadores |
| `Dialog` / `Sheet` | Modales para crear/editar, sheets laterales para detalle rápido |
| `Tabs` | Alternar entre vistas (kanban/lista), secciones del perfil |
| `Avatar` | Iniciales del candidato (sin foto en v1) |
| `Textarea` | Caja de comentarios |
| `Input` / `Select` | Formularios de creación/edición |
| `DropdownMenu` | Menú de acciones, cambio de fase |
| `Tooltip` | Info contextual sobre íconos y acciones |
| `Separator` | División visual entre secciones |
| `ScrollArea` | Listas scrolleables (activity log, comentarios) |

### 5.6 Layout General

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (colapsable)          │  Contenido          │
│                                │                     │
│  ┌──────────────────────┐      │                     │
│  │ Logo (Nimble o        │      │                     │
│  │ cliente según rol)    │      │                     │
│  ├──────────────────────┤      │                     │
│  │ Navegación            │      │                     │
│  │ · Dashboard           │      │                     │
│  │ · Clientes            │      │                     │
│  │ · Candidatos          │      │                     │
│  │ · (o Posiciones       │      │                     │
│  │    si es cliente)     │      │                     │
│  ├──────────────────────┤      │                     │
│  │ Usuario               │      │                     │
│  │ · Nombre + Avatar     │      │                     │
│  │ · Logout              │      │                     │
│  └──────────────────────┘      │                     │
└─────────────────────────────────────────────────────┘
```

- **Sidebar izquierdo** colapsable (icono en mobile)
- Logo del cliente (o Nimble) en la parte superior
- Navegación según el rol
- El área de contenido es el 100% del ancho restante
- En mobile: sidebar se convierte en bottom navigation o hamburger menu

### 5.7 Estilo de las Cards de Candidato (Kanban)

```
┌──────────────────────────────┐
│  JD   Juan Díaz              │
│       Senior Developer       │
│       Empresa Actual S.A.    │
│                              │
│  💬 3 comentarios  · hace 2h │
└──────────────────────────────┘
```

- Fondo blanco (`gray-50`), borde sutil (`gray-200`), rounded-lg
- Avatar con iniciales (circle, coloreado)
- Nombre en `font-semibold`, detalles en `text-sm text-gray-500`
- Indicador de actividad (comentarios, última interacción) en el footer de la card
- Hover: sombra sutil (`shadow-sm` → `shadow-md`)
- Sin bordes pesados ni gradientes

### 5.8 Logo de Nimble

El logo SVG de Nimble (`nimble-logo.svg` de https://nimble.la/) se usa como asset de la plataforma:
- En el sidebar del panel admin
- En la pantalla de login
- Como fallback cuando un cliente no tiene logo configurado

El logo se debe incluir como asset estático en el proyecto (`/public/nimble-logo.svg`).

### 5.9 Modo de Color

**v1: Light mode solamente.** El sitio de nimble.la tiene un estilo dark, pero para una plataforma de gestión tipo dashboard, light mode es más práctico para lectura y uso prolongado. El dark theme queda como iteración futura.

Fondo principal: `#FFFFFF` o `gray-50`
Sidebar: `gray-900` o `gray-950` (para mantener contraste y algo del feel dark de Nimble)

---

## 6. Tech Stack

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend + SSR** | Next.js 14+ (App Router) + TypeScript | SSR/SSG, routing integrado, optimización de imágenes, API routes si se necesitan |
| **UI Components** | shadcn/ui + Tailwind CSS | Componentes accesibles, customizables. Tailwind facilita el theming dinámico por cliente (CSS variables) |
| **Backend / API** | Convex | Realtime out-of-the-box, serverless, typesafe con TS |
| **Auth** | Supabase Auth | Simple, soporta email/password, JWT |
| **Storage (Archivos + Logos)** | Supabase Storage | Upload de archivos sin límite de tamaño, URLs firmadas para descarga |
| **Base de Datos** | Convex (integrado) | El estado principal vive en Convex; Supabase solo para auth + storage |
| **Hosting** | Vercel | Deploy nativo para Next.js, edge functions, preview deploys |

### Arquitectura simplificada

```
┌──────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Next.js App    │────▶│   Convex     │     │   Supabase      │
│   (App Router)   │     │  (Backend +  │     │  - Auth         │
│   Vercel         │     │   Database)  │     │  - Storage      │
└──────────────────┘     └──────────────┘     └─────────────────┘
```

- **Convex** maneja toda la lógica de negocio, queries, mutations y la base de datos.
- **Supabase** se usa exclusivamente para autenticación y storage de archivos.
- El frontend se comunica con Convex en tiempo real (subscripciones reactivas).
- **Next.js App Router** maneja routing, layouts por rol, y server components donde convenga.

---

## 7. Pantallas y Rutas

### Admin

```
/admin                         → Dashboard general
/admin/clients                 → Lista de clientes (organizaciones)
/admin/clients/new             → Crear cliente (nombre, logo, color)
/admin/clients/[id]            → Detalle del cliente + posiciones (abiertas y cerradas)
/admin/clients/[id]/users      → Gestión de usuarios del cliente
/admin/clients/[id]/positions  → Posiciones del cliente
/admin/positions/[id]          → Pipeline de una posición (kanban + lista) + actividad
/admin/candidates              → Banco global de candidatos
/admin/candidates/new          → Crear candidato (datos + archivos + link Manatal)
/admin/candidates/[id]         → Perfil completo + posiciones asignadas + actividad
```

### Cliente

```
/positions                     → Mis posiciones abiertas (lista)
/positions/[id]                → Candidatos de la posición (kanban / lista, con filtros y orden)
/positions/[id]/candidates/[cid] → Perfil del candidato + comentarios + historial de actividad
```

### Shared

```
/login                         → Login con email/password
```

---

## 8. Pipeline de Candidatos (Fases)

```
┌──────────────┐    ┌────────────────┐    ┌────────────┐    ┌─────────────┐
│  Presentado  │───▶│ A Entrevistar  │───▶│  Aprobado  │    │  Rechazado  │
└──────────────┘    └────────────────┘    └────────────┘    └─────────────┘
                           │                                       ▲
                           └───────────────────────────────────────┘
```

- Un candidato arranca siempre en **Presentado** cuando el admin lo asigna a una posición.
- El cliente (o el admin) puede moverlo a **A Entrevistar**, **Aprobado** o **Rechazado**.
- **Rechazado** se puede alcanzar desde cualquier fase.
- Cada cambio de fase queda registrado en el Activity Log con: quién lo hizo, de qué fase a cuál, y cuándo.
- **El stage es por posición**: un mismo candidato puede estar "Aprobado" en una posición y "Presentado" en otra.

Colores de las fases (fijos, no cambian con el branding del cliente):

| Fase | Color | Tailwind |
|---|---|---|
| Presentado | Azul | `blue-500` |
| A Entrevistar | Ámbar | `amber-500` |
| Aprobado | Verde | `emerald-500` |
| Rechazado | Rojo | `red-500` |

---

## 9. Candidatos Compartidos — Flujo

Como un candidato puede estar en múltiples posiciones y clientes, el flujo es:

1. **Admin crea candidato** en el banco global (datos + archivos + link Manatal opcional).
2. **Admin asigna candidato** a una posición → se crea un `CandidatePosition` con stage "Presentado".
3. El mismo candidato puede asignarse a otra posición (mismo o distinto cliente).
4. **Cada asignación tiene su propio pipeline** independiente (stage, comentarios, actividad).
5. **El cliente solo ve** los candidatos asignados a sus posiciones abiertas — nunca ve que el candidato está en otro lado.

### Datos visibles por rol

| Campo | Admin | Cliente |
|---|---|---|
| Nombre completo | ✅ | ✅ |
| Email | ✅ | ✅ |
| Teléfono | ✅ | ✅ |
| Rol actual / empresa | ✅ | ✅ |
| Resumen / summary | ✅ | ✅ |
| Archivos (CV, docs) | ✅ | ✅ |
| Historial de actividad | ✅ | ✅ |
| Comentarios de su org | ✅ | ✅ |
| Link Manatal | ✅ | ❌ |
| Otras posiciones asignadas | ✅ | ❌ |
| Comentarios de otros clientes | ❌ (aislado) | ❌ (solo su org) |

---

## 10. Requerimientos No Funcionales

- **Performance**: La app debe cargar en < 2s. Convex provee realtime sin polling. Next.js optimiza con SSR y server components.
- **Seguridad**: Aislamiento total entre organizaciones. Un cliente nunca ve datos de otro. Las queries de Convex filtran siempre por org_id.
- **Mobile-friendly**: UI responsive, usable desde celular (no app nativa).
- **Simplicidad**: Máximo 3 clicks para cualquier acción principal.
- **Escalabilidad**: Serverless (Convex + Vercel) escala automáticamente.
- **Theming**: El branding del cliente se aplica sin rebuild — es dinámico vía CSS variables.
- **Storage**: Sin límite de tamaño ni tipo de archivo para uploads de candidatos.
- **Auditabilidad**: Todo cambio de fase queda registrado con usuario y timestamp. El log es inmutable.

---

## 11. Futuras Iteraciones (Post-MVP)

| Versión | Feature |
|---|---|
| v1.1 | Notificaciones por email (nuevo candidato, cambio de fase, nuevo comentario) |
| v1.2 | Integración con Manatal vía API (importar candidatos y posiciones automáticamente) |
| v1.3 | Filtros avanzados y búsqueda de candidatos (por skills, experiencia, etc.) |
| v1.4 | Dashboard analytics (time-to-hire, tasas de aprobación por cliente, por posición) |
| v1.5 | Fases customizables por cliente u organización |
| v1.6 | Permisos granulares por usuario de cliente (viewer, commenter, manager) |
| v1.7 | Dark mode |
| v2.0 | Portal público de careers para los clientes de Nimble |

---

## 12. Criterios de Éxito (MVP)

- Un admin puede crear un cliente (con branding), una posición, y subir candidatos con archivos en < 5 minutos.
- Un cliente puede loguearse, ver la plataforma con su branding, revisar candidatos, dejar feedback y mover fases sin necesitar instrucciones.
- El cliente puede alternar entre vista kanban y lista, filtrar por fase, y ordenar por fecha o última interacción.
- El historial de actividad muestra claramente quién hizo qué y cuándo.
- Un mismo candidato puede existir en múltiples posiciones con pipelines independientes.
- El sistema mantiene aislamiento total entre clientes.
- Las posiciones cerradas desaparecen de la vista del cliente.
- Los comentarios son colaborativos entre usuarios de la misma organización.
- La plataforma funciona correctamente en desktop y mobile.
- La UI se siente como una extensión natural de nimble.la: limpia, profesional, minimalista.

---

*Todas las preguntas abiertas han sido resueltas. Este PRD está listo para pasar a la fase de documento de construcción.*
