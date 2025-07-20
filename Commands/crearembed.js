// GUÍA DEL SISTEMA DE EMBEDS
// Este comando permite crear embeds personalizados de forma interactiva
// Funciona con botones y modales para una experiencia visual completa

import { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

// CONFIGURACIÓN DEL COMANDO SLASH
// Define el comando /crearembed con opción de canal obligatoria
const data = new SlashCommandBuilder()
  .setName('crearembed')
  .setDescription('Crea un embed personalizado')
  .addChannelOption(option =>
    option.setName('canal')
      .setDescription('Canal donde enviar el embed')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

async function execute(interaction) {
  // VALIDACIÓN DEL CANAL
  // Verifica que el canal sea válido y el usuario tenga permisos
  const canal = interaction.options.getChannel('canal');
  if (!canal || canal.guildId !== interaction.guildId || canal.type !== ChannelType.GuildText) {
    return interaction.reply({ content: 'Selecciona un canal de texto válido en este servidor.', ephemeral: true });
  }
  if (!canal.permissionsFor(interaction.user).has(PermissionsBitField.Flags.SendMessages)) {
    return interaction.reply({ content: 'No tienes permisos para enviar mensajes en ese canal.', ephemeral: true });
  }
  
  // ESTRUCTURA DE DATOS DEL EMBED
  // Objeto que almacena toda la información del embed
  let embedData = {
    title: 'Título',           // Título principal del embed
    description: 'Descripción', // Descripción/contenido principal
    color: '#ff0000',          // Color del borde (rojo por defecto)
    fields: [],               // Array de campos adicionales
    footer: '',               // Texto del pie de página
    image: '',                // URL de imagen grande
    thumbnail: ''             // URL de imagen pequeña (esquina)
  };
  
  // FUNCIÓN CONSTRUCTORA DEL EMBED
  // Convierte los datos en un embed visual de Discord
  const buildEmbed = () => {
    const eb = new EmbedBuilder()
      .setTitle(embedData.title)
      .setDescription(embedData.description)
      .setColor(embedData.color);
    
    // Agregar elementos opcionales solo si existen
    if (embedData.fields.length) eb.addFields(embedData.fields);
    if (embedData.footer) eb.setFooter({ text: embedData.footer });
    if (embedData.image) eb.setImage(embedData.image);
    if (embedData.thumbnail) eb.setThumbnail(embedData.thumbnail);
    
    return eb;
  };
  
  // INTERFAZ DE BOTONES INTERACTIVOS
  // Crea los botones para editar cada parte del embed
  const getButtons = () => [
    // Primera fila: Elementos principales
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('edit_title').setLabel('Título').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('edit_description').setLabel('Descripción').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('edit_color').setLabel('Color').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('edit_fields').setLabel('Campos').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('edit_footer').setLabel('Footer').setStyle(ButtonStyle.Secondary)
    ),
    // Segunda fila: Imágenes y acciones
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('edit_image').setLabel('Imagen').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('edit_thumbnail').setLabel('Thumbnail').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('preview_embed').setLabel('Previsualizar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('send_embed').setLabel('Enviar').setStyle(ButtonStyle.Success)
    )
  ];
  
  // RESPUESTA INICIAL CON PREVIEW
  // Muestra el embed inicial con todos los botones de edición
  await interaction.reply({ 
    content: 'Configura tu embed:', 
    embeds: [buildEmbed()], 
    components: getButtons(), 
    ephemeral: true 
  });
  
  // COLLECTOR DE INTERACCIONES
  // Escucha los clics en botones durante 15 minutos
  const collector = interaction.channel.createMessageComponentCollector({ 
    filter: i => i.user.id === interaction.user.id, 
    time: 15 * 60 * 1000 
  });
  
  // MANEJO DE CLICS EN BOTONES
  collector.on('collect', async i => {
    if (!i.isButton()) return;
    
    // BOTONES DE EDICIÓN - Abren modales para editar texto
    if (i.customId === 'edit_title' || i.customId === 'edit_description' || i.customId === 'edit_color' || i.customId === 'edit_footer' || i.customId === 'edit_image' || i.customId === 'edit_thumbnail') {
      // Crear modal personalizado para cada campo
      const modal = new ModalBuilder()
        .setCustomId('modal_' + i.customId)
        .setTitle('Editar ' + i.customId.replace('edit_', ''));
      
      // Input de texto con valor actual
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('input')
          .setLabel('Nuevo valor')
          .setStyle(TextInputStyle.Short)
          .setValue(embedData[i.customId.replace('edit_', '')] || '')
      ));
      
      await i.showModal(modal);
    } 
    // BOTÓN ESPECIAL PARA CAMPOS - Modal con dos inputs
    else if (i.customId === 'edit_fields') {
      const modal = new ModalBuilder()
        .setCustomId('modal_fields')
        .setTitle('Agregar campo');
      
      // Dos inputs: nombre y valor del campo
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Nombre')
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('value')
            .setLabel('Valor')
            .setStyle(TextInputStyle.Paragraph)
        )
      );
      
      await i.showModal(modal);
    } 
    // BOTÓN PREVISUALIZAR - Actualiza el embed en tiempo real
    else if (i.customId === 'preview_embed') {
      await i.update({ embeds: [buildEmbed()], components: getButtons() });
    } 
    // BOTÓN ENVIAR - Envía el embed al canal y termina
    else if (i.customId === 'send_embed') {
      await canal.send({ embeds: [buildEmbed()] });
      await i.update({ content: '¡Embed enviado!', embeds: [], components: [] });
      collector.stop();
    }
  });
  
  // MANEJO DE MODALES (FORMULARIOS)
  // Escucha cuando el usuario envía un modal
  interaction.client.on('interactionCreate', async modalInt => {
    if (!modalInt.isModalSubmit() || modalInt.user.id !== interaction.user.id) return;
    
    // MODALES DE EDICIÓN SIMPLE - Un solo campo
    if (modalInt.customId.startsWith('modal_edit_')) {
      const field = modalInt.customId.replace('modal_edit_', '');
      embedData[field] = modalInt.fields.getTextInputValue('input');
      
      // Actualizar preview automáticamente
      await modalInt.update({ embeds: [buildEmbed()], components: getButtons() });
    } 
    // MODAL DE CAMPOS - Dos inputs (nombre y valor)
    else if (modalInt.customId === 'modal_fields') {
      embedData.fields.push({
        name: modalInt.fields.getTextInputValue('name'),
        value: modalInt.fields.getTextInputValue('value'),
        inline: false
      });
      
      // Actualizar preview con el nuevo campo
      await modalInt.update({ embeds: [buildEmbed()], components: getButtons() });
    }
  });
}

// EXPORTACIÓN DEL COMANDO
export default { data, execute };

/*
GUÍA DE USO:
1. Usa /crearembed en cualquier canal
2. Selecciona el canal donde quieres enviar el embed
3. Usa los botones para editar cada parte:
   - Título: Texto principal del embed
   - Descripción: Contenido principal
   - Color: Código hex (#ff0000) o nombre (red)
   - Campos: Secciones adicionales con nombre y valor
   - Footer: Texto pequeño al final
   - Imagen: URL de imagen grande
   - Thumbnail: URL de imagen pequeña
4. Usa "Previsualizar" para ver cambios en tiempo real
5. Usa "Enviar" para publicar el embed final

CARACTERÍSTICAS:
- Preview en tiempo real
- Interfaz completamente visual
- Validación de permisos
- Timeout de 15 minutos
- Soporte para múltiples campos
- Compatible con URLs de imágenes
*/