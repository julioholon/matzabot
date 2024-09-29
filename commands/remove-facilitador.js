const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-facilitador")
    .setDescription("Remove um ou mais facilitadores do cadastro. (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("Email para remover")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("todos")
        .setDescription("Remover todos?")
        .setRequired(false),
    ),

  async execute(interaction) {
    // Check it todos was passed, then remove all facilitators
    const todos = interaction.options.getBoolean("todos");
    if (todos) {
      await db.delete("facilitadores");
      console.log("ALERTA: Todos os facilitadores foram removidos.");
      return interaction.reply({
        content: "Todos os facilitadores foram removidos!",
        ephemeral: true,
      });
    }
    // Get the email to remove
    const email = interaction.options.getString("email");
    // Get the facilitators from the database
    const facilitadores = await db.get("facilitadores");
    // Check if the email exists
    if (!facilitadores || !facilitadores.find((f) => f.email)) {
      return interaction.reply({
        content: "Esse email não foi cadastrado.",
        ephemeral: true,
      });
    }
    // Remove the facilitator from the database
    await db.pull("facilitadores", (f) => f.email === email);
    console.log(`ALERTA: Facilitador ${email} removido com sucesso.`);
    // Send a message to the user
    return interaction.reply({
      content: `O facilitador '${email}' foi removido com sucesso.`,
      ephemeral: true,
    });
  },
};
