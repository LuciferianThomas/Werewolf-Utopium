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
    now.alert = await alert_res.text()
    now.alert = now.alert.match(/<div class=\"title_sign3\">\s*?<table>(?:.|\s)*?<\/table>\s*?<\/div>(?:.|\s)*?<table (?:.|\s)*?<\/table>/g)
    now.alert.forEach(alert => {
        alert.replace(/<div s.*?>((?:.|\s)*?)<\/div>/g, "$1")
          .replace(/<td.*?>((?:.|\s)*?)<\/td>/g, "$1\t")
          .replace(/<th.*?>((?:.|\s)*?)<\/th>/g, "$1\t").replace(/<div><\/div>/g, "")
          .replace(/<tr.*?>((?:.|\s)*?)<\/tr>/g, "$1\n").replace(/<br.*?>/g, "\n")
          .replace(/<table.*?>((?:.|\s)*?)<\/table>"/g, "$1")
          .replace(/<p><!--.*?--><\/p>"/g, "").replace(/<img.*?to.*?>/g, "↔")
          .replace(/<img.*?sign_alert.png.*?>/g, "⚠").replace(/\n( |\t)*?\n/g, "\n")
          .replace(/\n( |\t)*?\n/g, "\n").replace(/ {3,}/g, "").replace(/\n\t/g, "\n")
          .replace(/<p.*?>((?:.|\s)*?)<\/p>/g, "$1")
          .replace(/<div class=\"title_sign3\">((?:.|\s)*?)<\/div>/g,
                   "===========================\n$1")
          .replace(/<div c.*?>((?:.|\s)*?)<\/div>/g, "")
          .replace(/⚠\n<strong>(.*?)<\/strong>/g, "⚠ $1").replaceAll(/<!--.*?-->/g, "")
          .replace(/<div i.*?>/g, "").replace(/<sup><\/sup>/g, "").replace(/\n /g, " ")
          .replace(/\t\n/g, "\n").replace(/\n{2,}/g, "\n");
      })
    console.log(now.alert)

    last.tsi = now.tsi
    let tsi_res = await fetch("http://www.mtr.com.hk/alert/tsi_simpletxt_title.html")
    now.tsi = (await tsi_res.text())
      .replace(/\<script.*\>(.|\n)*?\<\/script\>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\<img.*\>/g, "↔")
      .replace(/\<\/tr\>/g, "\n")
      .replace(/\<\/td\>/g, "\t")

    return;
    
    let alertDifference = diff.diffLines(last.alert, now.alert).filter(x => x.added && !x.value.includes("This message issued") && !x.value.trim().endsWith(";"))
    let tsiDifference = diff.diffLines(last.tsi, now.tsi).filter(x => x.added && !x.value.includes("This message issued") && !x.value.trim().endsWith(";"))
    if (striptags(alertDifference.map(x => x.value.trim()).join("\n")).length) {
      await client.users.get("336389636878368770").send(
        new Discord.RichEmbed()
          .setColor(0xEC4783)
          .setTitle("Train Service Delay/Disruption Announcement Updated")
          .setURL("http://www.mtr.com.hk/alert/alert_simpletxt_title.html")
          .setThumbnail("https://cdn.glitch.com/d7b6f4af-db94-4fb0-9341-aa45140f4d36%2FMTR.png?v=1574086190653")
          .setDescription(`${striptags(alertDifference.map(x => x.value.trim()).join("\n"))}`)
          .setFooter("Updated")
          .setTimestamp()
      )
    }
    if (striptags(tsiDifference.map(x => x.value.trim()).join("\n")).length) {
      await client.users.get("336389636878368770").send(
        new Discord.RichEmbed()
          .setColor(0x323592)
          .setTitle("Service Update Announcement Updated")
          .setURL("http://www.mtr.com.hk/alert/tsi_simpletxt_title.html")
          .setThumbnail("https://cdn.glitch.com/d7b6f4af-db94-4fb0-9341-aa45140f4d36%2FMTR.png?v=1574086190653")
          .setDescription(`${striptags(tsiDifference.map(x => x.value.trim()).join("\n"))}`)
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