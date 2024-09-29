const { SlashCommandBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("conecta-facilitador")
    .setDescription(
      "Permite se conectar com um Facilitador e receber um código. (Alunos)",
    )
    .addUserOption((option) =>
      option
        .setName("facilitador")
        .setDescription("Facilitador que deseja se conectar")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("pin")
        .setDescription("Senha de 4 dígitos para conectar")
        .setRequired(true),
    ),

  async execute(interaction) {
    // obtain Facilitador role id
    const estRole = interaction.guild.roles.cache.find(
      (role) => role.name === "Estudantes",
    );
    // Verifica se o usuário já tem o role Facilitador
    if (!estRole || !interaction.member.roles.cache.has(estRole.id)) {
      return interaction.reply({
        content: "Você não tem permissão para usar esse comando.",
        ephemeral: true,
      });
    }
    
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
    const facilitador = interaction.options.getUser("facilitador");
    const pin = interaction.options.getString("pin");

    // Get the facilitador if it exists
    const facilitadorEncontrado = facilitadores.find(
      (f) => f.userid === facilitador.id && f.pin === pin,
    );

    if (!facilitadorEncontrado) {
      return interaction.reply({
        content: "Esse Facilitador não foi encontrado ou o PIN está errado.",
        ephemeral: true,
      });
    }

    // Adds the EstudantesAtivos role to the current user
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "EstudantesAtivos",
    )

    // If role not found, create it
    if (!role) {
      try {
        const newRole = await interaction.guild.roles.create({
          name: "EstudantesAtivos",
          color: "#00ff00",
        });
        console.log(`ALETA: Role ${newRole.name} criado com sucesso.`);
      } catch (error) {
        console.error(`ERRO: Ao criar role: ${error}`);
      }
    }
    
    // Add the role to the user
    if (role) {
      await interaction.member.roles.add(role);
    } else {
      await interaction.member.roles.add(newRole);
    }

    const linkAluno = {
      aluno: interaction.user.id,
      facilitador: facilitadorEncontrado.userid,
    };

    await db.push("alunos", linkAluno);

    // Sends a directmessage to the facilitator
    facilitador.send(`O aluno ${interaction.user} se conectou com você!`);

    // Respond to the user
    interaction.reply({
      content: `Você se conectou com o Facilitador ${facilitador}! Seu código de acesso é: ${facilitadorEncontrado.codigo}`,
      ephemeral: true,
    });
    interaction.followUp({
      content: 'Use o código para se cadastrar no Google Arcade por esse link: https://rsvp.withgoogle.com/events/arcade-facilitador/home',
      ephemeral: true});
  },
};
