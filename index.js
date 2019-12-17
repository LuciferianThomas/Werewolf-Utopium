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
    last = all.get("last")
    
    let alert_res = await fetch("http://www.mtr.com.hk/alert/alert_simpletxt_title.html")
    now.alert = await alert_res.text()
    now.alert = now.alert
      .replace(/(\n|\r)+/g, "\n")
      .match(/<div class=\"title_sign3\">\s*?<table>(?:.|\s)*?<\/table>\s*?<\/div>(?:.|\s)*?(?:((?:<div style=""><br><p>)(?:.|\s)*?(?:<\/p>\n<\/div>))(?:.|\s)*?((?:<table )(?:.|\s)*?(?:<\/table>))|(?:<table |<div style=\"\"><br><p>)(?:.|\s)*?(?:<\/table>|<\/p>\n<\/div>))/g)
    
    //console.log(now.alert)
    for (var i = 0; i < (now.alert ? now.alert.length : 0); i++) {
      let text = now.alert[i]
        .replace(/<div s.*?>((?:.|\s)*?)<\/div>/g, "$1")
        .replace(/<div class="content_text">\n<p>((?:.|\s)*?)<\/p>/g, "$1")
        .replace(/<tr class="red_serviceaffected"><td.*?>((?:.|\s)*?)<\/td><td.*?>((?:.|\s)*?)<\/td><\/tr>/g, "❖ $1 | $2\n")
        .replace(/<td.*?>((?:.|\s)*?)<\/td>/g, "$1\t")
        .replace(/<th.*?>((?:.|\s)*?)<\/th>/g, "$1\t").replace(/<div><\/div>/g, "")
        .replace(/<tr.*?>((?:.|\s)*?)<\/tr>/g, "$1\n").replace(/<br.*?>/g, "\n")
        .replace(/<table.*?>((?:.|\s)*?)<\/table>/g, "$1")
        .replace(/<p><!--.*?--><\/p>/g, "").replace(/<img.*?to.*?>/g, "↔")
        .replace(/<img.*?sign_alert.png.*?>/g, "⚠").replace(/\n( |\t)*?\n/g, "\n")
        .replace(/\n( |\t)*?\n/g, "\n").replace(/ {3,}/g, "").replace(/\n\t/g, "\n")
        .replace(/<p.*?>((?:.|\s)*?)<\/p>/g, "$1")
        .replace(/<div class=\"title_sign3\">((?:.|\s)*?)<\/div>/g, "$1")
        .replace(/<div c.*?>((?:.|\s)*?)<\/div>/g, "")
        .replace(/⚠\n<strong>(.*?)<\/strong>/g, "⚠ $1").replace(/<!--.*?-->/g, "")
        .replace(/<div i.*?>/g, "").replace(/<sup><\/sup>/g, "").replace(/\n /g, " ")
        .replace(/<a href=\"((?:.|\s)+?)\"(?:.|\s)*?>((?:.|\s)+?)<\/a>/g, "[$2]($1)")
        .replace(/\t\n/g, "\n").replace(/\n{2,}/g, "\n")
        .replace(/&nbsp;\s*/g, " ").replace(/&.*?;\s*/g, "")
        .trim()
      
      now.alert[i] = {
        title: text.split("\n")[0],
        timestamp: moment(text.split("\n")[1].split(/This message issued\s+:\s+/g)[1].trim()+"+0800"),
        content: text.split("\n").slice(2).join("\n"),
        lines: text.split("\n")[0].match(/([A-Z].+?)+ Line|Light Rail/g)
      }
      
      // console.log(now.alert[i])
      
      if (!last.alert || (last.alert && !last.alert.find(alert => alert.title == now.alert[i].title && alert.content == now.alert[i].content))) {
        await client.users.get("336389636878368770").send(
          new Discord.RichEmbed({
            fields: now.alert[i].content.split("❖").slice(1).map(x => {return { name: x.split("|")[0].replace(/\[(.+?)\]\((.+?)\)/g, "$1: $2"), value: x.split("|")[1]}})
          }).setColor(0xEC4783)
            .setTitle(now.alert[i].title)
            .setURL("http://www.mtr.com.hk/alert/alert_simpletxt_title.html")
            .setThumbnail("https://cdn.glitch.com/d7b6f4af-db94-4fb0-9341-aa45140f4d36%2FMTR.png?v=1574086190653")
            .setDescription(now.alert[i].content.split("❖")[0])
            .setFooter("Updated")
            .setTimestamp(now.alert[i].timestamp)
        )
      }
    }
    
    let tsi_res = await fetch("http://www.mtr.com.hk/alert/tsi_simpletxt_title.html")
    now.tsi = await tsi_res.text()
    now.tsi = now.tsi
      .replace(/(\n|\r)+/g, "\n")
      .match(/<div class=".*?tsi_title">\s*?<table>(?:.|\s)*?<\/table>\s*?<\/div>(?:.|\s)*?<div id="sliding.*?">(?:.|\s)*?<\/div>/g)
      
    for (var i = 0; i < (now.tsi ? now.tsi.length : 0); i++) {
      let text = now.tsi[i]
        .replace(/<div s.*?>((?:.|\s)*?)<\/div>/g, "$1")
        .replace(/<td.*?>((?:.|\s)*?)<\/td>/g, "$1\t")
        .replace(/<th.*?>((?:.|\s)*?)<\/th>/g, "$1\t")
        .replace(/<div><\/div>/g, "")
        .replace(/<tr.*?>((?:.|\s)*?)<\/tr>/g, "$1\n").replace(/<br.*?>/g, "\n")
        .replace(/<table.*?>((?:.|\s)*?)<\/table>/g, "$1")
        .replace(/<img.*?ico_speaker_bak.png.*?>/g, "🔊")
        .replace(/<img.*?sign_message.png.*?>/g, "✉️")
        .replace(/\n( |\t)*?\n/g, "\n").replace(/ {3,}/g, "").replace(/\n\t/g, "\n")
        .replace(/<p.*?>((?:.|\s)*?)<\/p>/g, "$1")
        .replace(/<div class=".*?tsi_title">((?:.|\s)*?)<\/div>/g, "$1")
        .replace(/<div class="content_text">((?:.|\s)*?)<\/div>/g, "$1").replace(/<strong><\/strong>/g,"")
        .replace(/<div c.*?>((?:.|\s)*?)<\/div>/g, "")
        .replace(/<p.*?>((?:.|\s)*?)<\/p>/g, "$1")
        .replace(/<div i.*?>((?:.|\s)*?)<\/div>/g, "$1")
        .replace(/🔊\s+<strong>(.*?)<\/strong>/g, "🔊 $1")
        .replace(/✉️\s+<strong>(.*?)<\/strong>/g, "✉️ $1").replace(/<!--.*?-->/g, "")
        .replace(/\n( |\t)*?\n/g, "\n").replace(/<sup><\/sup>/g, "").replace(/\n /g, " ")
        .replace(/<a href=\"((?:.|\s)+?)\"(?:.|\s)*?>((?:.|\s)+?)<\/a>/g, "[$2]($1)").replace(/<span(?:.|\s)*?>(.|\s)*?<\/span>/g, "$1")
        .replace(/\t\n/g, "\n").replace(/\n{2,}/g, "\n")
        .replace(/&nbsp;\s*/g, " ").replace(/&.*?;\s*/g, "")
        .trim()
      
     // console.log(text)
      
      now.tsi[i] = {
        title: text.split("\n")[0],
        timestamp: moment(text.split("\n")[1].split(/This message issued\s+:\s+/g)[1].trim()+"+0800"),
        content: text.split("\n").slice(2).join("\n"),
        // lines: text.split("\n")[0].match(/([A-Z].+?)+ Line|Light Rail/g)
      }
      
      // console.log(now.tsi[i])
      
      if (!last.tsi || (last.tsi && !last.tsi.find(tsi => tsi.title == now.tsi[i].title && tsi.content == now.tsi[i].content))) {
        await client.users.get("336389636878368770").send(
          new Discord.RichEmbed()
            .setColor(0x323592)
            .setTitle(now.tsi[i].title)
            .setURL("http://www.mtr.com.hk/alert/tsi_simpletxt_title.html")
            .setThumbnail("https://cdn.glitch.com/d7b6f4af-db94-4fb0-9341-aa45140f4d36%2FMTR.png?v=1574086190653")
            .setDescription(now.tsi[i].content)
            .setFooter("Updated")
            .setTimestamp(now.tsi[i].timestamp)
        )
      }
    }
    
    console.log(now)
    
    all.set("last", now)
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
// })…