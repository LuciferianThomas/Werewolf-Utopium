/* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch')

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const client = new Discord.Client(),
      config = require('/app/util/config'),
      fn = require('/app/util/fn')

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT, function() {
  setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`)
  }, 225000)
});

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

client.login(token)

let last = ''

client.on('ready', async () => {
  console.log(`${fn.time()} | ${client.user.username} is up!`)
  
  // setInterval(async () => {
    let alert_res = await fetch("http://www.mtr.com.hk/alert/alert_simpletxt_title.html")
    let alert_text = await alert_res.text()
    console.log(alert_text)
  // }, 1000)
})

// for guilds
// client.on('message', async message => {
  
//   if (message.author.bot || message.channel.type != 'text') return;
  
//   const msg = message.content.trim().toLowerCase()
  
//   const mention = `<@${client.user.id}> `,
//         mention1 = `<@!${client.user.id}> `
  
//   let shared = {}
  
//   if (message.content.startsWith(mention) || message.content.startsWith(mention1)) {
    
//     var args
    
//     if (msg.startsWith(mention)) {
//       args = message.content.trim().slice(mention.length).split(/\s+/u)
//       shared.prefix = mention
//     } else if (msg.startsWith(mention1)) {
//       args = message.content.trim().slice(mention1.length).split(/\s+/u)
//       shared.prefix = mention1
//     }
    
// 		const commandName = args.shift().toLowerCase()
// 		shared.commandName = commandName
// 		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

// 		if (!command) return;
    
//     // shared.defaultPrefix = config.defaultPrefix
//     // shared.embedColor = config.embedColor
    
// 		try {
// 			await command.run(client, message, args, shared)
// 		} catch (error) {
// 			console.log(error)
// 		}
    
//     message.delete().catch(error => {})
// 	}
// })