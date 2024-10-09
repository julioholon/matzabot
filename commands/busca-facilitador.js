const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Table = require("easy-table");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("busca-facilitador")
    .setDescription("Lista todos os facilitadores. (Todos)")
    .addStringOption((option) =>
      option
        .setName("busca")
        .setDescription("Texto para busca")
        .setRequired(false),
    ),

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

    // Get the search query
    busca = interaction.options.getString("busca") || "";

    await interaction.deferReply({ ephemeral: true });

    let filteredFacilitadores = [];
    await Promise.all(
      await facilitadores.map(async (facilitador) => {
        // Check if the facilitador's name or email contains the search query
        if (
          facilitador.nomeCompleto
            .toLowerCase()
            .includes(busca.toLowerCase()) ||
          facilitador.email.toLowerCase().includes(busca.toLowerCase()) ||
          facilitador.handle.toLowerCase().includes(busca.toLowerCase())
        ) {
          return {
            handle: facilitador.handle,
            nomeCompleto: facilitador.nomeCompleto,
            email: facilitador.email,
            instituicao: facilitador.instituicao,
            userid: facilitador.userid,
          };
        }
      }),
    ).then(async (filteredFacilitadores) => {
      let found = 0;
      let pages = [];
      const pageSize = 30;

      // sort facilitators by name
      filteredFacilitadores.sort((a, b) => {
        const nameA = a.nomeCompleto.toLowerCase();
        const nameB = b.nomeCompleto.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      for (i = 0; i < filteredFacilitadores.length; i += pageSize) {
        let resp = "";
        for (j = i; j < i + pageSize && j < filteredFacilitadores.length; j++) {
          if (filteredFacilitadores[j]) {
            fac = filteredFacilitadores[j];
            resp += `${fac.nomeCompleto} ( ${fac.instituicao} ) <@${fac.userid}>\n`;
            found++;
          }
        }
        pages.push(resp);
      }
      // Return the results:

      let response = "**Resultados da busca:**\n";
      if (found === 0) {
        response += "\nNenhum facilitador encontrado.";

        interaction.editReply({
          content: response,
          ephemeral: true,
        });
      } else {
        response += "\n\n**Facilitadores encontrados:**\n";
        interaction.editReply({
          content: response,
          ephemeral: true,
        });
        pages.forEach((page) => {
          interaction.followUp({
            content: page.toString(),
            ephemeral: true,
          });
        });
      }
    });
  },
};
