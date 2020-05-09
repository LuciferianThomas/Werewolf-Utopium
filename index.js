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
  client.user.setPresence({ activity: { name: 'Spyfall (Coming Soon!)' , type: "PLAYING"}, status: 'dnd' })
})


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

