const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("enviar-mensagem")
    .setDescription("Envia mensagem para os membros de um role. (Admin)")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role paar enviar a mensagem")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("mensagem")
        .setDescription("Mensagem para ser enviada")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const message = interaction.options.getString("mensagem");

    await interaction.deferReply({ ephemeral: true });

    // obter os membros do role
    role.members.forEach(async (member) => {
      // enviar mensagem para o membro
      await member.send(message);
    });

    await interaction.editReply({
      content: `Mensagem enviada para todos os membros de ${role}!`,
      ephemeral: true,
    });
  },
};
