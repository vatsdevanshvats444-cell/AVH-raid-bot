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

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName !== "raid") return;

  const sub = interaction.options.getSubcommand();

  if (sub === "start") {
    const server = interaction.options.getString("server");
    const allies = interaction.options.getString("allies");
    const enemies = interaction.options.getString("enemies");

    const embed = new EmbedBuilder()
      .setColor(0x8000ff)
      .setTitle("⚔️ AVH RAID STARTED")
      .addFields(
        { name: "👑 Host", value: `${interaction.user}` },
        { name: "🎮 Server", value: server },
        { name: "🤝 Allies", value: allies, inline: true },
        { name: "☠️ Enemies", value: enemies, inline: true },
        { name: "👥 Participants", value: "0" }
      )
      .setFooter({ text: "Allied Vengeance Hunters" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("join")
        .setLabel("Join Raid")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("leave")
        .setLabel("Leave Raid")
        .setStyle(ButtonStyle.Danger)
    );

    const raidChannel = client.channels.cache.get("1525784189557932073");

    await raidChannel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: "✅ Raid started!",
      ephemeral: true
    });
  }

  if (sub === "end") {
    await interaction.reply("⚔️ Raid ended.");
  }

  if (sub === "cancel") {
    await interaction.reply("❌ Raid cancelled.");
  }
});