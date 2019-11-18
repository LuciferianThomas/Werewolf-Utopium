/* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      db = require("quick.db"),
      all = new db.table("allData"),
      striptags = require("striptags"),
      diff = require("diff")

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

let last = all.get("last"), now = {alert: "", tsi:""}

client.on('ready', async () => {
  console.log(`${fn.time()} | ${client.user.username} is up!`)
  
  setInterval(async () => {
    last.alert = now.alert
    let alert_res = await fetch("http://www.mtr.com.hk/alert/alert_simpletxt_title.html")
    now.alert = (await alert_res.text()).replace(/\<script.*\>[.\n]*\<\/script\>/g, "");
    
    last.tsi = now.tsi
    let tsi_res = await fetch("http://www.mtr.com.hk/alert/tsi_simpletxt_title.html")
    now.tsi = (await tsi_res.text()).replace(/\<\/script.*\>[.\n]*\<\/script\>/g, "");
    
    let alertDifference = diff.diffLines(last.alert, now.alert).filter(x => x.added && !x.value.includes("This message issued"))
    let tsiDifference = diff.diffLines(last.tsi, now.tsi).filter(x => x.added && !x.value.includes("This message issued"))
    if (alertDifference.length) {
      await client.users.get("336389636878368770").send(
        new Discord.RichEmbed()
          .setColor(0xEC4783)
          .setTitle("Train Service Delay/Disruption Announcement Updated")
          .setURL("http://www.mtr.com.hk/alert/alert_simpletxt_title.html")
          .setDescription(`Changes:\n${striptags(alertDifference.map(x => x.value).join("\n").substring(2000))}...`)
          .setFooter("Updated")
          .setTimestamp()
      )
    }
    if (tsiDifference.length) {
      await client.users.get("336389636878368770").send(
        new Discord.RichEmbed()
          .setColor(0x323592)
          .setTitle("Service Update Announcement Updated")
          .setURL("http://www.mtr.com.hk/alert/tsi_simpletxt_title.html")
          .setDescription(`Changes:\n${striptags(tsiDifference.map(x => x.value).join("\n").substring(2000))}...`)
          .setFooter("Updated")
          .setTimestamp()
      )
    }
    all.set("last", last)
  }, 1000*10)
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