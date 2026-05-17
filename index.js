// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Database } = require("@discordx/pagination"); // juste pour la pagination si besoin
const fs = require("fs");
const path = require("path");
const { connectToDatabase } = require("./db/dbConnect.js");
const log = require("./utils/logs.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// COLLECTIONS
client.commands = new Collection();
client.components = new Collection();
client.modals = new Collection();

// Connect DB & start bot
client.once("ready", async () => {
  await connectToDatabase();
  console.log("Minerals Bot is running!");
  log("Minerals Bot has started successfully.");
});

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] Command ${filePath} missing data or execute.`);
    }
  }
}

// Load components
const componentsPath = path.join(__dirname, "components");
if (fs.existsSync(componentsPath)) {
  const componentFiles = fs.readdirSync(componentsPath).filter(f => f.endsWith(".js"));
  for (const file of componentFiles) {
    const component = require(path.join(componentsPath, file));
    if (component.customId && component.execute) {
      client.components.set(component.customId, component);
    }
  }
}

// Load modals
const modalsPath = path.join(__dirname, "modals");
if (fs.existsSync(modalsPath)) {
  const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith(".js"));
  for (const file of modalFiles) {
    const modal = require(path.join(modalsPath, file));
    if (modal.customId && modal.execute) {
      client.modals.set(modal.customId, modal);
    }
  }
}

// Handle interactions
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      await log(`Command executed: ${interaction.commandName} by ${interaction.user.username}`);
    }

    if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (!modal) return;
      await modal.execute(interaction);
      await log(`Modal submitted: ${interaction.customId} by ${interaction.user.username}`);
    }

    if (interaction.isStringSelectMenu() || interaction.isButton()) {
      const component = client.components.get(interaction.customId);
      if (!component) return;
      await component.execute(interaction);
      await log(`Component selected: ${interaction.customId} by ${interaction.user.username}`);
    }
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({ content: "An error occurred.", ephemeral: true });
    }
    await log(`[ERROR] Interaction error: ${err.message}`);
  }
});

client.login(process.env.DISCORD_TOKEN);