const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { Client } = require('@replit/object-storage');
const client = new Client();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("matza-backup")
    .setDescription("Faz um backup do banco de dados do bot. (Admin)")
    .addSubcommand(subcommand => {
      return subcommand
        .setName("gravar")
        .setDescription("Cria um backup do banco de dados do bot. (Admin)");
    })
    .addSubcommand(subcommand => {
      return subcommand
        .setName("restaurar")
        .setDescription("Restaura um backup do banco de dados do bot. (Admin)");
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "gravar") {
      dbcontents = await db.all()
      const { ok, error } = await client.uploadFromText('backup.json', JSON.stringify(dbcontents));
      if (!ok) {
        console.log(error);
        interaction.reply({
          content: "Ocorreu um erro ao fazer o backup do banco de dados.",
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({
        content: "Backup gravado com sucesso!",
        ephemeral: true,
      });
    }

    if (subcommand === "restaurar") {
      const { ok, value , error } = await client.downloadAsText('backup.json');
      if (!ok) {
        console.error(error);
        await interaction.reply({
          content: "Ocorreu um erro ao tentar restaurar o backup.",
          ephemeral: true,
        });
        return;
      }
      const db_array = JSON.parse(value);
      for (const key in db_array) {
        db.set(key, db_array[key]);
      }
      await interaction.reply({
        content: "Backup restaurado com sucesso!",
        ephemeral: true,
      });
    };
  },
};
