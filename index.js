require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Collection
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commands = [
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid management")
    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Start a raid")
        .addStringOption(option =>
          option.setName("server").setDescription("Roblox server link").setRequired(true))
        .addStringOption(option =>
          option.setName("allies").setDescription("Allies").setRequired(true))
        .addStringOption(option =>
          option.setName("enemies").setDescription("Enemies").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("end").setDescription("End the raid"))
    .addSubcommand(sub =>
      sub.setName("cancel").setDescription("Cancel the raid"))
].map(c => c.toJSON());

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} is online!`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        "1530143717153837096",
        "1525492375508750529"
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "raid") {
    await interaction.reply("🚧 Raid system is under construction.");
  }
});

client.login(process.env.TOKEN);