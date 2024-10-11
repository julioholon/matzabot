const { SlashCommandBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meu-facilitador")
    .setDescription("Retorna o nome do meu facilitador. (Aluno)"),

  async execute(interaction) {
    // obtain Facilitador role id
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "Estudantes",
    );
    // Verifica se o usuário já tem o role Estudantes
    if (!role || !interaction.member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: "Você não tem permissão para usar esse comando.",
        ephemeral: true,
      });
    }

    // Get all facilitators from the database
    const facilitadores = await db.get("facilitadores");
    // Get all students from the database
    const alunos = await db.get("alunos");

    // Check if there are any facilitators
    if (!facilitadores || facilitadores.length === 0) {
      return interaction.reply({
        content: "Não há facilitadores cadastrados.",
        ephemeral: true,
      });
    }

    // Get the user object
    const aluno = interaction.member;

    await interaction.deferReply({ ephemeral: true });
    
    // Get the facilitador if it exists
    const facilitadoresEncontrados = alunos.filter(
      (a) => a.aluno === aluno.user.id,
    );

    // Check if the facilitador exists
    if (!facilitadoresEncontrados) {
      return interaction.reply({
        content: "Facilitador não encontrato.",
        ephemeral: true,
      });
    }

    let found_fac = []
    await Promise.all(
      facilitadoresEncontrados.map(async (link) => {
        if (found_fac.includes(link.facilitador)) return false;
        found_fac.push(link.facilitador)
        userFac = await interaction.guild.members.fetch(link.facilitador);
        return userFac
      }),
    ).then(async (facilitadores) => {
      response = "Seu facilitador é:\n\n";
      facilitadores.forEach((facilitador) => {
        if (facilitador) {
          response += `- ${facilitador}\n`;
        }
      })
      await interaction.editReply({
        content: response,
        ephemeral: true,
      })
    });
  }
};
