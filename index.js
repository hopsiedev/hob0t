import { Client, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import path from 'path';
import fs from 'fs';
import TicketManager from './TicketSystem/TicketManager.js';
import TicketPanelBuilder from './TicketSystem/TicketPanelBuilder.js';
import TicketReview from './TicketSystem/TicketReview.js';
import utils from './TicketSystem/utils.js';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember]
  });

  client.commands = new Map();
  const commandsPath = path.join(__dirname, 'Commands');
  fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.js')) {
      const fileUrl = pathToFileURL(path.join(commandsPath, file));
      import(fileUrl).then(commandModule => {
        const command = commandModule.default;
        client.commands.set(command.data.name, command);
      });
    }
  });

  // Configuración interna
  const staffRoleId = 'id_del_rol';
  const logsChannelId = 'id_del_canal_de_logs';
  const archiveCategoryId = 'id_de_categoria_archivados';
  const reviewsChannelId = 'id_del_canal_de_reviews';
const token = 'TU_TOKEN_AQUI';

  client.once('ready', () => {
    const guild = client.guilds.cache.first();
    if (guild) {
      const totalMiembros = formatearMiembros(guild.memberCount);
      client.user.setActivity(`Viendo a ${totalMiembros} miembros`, { type: ActivityType.Watching });
      client.commands.forEach(cmd => {
        guild.commands.create(cmd.data);
      });
    } else {
      client.user.setActivity('Viendo a los miembros', { type: ActivityType.Watching });
    }
    console.log(`Bot listo como ${client.user.tag}`);
  });

  client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) {
        try {
          if (interaction.commandName === 'panelticket' && !utils.isAdmin(interaction.member)) {
            return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
          }
          await command.execute(interaction);
        } catch (error) {
          await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
        }
      }
    }
    
    if (interaction.isButton() && interaction.customId === 'crear_ticket') {
      if (!utils.isValidId(staffRoleId) || !utils.isValidId(logsChannelId) || !utils.isValidId(archiveCategoryId)) {
        return interaction.reply({ content: 'Configuración inválida de IDs.', ephemeral: true });
      }
      const logsChannel = utils.getChannelById(interaction.guild, logsChannelId);
      const archiveCategory = utils.getCategoryById(interaction.guild, archiveCategoryId);
      if (!logsChannel || !archiveCategory) {
        return interaction.reply({ content: 'No se encontró el canal de logs o la categoría de archivados.', ephemeral: true });
      }
      await TicketManager.crearTicket(interaction, staffRoleId, logsChannelId, archiveCategoryId);
    }
    
    if (interaction.isButton() && interaction.customId.startsWith('claim_ticket_')) {
      await TicketManager.claimTicket(interaction);
    }
    
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_control_panel') {
      await TicketManager.controlPanel(interaction);
    }
    
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_review') {
      await TicketReview.handleReview(interaction, reviewsChannelId);
    }
    
    // Al cerrar un ticket, enviar menú de review
    if (interaction.customId && interaction.customId.startsWith('close_ticket_')) {
      await TicketReview.sendReviewMenu(interaction, interaction.user.id);
    }
    
    // Al recibir la review del usuario
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('review_ticket_')) {
      await TicketReview.handleReview(interaction);
    }
    
    if (interaction.isButton() && interaction.customId.startsWith('confirm_close_')) {
      await TicketManager.confirmCloseTicket(interaction);
    }
    
    if (interaction.isButton() && interaction.customId.startsWith('cancel_close_')) {
      await TicketManager.cancelCloseTicket(interaction);
    }
    
    // Manejar modales de review
    if (interaction.isModalSubmit() && interaction.customId.startsWith('review_comment_')) {
      await TicketReview.handleReviewComment(interaction);
    }
  });

  client.login(token);

  function formatearMiembros(numero) {
    return numero.toLocaleString('es-ES');
  }
}

main();