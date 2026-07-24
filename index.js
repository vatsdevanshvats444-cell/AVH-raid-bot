require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// ====== CONFIG ======
const APPLICATION_ID = "1530143717153837096";
const GUILD_ID = "1525492375508750529";
const RAID_CHANNEL_ID = "1525784189557932073";

// ====== MEMORY ======
let raidMessage = null;
let participants = new Set();

// ====== SLASH COMMAND ======
const commands = [
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid management")
    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Start a raid")
        .addStringOption(opt =>
          opt
            .setName("server")
            .setDescription("Roblox private server link")
            .setRequired(true))
        .addStringOption(opt =>
          opt
            .setName("allies")
            .setDescription("Allied clans")
            .setRequired(true))
        .addStringOption(opt =>
          opt
            .setName("enemies")
            .setDescription("Enemy clans")
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName("end").setDescription("End the raid"))
    .addSubcommand(sub =>
      sub.setName("cancel").setDescription("Cancel the raid"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(c => c.toJSON());

// ===== READY =====
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      APPLICATION_ID,
      GUILD_ID
    ),
    { body: commands }
  );

  console.log("✅ Slash commands registered");
});

// ===== INTERACTIONS =====
client.on("interactionCreate", async interaction => {

  // Slash Commands
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName !== "raid") return;

    const sub = interaction.options.getSubcommand();

    if (sub === "start") {

      participants.clear();

      const server = interaction.options.getString("server");
      const allies = interaction.options.getString("allies");
      const enemies = interaction.options.getString("enemies");

      const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle("⚔️ AVH RAID STARTED")
        .addFields(
          {
            name: "👑 Host",
            value: `${interaction.user}`
          },
          {
            name: "🎮 Server",
            value: server
          },
          {
            name: "🤝 Allies",
            value: allies,
            inline: true
          },
          {
            name: "☠️ Enemies",
            value: enemies,
            inline: true
          },
          {
            name: "👥 Participants",
            value: "0"
          }
        )
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("join")
          .setLabel("Join Raid")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("leave")
          .setLabel("Leave Raid")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)

      );

      const channel = await client.channels.fetch(RAID_CHANNEL_ID);

      raidMessage = await channel.send({
        embeds: [embed],
        components: [buttons]
      });

      await interaction.reply({
        content: "✅ Raid started!",
        ephemeral: true
      });

    }

    if (sub === "end") {

      participants.clear();
      raidMessage = null;

      await interaction.reply({
        content: "🏁 Raid ended.",
        ephemeral: true
      });

    }

    if (sub === "cancel") {

      participants.clear();

      if (raidMessage) {
        await raidMessage.delete().catch(() => {});
      }

      raidMessage = null;

      await interaction.reply({
        content: "❌ Raid cancelled.",
        ephemeral: true
      });

    }

  }

  // Buttons
  if (interaction.isButton()) {

    if (interaction.customId === "join") {

      participants.add(interaction.user.id);

      return interaction.reply({
        content: `✅ Joined! Total participants: ${participants.size}`,
        ephemeral: true
      });

    }

    if (interaction.customId === "leave") {

      participants.delete(interaction.user.id);

      return interaction.reply({
        content: `❌ Left! Total participants: ${participants.size}`,
        ephemeral: true
      });

    }

  }

});

client.login(process.env.TOKEN);