const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("upload-codigos")
    .setDescription("Enviar um arquivo CSV com todos os códigos. (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addAttachmentOption((option) =>
      option
        .setName("csv")
        .setDescription("CSV com os códigos")
        .setRequired(true),
    ),

  async execute(interaction) {
    // Get the file attachment
    const attachment = interaction.options.getAttachment("csv");

    await interaction.deferReply({ephemeral: true});
    
    const file = await fetch(attachment.attachment);
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    const lines = text.split("\n");
    const codes = lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    db.set("codigos", codes);
    console.log(
      `ALERTA: Códigos atualizados, agora com ${codes.length} códigos.`,
    );
    interaction.editReply({ content: "Códigos atualizados!", ephemeral: true });
  },
};
