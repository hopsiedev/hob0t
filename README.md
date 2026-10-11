# HOB0T - Multipurpose Discord Bot
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/hopsiedev/hob0t)

HOB0T is a powerful, multipurpose Discord bot built with Discord.js v14. It specializes in providing a comprehensive ticket support system, an interactive embed creator, and other server management utilities. Originally created for a Minecraft community, its features are designed to be adaptable for any server.

## Features

-   **Advanced Ticket System**:
    -   Create tickets via a simple button-based panel.
    -   Tickets are assigned sequential numbers (e.g., `ticket-000001`).
    -   Logs new tickets to a staff channel with an option for staff to "claim" them.
    -   In-channel control panel for users and staff to manage the ticket (close, rename, archive).
    -   Automatic ticket archival and deletion.
    -   A user rating and review system that sends a DM to the user after a ticket is closed. Reviews are posted to a dedicated channel.

-   **Interactive Embed Creator**:
    -   Use the `/crearembed` command to open a visual editor.
    -   Edit the title, description, color, fields, footer, and images using buttons and modals.
    -   Get a real-time preview of the embed as you build it.
    -   Send the final embed to any specified text channel.

-   **Welcome & Presence**:
    -   The bot's activity status dynamically shows the server's total member count.

## Installation

### Prerequisites

-   [Node.js](https://nodejs.org/) v16.9.0 or higher
-   npm (included with Node.js)

### Setup Steps

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/hopsiedev/hob0t.git
    cd hob0t
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Configure the bot:**
    Open the `index.js` file and fill in the required IDs and your bot token. See the [Configuration](#configuration) section below for details.

4.  **Run the bot:**
    ```sh
    node index.js
    ```

## Configuration

All configuration is managed directly within the `index.js` file. You must provide valid Discord IDs and your bot token for the bot to function correctly.

```javascript
// index.js

// Internal configuration
const staffRoleId = 'YOUR_STAFF_ROLE_ID';
const logsChannelId = 'YOUR_TICKET_LOGS_CHANNEL_ID';
const archiveCategoryId = 'YOUR_ARCHIVED_TICKETS_CATEGORY_ID';
const reviewsChannelId = 'YOUR_REVIEWS_CHANNEL_ID';
const token = 'YOUR_DISCORD_BOT_TOKEN';
```

### How to Get Discord IDs

1.  **Enable Developer Mode:** In your Discord client, go to `User Settings` > `Advanced` and turn on `Developer Mode`.
2.  **Copy IDs:**
    -   **Role ID:** Go to `Server Settings` > `Roles`, right-click the staff role, and select `Copy Role ID`.
    -   **Channel/Category ID:** Right-click the channel or category you want to use and select `Copy Channel ID`.
3.  **Bot Token:** Go to the [Discord Developer Portal](https://discord.com/developers/applications), select your application, go to the `Bot` page, and click `Reset Token` (or `Copy Token` if visible) to get your token.

## Usage

HOB0T uses slash commands for its main functions.

### `/panelticket`

Creates the ticket panel in a specified channel. This panel contains the button that users click to create a new support ticket.

-   **Usage:** `/panelticket canal:<#channel-name>`
-   **Permissions:** Administrator only.
-   **Functionality:**
    -   Sends an embed with a "Crear ticket" button to the designated channel.
    -   The embed includes a title, description, thumbnail, and banner image.

### `/crearembed`

Initiates an interactive session to build a custom embed message.

-   **Usage:** `/crearembed canal:<#channel-name>`
-   **Permissions:** Any user with permission to send messages in the target channel.
-   **Functionality:**
    -   A temporary (ephemeral) message is shown to you with a preview of the embed and control buttons.
    -   Buttons include: `Título`, `Descripción`, `Color`, `Campos`, `Footer`, `Imagen`, and `Thumbnail`.
    -   Clicking a button opens a modal where you can input the new content.
    -   The preview updates in real-time.
    -   Click `Previsualizar` to refresh the preview, or `Enviar` to post the embed in the selected channel.

## License

This project is licensed under the **GNU General Public License v3.0**. See the `LICENSE` file for more details.
