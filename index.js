require('es6-shim')

const Discord = require('discord.js')
const express = require('express')
const fs = require("fs")
const http = require('http')
const Enmap = require('enmap')

/* --- ALL PACKAGES BEFORE THIS LINE --- */

/* ALL GLOBAL CONSTANTS HERE*/

const prefix = "u!"






/* ALL GLOBAL CONSTANTS HERE*/

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
  console.log(Date.now() + " Ping Received");
});

const listener = app.listen(process.env.PORT, function() {
  setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 225000);
});

const bot = new Discord.Client()

bot.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

const defaultSettings = {   
  prefix: "u!"
};

bot.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

bot.login(token)

bot.on('ready', () => {
  console.log("Unity is up!")
	bot.user.setPresence({
		status: 'dnd',
		game: {
			name: `maintenance go on`,
      type: "WATCHING"
		}
	})
})

bot.on('guildDelete', guild => {
  bot.settings.delete(guild.id);
})

bot.on('message', async message => {
  
  const msg = message.content.toLowerCase()
  const guildConf = bot.settings.ensure(message.guild.id, defaultSettings)
  const prefix = guildConf.prefix
  const mention = "<@562910620664463365> "
  const mention1 = "<@!562910620664463365> "
  
  let shared = {}
  
  if (msg.startsWith(prefix) || msg.startsWith(mention) || msg.startsWith(mention1)) {
    
    var args
    
    if (msg.startsWith(prefix)) {
      args = message.content.slice(prefix.length).split(/\s+/u)
      shared.prefix = prefix
    } else if (msg.startsWith(mention)) {
      args = message.content.slice(mention.length).split(/\s+/u)
      shared.prefix = mention
    } else if (msg.startsWith(mention1)) {
      args = message.content.slice(mention1.length).split(/\s+/u)
      shared.prefix = mention1
    }
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = bot.commands.get(commandName) || bot.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
		
		try {
			await command.run(bot, message, args, shared)
		} catch (error) {
			message.channel.send(error)
		}
	}
  
})