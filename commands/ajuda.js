const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ajuda")
    .setDescription("Ajuda sobre os comandos do bot. (Todos)"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Ajuda do Matza Bot")
      .setDescription("Aqui estão os comandos disponíveis:");

    // loop through each command file and add it to the embed
    for (const file of fs.readdirSync("./commands")) {
      const command = require(`./${file}`);
      embed.addFields({
        name: "/"+command.data.name,
        value: command.data.description,
      });
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
