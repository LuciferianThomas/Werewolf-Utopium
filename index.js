/* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      db = require('quick.db')

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const defaultPrefix = "u!",
      userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

function formatDate(date) {
  return moment(date).format("D MMM Y HH:mm [GMT]")
}

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

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

bot.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

bot.login(token)

bot.on('ready', () => {
  console.log(`${bot.user.username} is up!`)
	bot.user.setPresence({
		status: 'DND',
		game: {
			name: `for ${defaultPrefix}help`,
      type: "WATCHING"
		}
	})
})

bot.on('message', async message => {
  
  const msg = message.content.toLowerCase()
  
  const prefix = defaultPrefix,
        mention = `<@${bot.user.id}> `,
        mention1 = `<@!${bot.user.id}> `
  
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