const { SlashCommandBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meus-alunos")
    .setDescription("Retorna uma lista dos meus alunos. (Facilitador)"),

  async execute(interaction) {
    // obtain Facilitador role id
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "FacilitadoresAtivos",
    );
    // Verifica se o usuário já tem o role FacilitadoresAtivos
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
    const facilitador = interaction.member;

    await interaction.deferReply({ ephemeral: true });
    
    // Get the alunos if they exist
    const alunosEncontrados = alunos.filter(
      (f) => f.facilitador === facilitador.user.id,
    );

    // Check if found any
    if (!alunosEncontrados) {
      return interaction.reply({
        content: "Nenhum aluno encontrado.",
        ephemeral: true,
      });
    }

    let found_alunos = []
    console.log(alunosEncontrados)
    await Promise.all(
      alunosEncontrados.map(async (link) => {
        if (found_alunos.includes(link.aluno)) return false;
        found_alunos.push(link.aluno)
        userAluno = await interaction.guild.members.fetch(link.aluno);
        return userAluno
      }),
    ).then(async (alunos) => {
      response = "Lista de alunos:\n\n";
      alunos.forEach((aluno) => {
        if (aluno) {
          response += `- ${aluno}\n`;
        }
      })
      await interaction.editReply({
        content: response,
        ephemeral: true,
      })
    });
  }
};
