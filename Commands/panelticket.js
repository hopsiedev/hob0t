import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
  .setName('panelticket')
  .setDescription('Crea un panel de tickets personalizado para soporte')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option =>
    option.setName('canal')
      .setDescription('Canal donde se enviará el panel de tickets')
      .setRequired(true));

async function execute(interaction) {
  const canal = interaction.options.getChannel('canal');
  
  const embed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle('Veltrix Network Soporte')
    .setDescription('¡Haz clic en el botón para presentar un Ticket y nuestro equipo hará todo lo posible para ayudarte de la mejor manera posible!')
    .setThumbnail('attachment://logo.png')
    .setImage('attachment://banner.gif')
    .setFooter({ text: 'Veltrix Network | Soporte' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('crear_ticket')
      .setLabel('Crear ticket 📩')
      .setStyle(ButtonStyle.Danger)
  );

  await canal.send({
    embeds: [embed],
    components: [row],
    files: [
      { attachment: path.join(__dirname, '../images/logo.png'), name: 'logo.png' },
      { attachment: path.join(__dirname, '../images/banner.gif'), name: 'banner.gif' }
    ]
  });
  
  await interaction.reply({
    content: `Panel de tickets enviado correctamente al canal ${canal}`,
    ephemeral: true
  });
}

export default { data, execute };