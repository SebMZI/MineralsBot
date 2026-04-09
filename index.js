require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { connectToDatabase } = require("./db/dbConnect.js");
const log = require("./utils/logs.js");
const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  connectToDatabase();
  console.log("Minerals Bot is running!");
  log("Minerals Bot has started successfully.");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
      log(
        `Command executed: ${interaction.commandName} by ${interaction.user.username}`,
      );
    } catch (error) {
      console.error(error);
      log(
        `[ERROR] Failed to execute command ${interaction.commandName}: ${error.message}`,
      );
    }
  }

  if (interaction.isModalSubmit()) {
    const modal = interaction.client.modals.get(interaction.customId);
    if (!modal) return;
    try {
      await modal.execute(interaction);
      log(
        `Modal submitted: ${interaction.customId} by ${interaction.user.username}`,
      );
    } catch (error) {
      console.error(error);
      log(
        `[ERROR] Failed to execute modal ${interaction.customId}: ${error.message}`,
      );
    }
  }

  if (interaction.isStringSelectMenu()) {
    const component = interaction.client.components.get(interaction.customId);
    if (!component) return;
    try {
      await component.execute(interaction);
      log(
        `Component selected: ${interaction.customId} by ${interaction.user.username}`,
      );
    } catch (error) {
      console.error(error);
      log(
        `[ERROR] Failed to execute command ${interaction.customId}: ${error.message}`,
      );
    }
  }
});

client.commands = new Collection();
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
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

client.components = new Collection();
const componentPath = path.join(__dirname, "components");
const componentFiles = fs
  .readdirSync(componentPath)
  .filter((file) => file.endsWith(".js"));

for (const file of componentFiles) {
  const component = require(path.join(componentPath, file));
  client.components.set(component.customId, component);
}

client.modals = new Collection();
const modalsPath = path.join(__dirname, "modals");
const modalFiles = fs
  .readdirSync(modalsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
  const modal = require(path.join(modalsPath, file));
  client.modals.set(modal.customId, modal);
}

client.login(token);
