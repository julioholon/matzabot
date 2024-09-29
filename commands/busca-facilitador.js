const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

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

    let filteredFacilitadores = [];
    await Promise.all(
      await facilitadores.map(async (facilitador) => {
        // Check if the facilitador's name or email contains the search query
        if (
          facilitador.nomeCompleto
            .toLowerCase()
            .includes(busca.toLowerCase()) ||
          facilitador.email.toLowerCase().includes(busca.toLowerCase()) ||
          handle.toLowerCase().includes(busca.toLowerCase())
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
      let names = "";
      let instituicoes = "";
      let ids = "";
      let results = 0;
      filteredFacilitadores.forEach((fac) => {
        if (!fac) return;
        names += `${fac.nomeCompleto}\n`;
        instituicoes += `${fac.instituicao}\n`;
        ids += fac.userid ? `<@${fac.userid}>\n` :`@${fac.handle}\n`;
        results += 1;
      });

      // Return an Embed with the found data
      const embed = new EmbedBuilder()
        .setTitle("Resultados da busca")
        .setDescription(`Encontrados ${results} facilitadores.`)
        .setColor("Random")
        .setFooter({
          text: "Se você não sabe o PIN do Facilitador, pergunte para ele, clicando no seu nome.",
        });
      // Add the facilitators to the embed

      if (results) {
        embed.addFields(
          { name: "Nome", value: names, inline: true },
          { name: "ID", value: ids, inline: true },
          { name: "Instituição", value: instituicoes, inline: true },
        );
      }
      interaction.reply({ embeds: [embed], ephemeral: true });
    });
  },
};
