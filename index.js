/* --- ALL PACKAGES --- */

require('dotenv').config()
require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      cron = require('cron'),
      ms = require('ms'),
      CronJob = cron.CronJob,
      db = require("quick.db")

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const client = new Discord.Client(),
      config = require('/home/utopium/wwou-staff/util/config'),
      fn = require('/home/utopium/wwou-staff/util/fn'),
      cmd = require('node-cmd'),
      giveaways = new db.table("giveaways")

const app = express()
app.use(express.static('public'));

app.get("/", function(req, res) {
  res.sendStatus(200)
});
app.get("/restart", async (req, res) => {
  res.status(200).send(`Restart for ${client.user.username} Staff initiated`)
  cmd.run("refresh")
})

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

client.once('ready', async () => {
  console.log(`${fn.time()} | ${client.user.username} is up!`)
  
  const gwatimer = new CronJob("*/10 * * * * *", async function() {
    let allgwa = giveaways.all()
    allgwa.forEach(async gwa => {
      if (gwa.ID != "bonus" && !gwa.data.ended) {
        let x = giveaways.get(gwa.ID)
        let c = await client.channels.cache.get(x.channel)
        let m = await c.messages.fetch(x.message)
        let embed = m.embeds[0]
        if(moment(x.endTime) <= moment()){
          giveaways.set(gwa.ID+".ended", true)
          x.ended = true
        }
        let diff = moment(x.endTime).diff(moment(), 'seconds')
        let diffD = Math.floor(diff/60/60/24)%24,
            diffH = Math.floor(diff/60/60)%60,
            diffM = Math.floor(diff/60)%60,
            diffS = diff%60
        console.log(moment(), moment(x.endTime), diffD, diffH, diffM, diffS)
        embed.description = `React with 🎉 to enter!\nTime Remaining: **${
          diffD >= 2 ? diffD + " days" : diffD == 1 ? diffD + " day" : ""
        } ${ diffH >= 2 ? diffH + " hours" : diffH == 1 ? diffH + " hour" : ""
        } ${ diffM >= 2 ? diffM + " minutes" : diffM == 1 ? diffM + " minute" : ""
        } ${ diffS >= 2 ? diffS + " seconds" : diffS == 1 ? diffS + " second" : ""
        }**\nHosted by: <@${x.hostedBy}>`
        await m.edit(embed)
        console.log("Updated " + gwa.ID)
        
        if(x.ended){
          // embed.description = 
          // await m.edit(
          // )
        }
      }
    })
  })

  gwatimer.start()
  
})

client.on('guildMemberAdd', async member => {
  if (member.guild.id != "522638136635817986") return;
  member.guild.channels.cache.get("640530363587887104").send(
    `${member}, welcome to **Werewolf Utopium**!`
  )
})

client.on('guildMemberRemove', async member => {
  if (member.guild.id != "522638136635817986") return;
  member.guild.channels.cache.get("640530363587887104").send(
    `Hope to see you again in the near future, **${member.user.username}**!`
  )
})

client.on('message', async message => {
  
  if (message.author.bot) return;
  
  const msg = message.content.trim().toLowerCase()
  
  const prefix = "w!"
  
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

