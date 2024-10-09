const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exportar-alunos")
    .setDescription("Exporta um arquivo CSV com todos os alunos. (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
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

    await interaction.deferReply({ ephemeral: true });

    let csv = "NomeFacilitador,UsernameFacilitador,NomeAluno,UsernameAluno\n";

    await Promise.all(
      alunos.map(async (aluno) => {
        let facilitador = await facilitadores.find((f) => f.userid === aluno.facilitador);
        userAluno = await interaction.guild.members.fetch(aluno.aluno);
        if (facilitador) {
          return {
            nomeFacilitador: facilitador.nomeCompleto,
            usernameFacilitador: facilitador.handle,
            nomeAluno: userAluno.user.displayName,
            usernameAluno: userAluno.user.username,
          };
        }
      }),
    ).then(async (alunos) => {
      alunos.forEach((aluno) => {
        if (aluno) csv = csv.concat(
          `${aluno.nomeFacilitador},${aluno.usernameFacilitador},${aluno.nomeAluno},${aluno.usernameAluno}\n`,
        );
      });

      console.log(csv);

      // Create a file attachment with the CSV data
      const attachment = new AttachmentBuilder(Buffer.from(csv, "utf-8"), {
        name: "alunos.csv",
      });

      // Send the file attachment to the user
      await interaction.editReply({
        content: "Segue o arquivo CSV com todos os alunos.",
        files: [attachment],
        ephemeral: true,
      });
    });
  },
};
