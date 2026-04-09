require("dotenv").config();
const { REST, Routes } = require("discord.js");
const { DISCORD_TOKEN, APPLICATION_ID } = process.env;
const fs = require("node:fs");
const path = require("node:path");
const log = require("./utils/logs.js");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );
    log(`Started deploying ${commands.length} application commands.`);

    const data = await rest.put(Routes.applicationCommands(APPLICATION_ID), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
    log(`Successfully deployed ${data.length} application commands.`);
  } catch (error) {
    console.error(error);
    log(`[ERROR] Failed to deploy commands: ${error.message}`);
  }
})();
