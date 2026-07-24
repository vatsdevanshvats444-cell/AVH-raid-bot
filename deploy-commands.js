require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid management")
    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Start a raid")
        .addStringOption(option =>
          option
            .setName("server")
            .setDescription("Roblox Private Server Link")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("allies")
            .setDescription("Allies")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("enemies")
            .setDescription("Enemies")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("end")
        .setDescription("End the current raid")
    )
    .addSubcommand(sub =>
      sub
        .setName("cancel")
        .setDescription("Cancel the current raid")
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        "1530143717153837096", // Application ID
        "1525492375508750529"  // Guild ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
})();