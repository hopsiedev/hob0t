import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionsBitField, ChannelType } from 'discord.js';
import TicketReview from './TicketReview.js';
import fs from 'fs';
import path from 'path';

// Configuración interna
const staffRoleId = '1396377979818606614';
const logsChannelId = '1396378212145168497';
const archiveCategoryId = '1396406452192809012';

// Ruta del archivo contador
const counterFilePath = path.join(process.cwd(), 'TicketSystem', 'ticketCounter.json');

// Función para obtener y actualizar el contador
function getNextTicketNumber() {
  try {
    let counterData = { count: 0 };
    
    // Leer el archivo si existe
    if (fs.existsSync(counterFilePath)) {
      const fileContent = fs.readFileSync(counterFilePath, 'utf8');
      counterData = JSON.parse(fileContent);
    }
    
    // Incrementar el contador
    counterData.count += 1;
    
    // Guardar el nuevo contador
    fs.writeFileSync(counterFilePath, JSON.stringify(counterData, null, 2));
    
    // Retornar el número formateado con ceros a la izquierda
    return counterData.count.toString().padStart(6, '0');
  } catch (error) {
    console.error('Error al manejar el contador de tickets:', error);
    // En caso de error, usar timestamp como fallback
    return Date.now().toString().slice(-6);
  }
}

const TicketManager = {
  async crearTicket(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    
    // Verificar si el usuario ya tiene un ticket abierto
    const existingTicket = guild.channels.cache.find(c => 
      c.name.startsWith('ticket-') && 
      c.permissionOverwrites.cache.has(user.id)
    );
    
    if (existingTicket) {
      await interaction.reply({ content: 'Ya tienes un ticket abierto.', flags: 64 });
      return;
    }
    
    // Obtener el siguiente número de ticket
    const ticketNumber = getNextTicketNumber();
    const channelName = `ticket-${ticketNumber}`;
    
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
        { id: staffRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] }
      ]
    });
    
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('¡Bienvenido a tu ticket!')
      .setDescription(`**Ticket #${ticketNumber}**\n\nPor favor, describe tu problema y un miembro del staff te atenderá pronto.`)
      .setFooter({ text: `Ticket ID: ${ticketNumber}` });
      
    await channel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed] });
    
    const controlRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_control_panel')
        .setPlaceholder('Opciones del ticket')
        .addOptions([
          { label: 'Cerrar ticket', value: 'close_ticket', emoji: '🔒' },
          { label: 'Renombrar ticket', value: 'rename_ticket', emoji: '✏️' },
          { label: 'Archivar ticket', value: 'archive_ticket', emoji: '📁' }
        ])
    );
    await channel.send({ content: 'Panel de control:', components: [controlRow] });
    
    const logsChannel = guild.channels.cache.get(logsChannelId);
    if (logsChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('¡Solicitud de soporte entrante!')
        .setDescription(`**Ticket #${ticketNumber}**\n\n<@${user.id}> ha creado un nuevo ticket. Haz clic en el botón de abajo para reclamarlo.`)
        .addFields(
          { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🎫 Ticket ID', value: ticketNumber, inline: true },
          { name: '📅 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setFooter({ text: 'Veltrix Network | Ticket' });
        
      const claimRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`claim_ticket_${channel.id}`)
          .setLabel('Reclamar Ticket')
          .setStyle(ButtonStyle.Primary)
      );
      
      await logsChannel.send({
        content: `<@&${staffRoleId}>`,
        embeds: [logEmbed],
        components: [claimRow]
      });
    }
    
    await interaction.reply({ content: `Tu ticket ha sido creado: ${channel} (Ticket #${ticketNumber})`, flags: 64 });
  },

  async claimTicket(interaction) {
    const channelId = interaction.customId.split('_')[2]; // Extraer ID del canal del customId
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel) {
      await interaction.reply({ content: 'El canal del ticket no existe.', flags: 64 });
      return;
    }
    
    const member = interaction.member;
    if (!member.roles.cache.has(staffRoleId)) {
      await interaction.reply({ content: 'No tienes permisos para reclamar tickets.', flags: 64 });
      return;
    }
    
    const claimEmbed = new EmbedBuilder()
      .setColor('#f39c12')
      .setTitle('Ticket Reclamado')
      .setDescription(`Este ticket ha sido reclamado por ${member.user.tag}`)
      .setTimestamp();
    
    await channel.send({ embeds: [claimEmbed] });
    await interaction.reply({ content: `Has reclamado el ticket ${channel}.`, flags: 64 });
    
    // Actualizar el mensaje original para deshabilitar el botón
    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`claim_ticket_${channel.id}`)
        .setLabel('Ticket Reclamado')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    
    await interaction.message.edit({ components: [disabledRow] });
  },

  async controlPanel(interaction) {
    const member = interaction.member;
    const channel = interaction.channel;
    const selectedValue = interaction.values[0];
    
    // Verificar que el usuario tenga permisos (staff o creador del ticket)
    const isStaff = member.roles.cache.has(staffRoleId);
    const isTicketOwner = channel.name.includes(member.user.id);
    
    if (!isStaff && !isTicketOwner) {
      await interaction.reply({ content: 'No tienes permisos para usar este panel de control.', flags: 64 });
      return;
    }
    
    switch (selectedValue) {
      case 'close_ticket':
        await this.closeTicket(interaction);
        break;
      case 'rename_ticket':
        await this.renameTicket(interaction);
        break;
      case 'archive_ticket':
        await this.archiveTicket(interaction);
        break;
      default:
        await interaction.reply({ content: 'Opción no válida.', flags: 64 });
    }
  },
  
  async closeTicket(interaction) {
    const channel = interaction.channel;
    
    const confirmEmbed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('Cerrar Ticket')
      .setDescription('¿Estás seguro de que quieres cerrar este ticket?');
    
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_close_${channel.id}`)
        .setLabel('Sí, cerrar')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancel_close_${channel.id}`)
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
    );
    
    await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], flags: 64 });
  },
  
  async renameTicket(interaction) {
    await interaction.reply({ 
      content: 'Para renombrar el ticket, usa el comando `/rename` seguido del nuevo nombre.', 
      flags: 64 
    });
  },
  
  async archiveTicket(interaction) {
    const channel = interaction.channel;
    const guild = interaction.guild;
    const archiveCategory = guild.channels.cache.get(archiveCategoryId);
    
    if (!archiveCategory) {
      await interaction.reply({ content: 'No se encontró la categoría de archivados.', flags: 64 });
      return;
    }
    
    // Buscar al usuario que creó el ticket
    const userOverwrite = channel.permissionOverwrites.cache.find(overwrite => 
      overwrite.type === 1 && // Type 1 = Member
      overwrite.id !== guild.roles.everyone.id &&
      overwrite.id !== staffRoleId
    );
    
    let ticketCreator = null;
    if (userOverwrite) {
      ticketCreator = await guild.members.fetch(userOverwrite.id).catch(() => null);
    }
    
    try {
      // Mover a la categoría de archivados
      await channel.setParent(archiveCategory);
      
      // Cambiar el nombre del canal
      const originalName = channel.name;
      await channel.setName(`archived-${originalName}`);
      
      // Actualizar permisos: solo staff puede ver el canal archivado
      await channel.permissionOverwrites.set([
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: staffRoleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]);
      
      const archiveEmbed = new EmbedBuilder()
        .setColor('#95a5a6')
        .setTitle('Ticket Archivado')
        .setDescription('Este ticket ha sido archivado. Solo el staff puede acceder a él.')
        .addFields(
          { name: '🔒 Acceso', value: 'Solo Staff', inline: true },
          { name: '📅 Archivado', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '⏰ Eliminación', value: 'En 5 segundos', inline: true }
        )
        .setTimestamp();
      
      await channel.send({ embeds: [archiveEmbed] });
      await interaction.reply({ content: 'Ticket archivado exitosamente. Se eliminará en 5 segundos.', flags: 64 });
      
      // Enviar mensaje al usuario que creó el ticket
      if (ticketCreator) {
        try {
          const userNotificationEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('📁 Ticket Archivado')
            .setDescription(`Tu ticket **${originalName}** ha sido archivado por el staff.`)
            .addFields(
              { name: '📅 Fecha de archivado', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
              { name: '🗑️ Estado', value: 'El ticket será eliminado automáticamente', inline: true }
            )
            .setFooter({ text: 'Veltrix Network | Sistema de Tickets' })
            .setTimestamp();
          
          await ticketCreator.send({ embeds: [userNotificationEmbed] });
        } catch (error) {
          console.error('Error al enviar DM al usuario:', error);
        }
      }
      
      // Eliminar el canal después de 5 segundos
      setTimeout(async () => {
        try {
          await channel.delete();
        } catch (error) {
          console.error('Error al eliminar el canal archivado:', error);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error al archivar ticket:', error);
      await interaction.reply({ content: 'Error al archivar el ticket.', flags: 64 });
    }
  },
  
  async confirmCloseTicket(interaction) {
    const channel = interaction.channel;
    const guild = interaction.guild;
    
    // Extraer el número de ticket del nombre del canal
    const ticketNumber = channel.name.split('-')[1];
    
    // Buscar al usuario que tiene permisos en este canal
    const userOverwrite = channel.permissionOverwrites.cache.find(overwrite => 
      overwrite.type === 1 && // Type 1 = Member
      overwrite.id !== guild.roles.everyone.id &&
      overwrite.id !== staffRoleId
    );
    
    let user = null;
    if (userOverwrite) {
      user = await guild.members.fetch(userOverwrite.id).catch(() => null);
    }
    
    try {
      const closeEmbed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('Ticket Cerrado')
        .setDescription(`**Ticket #${ticketNumber}** ha sido cerrado. Gracias por contactarnos.`)
        .setFooter({ text: `Ticket ID: ${ticketNumber}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [closeEmbed] });
      
      // Enviar menú de review al usuario si existe al DM
      if (user) {
        try {
          await TicketReview.sendReviewMenu(user.user);
        } catch (error) {
          console.error('Error al enviar menú de review:', error);
        }
      }
      
      // Esperar 10 segundos antes de eliminar el canal para dar tiempo a la review
      setTimeout(async () => {
        try {
          await channel.delete();
        } catch (error) {
          console.error('Error al eliminar el canal:', error);
        }
      }, 10000);
    } catch (error) {
      console.error('Error al cerrar ticket:', error);
      await interaction.reply({ content: 'Error al cerrar el ticket.', flags: 64 });
    }
  },
  
  async cancelCloseTicket(interaction) {
    const cancelEmbed = new EmbedBuilder()
      .setColor('#95a5a6')
      .setTitle('Cierre Cancelado')
      .setDescription('El cierre del ticket ha sido cancelado.');
    
    await interaction.reply({ embeds: [cancelEmbed], flags: 64 });
  }
};

export default TicketManager;