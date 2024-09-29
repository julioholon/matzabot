const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exportar-facilitadores")
    .setDescription("Exporta um arquivo CSV com todos os facilitadores. (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    // Get all facilitators from the database
    const facilitadores = await db.get("facilitadores");
    // Check if there are any facilitators
    if (!facilitadores || facilitadores.length === 0) {
      return interaction.reply({
        content: "Não há facilitadores cadastrados.",
        ephemeral: true,
      });
    }

    let filteredFacilitadores = [];
    await Promise.all(
      await facilitadores.map(async (facilitador) => {
        // Get discord handle for the facilitador
        user = await interaction.guild.members.fetch(facilitador.userid);
        handle = user.user.username;
        // Check if the facilitador's name or email contains the search query
        return {
          userid: facilitador.userid,
          handle: facilitador.handle,
          nomeCompleto: facilitador.nomeCompleto,
          email: facilitador.email,
          instituicao: facilitador.instituicao,
          pin: facilitador.pin,
          codigo: facilitador.codigo,
        };
      }),
    ).then(async (filteredFacilitadores) => {
      let csv = "ID,Username,Nome,Email,Instituição,PIN,Código\n";

      filteredFacilitadores.forEach((fac) => {
        csv = csv.concat(
          `${fac.userid},${fac.handle},${fac.nomeCompleto},${fac.email},` +
            `${fac.instituicao},${fac.pin},${fac.codigo}\n`,
        );
      });

      console.log(csv);

      // Create a file attachment with the CSV data
      const attachment = new AttachmentBuilder(Buffer.from(csv, "utf-8"), {
        name: "facilitadores.csv",
      });

      // Send the file attachment to the user
      await interaction.reply({
        content: "Segue o arquivo CSV com todos os facilitadores.",
        files: [attachment],
        ephemeral: true,
      });
    });
  },
};
