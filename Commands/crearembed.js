import { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

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
  const canal = interaction.options.getChannel('canal');
  if (!canal || canal.guildId !== interaction.guildId || canal.type !== ChannelType.GuildText) {
    return interaction.reply({ content: 'Selecciona un canal de texto válido en este servidor.', ephemeral: true });
  }
  if (!canal.permissionsFor(interaction.user).has(PermissionsBitField.Flags.SendMessages)) {
    return interaction.reply({ content: 'No tienes permisos para enviar mensajes en ese canal.', ephemeral: true });
  }
  let embedData = {
    title: 'Título',
    description: 'Descripción',
    color: '#ff0000',
    fields: [],
    footer: '',
    image: '',
    thumbnail: ''
  };
  const buildEmbed = () => {
    const eb = new EmbedBuilder()
      .setTitle(embedData.title)
      .setDescription(embedData.description)
      .setColor(embedData.color);
    if (embedData.fields.length) eb.addFields(embedData.fields);
    if (embedData.footer) eb.setFooter({ text: embedData.footer });
    if (embedData.image) eb.setImage(embedData.image);
    if (embedData.thumbnail) eb.setThumbnail(embedData.thumbnail);
    return eb;
  };
  const getButtons = () => [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('edit_title').setLabel('Título').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('edit_description').setLabel('Descripción').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('edit_color').setLabel('Color').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('edit_fields').setLabel('Campos').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('edit_footer').setLabel('Footer').setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('edit_image').setLabel('Imagen').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('edit_thumbnail').setLabel('Thumbnail').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('preview_embed').setLabel('Previsualizar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('send_embed').setLabel('Enviar').setStyle(ButtonStyle.Success)
    )
  ];
  await interaction.reply({ content: 'Configura tu embed:', embeds: [buildEmbed()], components: getButtons(), ephemeral: true });
  const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 15 * 60 * 1000 });
  collector.on('collect', async i => {
    if (!i.isButton()) return;
    if (i.customId === 'edit_title' || i.customId === 'edit_description' || i.customId === 'edit_color' || i.customId === 'edit_footer' || i.customId === 'edit_image' || i.customId === 'edit_thumbnail') {
      const modal = new ModalBuilder().setCustomId('modal_' + i.customId).setTitle('Editar ' + i.customId.replace('edit_', ''));
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('input')
          .setLabel('Nuevo valor')
          .setStyle(TextInputStyle.Short)
          .setValue(embedData[i.customId.replace('edit_', '')] || '')
      ));
      await i.showModal(modal);
    } else if (i.customId === 'edit_fields') {
      const modal = new ModalBuilder().setCustomId('modal_fields').setTitle('Agregar campo');
      modal.addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Nombre').setStyle(TextInputStyle.Short)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('value').setLabel('Valor').setStyle(TextInputStyle.Paragraph))
      );
      await i.showModal(modal);
    } else if (i.customId === 'preview_embed') {
      await i.update({ embeds: [buildEmbed()], components: getButtons() });
    } else if (i.customId === 'send_embed') {
      await canal.send({ embeds: [buildEmbed()] });
      await i.update({ content: '¡Embed enviado!', embeds: [], components: [] });
      collector.stop();
    }
  });
  interaction.client.on('interactionCreate', async modalInt => {
    if (!modalInt.isModalSubmit() || modalInt.user.id !== interaction.user.id) return;
    if (modalInt.customId.startsWith('modal_edit_')) {
      const field = modalInt.customId.replace('modal_edit_', '');
      embedData[field] = modalInt.fields.getTextInputValue('input');
      await modalInt.update({ embeds: [buildEmbed()], components: getButtons() });
    } else if (modalInt.customId === 'modal_fields') {
      embedData.fields.push({ name: modalInt.fields.getTextInputValue('name'), value: modalInt.fields.getTextInputValue('value'), inline: false });
      await modalInt.update({ embeds: [buildEmbed()], components: getButtons() });
    }
  });
}

export default { data, execute };