const {
  Client,
  REST,
  GatewayIntentBits,
  Routes,
  Events,
  Collection,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const fs = require("node:fs");
const { userInfo } = require("node:os");
const path = require("node:path");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const FSClient = require("@replit/object-storage").Client;
const fsclient = new FSClient();

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const rest = new REST({ version: "10" }).setToken(process.env.BOTTOKEN);
const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

client.commands = new Collection();
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`,
    );
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === "RegistroFacilitador") {
    const nomeCompleto = interaction.fields.getTextInputValue("nomeCompleto");
    const email = interaction.fields.getTextInputValue("email").toLowerCase()
    const instituicao = interaction.fields
      .getTextInputValue("instituicao")
      .replaceAll(",", "-")
    const pin = interaction.fields.getTextInputValue("pin");
    const handle = interaction.user.username;
    const userid = interaction.user.id;
    let codigos = (await db.get("codigos")) || [];
    let facilitadores = (await db.get("facilitadores")) || [];

    // Varifica se o e-mail é valido
    if (!validateEmail(email)) {
      interaction.reply({
        content: "E-mail inválido.",
        ephemeral: true,
      });
      return;
    }

    // Verifica se o email já foi cadastrado

    if (facilitadores && facilitadores.find((f) => f.email === email)) {
      console.log(
        `ALERTA: Usuário ${email} tentou se cadastrar, mas já estava cadastrado.`,
      );
      return interaction.reply({
        content: "Esse email já foi cadastrado.",
        ephemeral: true,
      });
    }

    // Obter o primeiro código disponível
    if (facilitadores.length >= codigos.length) {
      console.log(
        `ALERTA: Usuário ${email} tentou se cadastrar, mas não tem mais códigos disponíveis.`,
      );
      return interaction.reply({
        content: "Nenhum código disponível.",
        ephemeral: true,
      });
    }
    const codigo = codigos.find(
      (c) => !facilitadores.find((f) => f.codigo === c),
    );

    // Adiciona o facilitador na base de dados
    await db.push("facilitadores", {
      userid,
      handle,
      nomeCompleto,
      email,
      instituicao,
      pin,
      codigo,
    });

    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "FacilitadoresAtivos",
    );
    if (role) {
      await interaction.member.roles.add(role);
    }

    console.log(
      `ALERTA: Novo usuário ${email} cadastrado com pin: ${pin} e código: ${codigo}.`,
    );

    await interaction.reply({
      content: "Obrigado por se registrar! Seu código é: :eyes: " + codigo,
      ephemeral: true,
    });
  }
});

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.BOTCLIENTID),
      { body: commands },
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const { ok, value, error } = await fsclient.downloadAsText("backup.json");
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
  console.log("Restored backup succesfully.");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.BOTTOKEN);
