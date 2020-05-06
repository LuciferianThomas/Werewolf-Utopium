  /* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      db = require("quick.db")

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const client = new Discord.Client(),
      config = require('/app/util/config'),
      fn = require('/app/util/fn')

const app = express()

app.get("/", function(request, response) {
  response.redirect("https://werewolf-utopium.tk/")
});
app.get("/ping", function(request, response) {
  response.sendStatus(200)
});

const listener = app.listen(process.env.PORT, function() {
  // console.log(
  //   "werewolf-utopium.tk is online, using port " + listener.address().port
  // )
})

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN


/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

client.login(token)

client.once('ready', async () => {
  console.log(`${fn.time()} | ${client.user.username} is up!`)
  client.user.setPresence({ activity: { name: 'LuciferianThomas code' , type: "WATCHING"}, status: 'dnd' })
})

// client.on('guildMemberAdd', async member => {
//   if (member.guild.id != "522638136635817986") return;
//   member.guild.channels.cache.get("640530363587887104").send(
//     `${member}, welcome to **Werewolf Utopium**!`
//   )
// })

// client.on('guildMemberRemove', async member => {
//   if (member.guild.id != "522638136635817986") return;
//   member.guild.channels.cache.get("640530363587887104").send(
//     `Hope to see you again in the near future, **${member.user.username}**!`
//   )
// })

client.on('message', async message => {
  
  if (message.author.bot) return;
  
  const msg = message.content.trim().toLowerCase()
  
  const prefix = "s!"
  
  let shared = {}
    
  if (message.content.toLowerCase().startsWith(prefix)) {
    
    var args = message.content.trim().slice(prefix.length).split(/\s+/u)
    shared.prefix = prefix
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
		try {
			await command.run(client, message, args, shared)
		} catch (error) {
			console.log(error)
		}
    
    message.delete().catch(error => {})
	}
})

