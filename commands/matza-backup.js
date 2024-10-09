const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { Client } = require("@replit/object-storage");
const client = new Client();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("matza-backup")
    .setDescription("Faz um backup do banco de dados do bot. (Admin)")
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("gravar")
        .setDescription("Cria um backup do banco de dados do bot. (Admin)");
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("restaurar")
        .setDescription("Restaura um backup do banco de dados do bot. (Admin)");
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    await interaction.deferReply({ ephemeral: true });

    if (subcommand === "gravar") {
      dbcontents = await db.all();
      const { ok, error } = await client.uploadFromText(
        "backup.json",
        JSON.stringify(dbcontents),
      );
      if (!ok) {
        console.log(error);
        interaction.editReply({
          content: "Ocorreu um erro ao fazer o backup do banco de dados.",
          ephemeral: true,
        });
        return;
      }
      await interaction.editReply({
        content: "Backup gravado com sucesso!",
        ephemeral: true,
      });
    }

    if (subcommand === "restaurar") {
      const { ok, value, error } = await client.downloadAsText("backup.json");
      if (!ok) {
        console.error(error);
        await interaction.editReply({
          content: "Ocorreu um erro ao tentar restaurar o backup.",
          ephemeral: true,
        });
        return;
      }
      const db_array = JSON.parse(value);
      for (const n in db_array) {
        db.set(db_array[n].id, db_array[n].value);
      }
      await interaction.editReply({
        content: "Backup restaurado com sucesso!",
        ephemeral: true,
      });
    }
  },
};
