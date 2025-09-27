# 🎫 HOB0T - Multipurpose

![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)``
![Node.js](https://img.shields.io/badge/node.js-v16+-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)   

## 📝 Description

Discord bot specialized in ticket system for support, embed creator with real-time preview, welcome system, and advanced management features. This bot was originally created for my Minecraft community but can be used in any server.

## 📋 Features

✅ **Complete Ticket System**
- Creation, management, and archiving
- Review system
- Sequential numbering

✅ **Embed Creator**
- Interactive editor
- Preview
- Full customization

✅ **Welcome System**
- Automatic messages
- Customizable configuration

✅ **Technical Information**
- Simplified installation
- ID configuration
- Troubleshooting
- Command table

## 🚀 Installation

### Prerequisites
- Node.js v16.9.0 or higher
- npm or yarn
- Discord bot created in the Discord Developer Portal

### Installation Steps

1. **Clone or download the project**
   ```bash
   git clone https://github.com/hopsiedev/hob0t.git
   cd hob0t
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the required IDs** (see configuration section)

4. **Run the bot**
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```

## ⚙️ Configuration

You must configure the following IDs in the `index.js` file (lines 30-34):

```javascript
// Internal configuration (previously in config.json)
const staffRoleId = 'YOUR_STAFF_ROLE_ID';           // Staff role ID
const logsChannelId = 'YOUR_LOGS_CHANNEL_ID';       // Channel where tickets are logged
const archiveCategoryId = 'YOUR_CATEGORY_ID';       // Category for archived tickets
const reviewsChannelId = 'YOUR_REVIEWS_CHANNEL_ID'; // Channel where reviews are posted
const token = 'YOUR_TOKEN';                         // Your bot token
```

### 🔍 How to Get the IDs

1. **Enable Developer Mode in Discord:**
   - Settings → Advanced → Developer Mode ✅

2. **Get the required IDs:**
   - **Staff Role:** Right-click on the role → Copy ID
   - **Channels:** Right-click on the channel → Copy ID
   - **Category:** Right-click on the category → Copy ID
   - **Bot Token:** Discord Developer Portal → Your application → Bot → Token
