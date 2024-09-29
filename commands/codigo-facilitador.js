const { SlashCommandBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("codigo-facilitador")
    .setDescription("Recupera o código do Facilitador. (Facilitador)")
    .addStringOption((option) =>
      option
        .setName("pin")
        .setDescription("Digite seu PIN")
        .setRequired(true),
    ),

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
    
    // Get all facilitators from the database
    const facilitadores = await db.get("facilitadores");
    // Check if there are any facilitators
    if (!facilitadores || facilitadores.length === 0) {
      return interaction.reply({
        content: "Não há facilitadores cadastrados.",
        ephemeral: true,
      });
    }

    // Get the user object
    const facilitador = interaction.member;

    // Get the PIN from the interaction options
    const pin = interaction.options.getString("pin");
    
    // Get the facilitador if it exists
    const facilitadorEncontrado = facilitadores.find(
      (f) => f.handle === facilitador.user.username && f.pin === pin,
    );

    // Check if the facilitador exists
    if (!facilitadorEncontrado) {
      return interaction.reply({
        content: "PIN inválido ou usuário não cadastrado.",
        ephemeral: true,
      });
    }

    // Send the facilitador's code to the user
    interaction.reply({
      content: `Seu código é: ${facilitadorEncontrado.codigo}`,
      ephemeral: true,
    });
  }
};
