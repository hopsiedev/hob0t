import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

const TicketReview = {
  async sendReviewMenu(user) {
    try {
      const reviewMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`review_ticket_${user.id}`)
          .setPlaceholder('Selecciona una calificación')
          .addOptions([
            { label: '⭐ 1 Estrella', value: '1', description: 'Muy insatisfecho' },
            { label: '⭐⭐ 2 Estrellas', value: '2', description: 'Insatisfecho' },
            { label: '⭐⭐⭐ 3 Estrellas', value: '3', description: 'Neutral' },
            { label: '⭐⭐⭐⭐ 4 Estrellas', value: '4', description: 'Satisfecho' },
            { label: '⭐⭐⭐⭐⭐ 5 Estrellas', value: '5', description: 'Muy satisfecho' }
          ])
      );
      
      const reviewEmbed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('¡Califica nuestro soporte!')
        .setDescription('Tu opinión es muy importante para nosotros. Por favor califica la atención recibida en tu ticket.')
        .setFooter({ text: 'Veltrix Network | Sistema de Reviews' });
      
      await user.send({
        embeds: [reviewEmbed],
        components: [reviewMenu]
      });
    } catch (error) {
      console.error('Error al enviar DM de review:', error);
    }
  },

  async handleReview(interaction) {
    const rating = interaction.values[0];
    
    // Crear modal para comentario
    const modal = new ModalBuilder()
      .setCustomId(`review_comment_${rating}_${interaction.user.id}`)
      .setTitle('Comentario adicional (Opcional)');
    
    const commentInput = new TextInputBuilder()
      .setCustomId('review_comment')
      .setLabel('¿Tienes algún comentario adicional?')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Escribe tu comentario aquí... (opcional)')
      .setRequired(false)
      .setMaxLength(1000);
    
    const actionRow = new ActionRowBuilder().addComponents(commentInput);
    modal.addComponents(actionRow);
    
    await interaction.showModal(modal);
  },
  
  async handleReviewComment(interaction) {
    const [, , rating, userId] = interaction.customId.split('_');
    const comment = interaction.fields.getTextInputValue('review_comment') || 'Sin comentarios adicionales';
    const reviewsChannelId = '1396378282697429052';
    
    try {
      // Enviar review al canal de reviews
      const reviewsChannel = interaction.client.channels.cache.get(reviewsChannelId);
      if (reviewsChannel) {
        const reviewEmbed = new EmbedBuilder()
          .setColor('#f1c40f')
          .setTitle('📝 Nueva Review de Ticket')
          .addFields(
            { name: '👤 Usuario', value: `<@${interaction.user.id}>`, inline: true },
            { name: '⭐ Calificación', value: `${'⭐'.repeat(Number(rating))} (${rating}/5)`, inline: true },
            { name: '💬 Comentario', value: comment }
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: 'Veltrix Network | Sistema de Reviews' });
        
        await reviewsChannel.send({ embeds: [reviewEmbed] });
      }
      
      // Confirmar al usuario
      await interaction.reply({ 
        content: '✅ ¡Gracias por tu review! Tu opinión ha sido registrada.', 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Error al manejar review:', error);
      await interaction.reply({ 
        content: '❌ Hubo un error al procesar tu review.', 
        ephemeral: true 
      });
    }
  }
};

export default TicketReview;