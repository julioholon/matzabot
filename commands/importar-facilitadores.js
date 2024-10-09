const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { userInfo } = require("os");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("importar-facilitadores")
    .setDescription(
      "Carrega os dados de facilitadores de um arquivo CSV com todos os facilitadores. (Admin)",
    )
    .addAttachmentOption((option) => {
      return option
        .setName("csv")
        .setDescription("Arquivo CSV com os facilitadores")
        .setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment("csv");
    const file = await fetch(attachment.attachment);
    const fileContent = await file.arrayBuffer();
    const fileString = new TextDecoder().decode(fileContent);
    const lines = fileString.split("\n").slice(1);

    await interaction.deferReply({ephemeral: true});
    
    facilitadores = lines.map((line) => {
      const [userid, handle, nomeCompleto, email, instituicao, pin, codigo] =
        line.split(",");
      if (handle) {
        return {
          userid,
          handle,
          nomeCompleto,
          email,
          instituicao,
          pin,
          codigo,
        };
      }
    });

    // Remove os undefined
    facilitadores = facilitadores.filter((facilitador) => facilitador !== undefined);
    
    // Verifica se já existe facilitadores no banco de dados
    // const existingFacilitadores = await db.get("facilitadores");
    // if (existingFacilitadores) {
    //   // Se já existir facilitadores, adiciona os novos facilitadores ao banco de dados
    //   facilitadores = existingFacilitadores.concat(facilitadores);
    // }
    console.log(facilitadores);
    await db.set("facilitadores", facilitadores);

    console.log(
      `ALERTA: ${facilitadores.length} facilitadores importados com sucesso.`,
    );

    // Send the file attachment to the user
    await interaction.editReply({
      content: `Importação de ${facilitadores.length} facilitadores concluida com sucesso.`,
      ephemeral: true,
    });
  },
};
