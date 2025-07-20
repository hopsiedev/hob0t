# 🎫 HOB0T - Multiusos

![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![Node.js](https://img.shields.io/badge/node.js-v16+-green)
![License](https://img.shields.io/badge/license-MIT-yellow)
![Status](https://img.shields.io/badge/status-active-brightgreen)   

## 📝 Descripción

Bot de Discord especializado en sistema de tickets para soporte, creador de embeds con preview en tiempo real, sistema de bienvenidas y funcionalidades avanzadas de gestión. Este bot fue creado para mi comunidad de Minecraft, pero puede ser utilizado en cualquier servidor.

## 📋 Características

✅ **Sistema de Tickets completo**
- Creación, gestión y archivado
- Sistema de reviews
- Numeración secuencial

✅ **Creador de Embeds**
- Editor interactivo
- Previsualización
- Personalización completa

✅ **Sistema de Bienvenidas**
- Mensajes automáticos
- Configuración personalizable

✅ **Información técnica**
- Instalación simplificada
- Configuración de IDs
- Solución de problemas
- Tabla de comandos

## 🚀 Instalación

### Requisitos Previos
- Node.js v16.9.0 o superior
- npm o yarn
- Bot de Discord creado en Discord Developer Portal

### Pasos de Instalación

1. **Clona o descarga el proyecto**
   ```bash
   git clone https://github.com/hopsiedev/hob0t.git
   cd h0b0t
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura los IDs necesarios** (ver sección de configuración)

4. **Ejecuta el bot**
   ```bash
   npm start
   ```
   o
   ```bash
   node index.js
   ```

## ⚙️ Configuración

Debes configurar los siguientes IDs en el archivo `index.js` (líneas 30-34):

```javascript
// Configuración interna (antes en config.json)
const staffRoleId = 'TU_ROL_STAFF_ID';           // ID del rol de staff
const logsChannelId = 'TU_CANAL_LOGS_ID';        // Canal donde se registran los tickets
const archiveCategoryId = 'TU_CATEGORIA_ID';     // Categoría para tickets archivados
const reviewsChannelId = 'TU_CANAL_REVIEWS_ID';  // Canal donde se publican las reviews
const token = 'TU_TOKEN';                    // Token de tu bot
```

### 🔍 Cómo Obtener los IDs

1. **Activa el Modo Desarrollador en Discord:**
   - Configuración → Avanzado → Modo desarrollador ✅

2. **Obtén los IDs necesarios:**
   - **Rol de Staff:** Click derecho en el rol → Copiar ID
   - **Canales:** Click derecho en el canal → Copiar ID
   - **Categoría:** Click derecho en la categoría → Copiar ID
   - **Token del Bot:** Discord Developer Portal → Tu aplicación → Bot → Token
