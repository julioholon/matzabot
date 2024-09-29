const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registro-facilitador")
    .setDescription("Registre-se como novo Facilitador. (Facilitador)"),

  async execute(interaction) {
    // obtain Facilitador role id
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "Facilitadores",
    );
    // Verifica se o usuário já tem o role Facilitador
    if (!role || !interaction.member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: "Você não tem permissão para usar esse comando.",
        ephemeral: true,
      });
    }

    // Cria um modal para o usuário colocar seus dados
    const modal = new ModalBuilder()
      .setCustomId("RegistroFacilitador")
      .setTitle("Cadastro de Facilitador");

    const fullNameInput = new TextInputBuilder()
      .setCustomId("nomeCompleto")
      .setLabel("Digite seu nome completo")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const fullnameRow = new ActionRowBuilder().addComponents(fullNameInput);

    const emailInput = new TextInputBuilder()
      .setCustomId("email")
      .setLabel("Digite seu email")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const emailRow = new ActionRowBuilder().addComponents(emailInput);

    const instituicaoInput = new TextInputBuilder()
      .setCustomId("instituicao")
      .setLabel("Digite sua Instituição")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);
    const instituicaoRow = new ActionRowBuilder().addComponents(
      instituicaoInput,
    );

    const pinInput = new TextInputBuilder()
      .setCustomId("pin")
      .setLabel("Digite seu PIN (4 dígitos)")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)
      .setRequired(true);
    const pinRow = new ActionRowBuilder().addComponents(pinInput);

    modal.addComponents(fullnameRow, emailRow, instituicaoRow, pinRow);

    await interaction.showModal(modal);
  },
};
