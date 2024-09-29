const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("obter-id")
    .setDescription("Ajuda sobre os comandos do bot. (Admin)")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuário para obter o ID")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    await interaction.reply({
      content: `O ID do usuário é: ${user.id}`,
      ephemeral: true,
    });
  },
};
