require('es6-shim')

const Discord = require('discord.js')
const fs = require("fs")

var http = require('http')

http.createServer(function (req, res) {
	res.write("Status: Online")
	res.end()
}).listen(8080)

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
  console.log("Unity is up!")
	bot.user.setPresence({
		status: 'online',
		game: {
			name: `@Unity help`
		}
	})
})

bot.on('message', async message => {
  
  const msg = message.content.toLowerCase()
  const prefix = "u!"
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