  /* --- ALL PACKAGES --- */

require('es6-shim')
require("dotenv").config()

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      db = require("quick.db"),
      temp = new db.table("temp"),
      games = new db.table("Games"),
      cmd = require("node-cmd")

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const client = new Discord.Client(),
      config = require('/home/sd/utopium/spyfall/util/config'),
      fn = require('/home/sd/utopium/spyfall/util/fn')

const app = express()

app.get("/", function(request, response) {
  response.redirect("https://werewolf-utopium.tk/")
});
app.get("/ping", function(request, response) {
  response.sendStatus(200)
});
app.get("/restart", function(req, res) {
  res.status(200).send(`Restart initiated`)
  cmd.run("refresh")
})

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
  //alert players in game if w!restart or auto-restart was used
  let gamealert = temp.get("gamealert")
  if (gamealert) {
    let Games = games.get("quick")
    let activeGames = Games.filter(game => game.currentPhase < 999)
    if (!activeGames.length) return
    activeGames.forEach(game => {
      // console.log(game.players)
      if (!game.players.length) return;
      game.players.forEach(p =>
        client.users.cache
          .get(p.id)
          .send(
            "The bot has finished rebooting. Enjoy your game!"
          )
      )
      // fn.addLog(game, "Restart complete")
      // fn.addLog(game, "-divider-")
    })
    temp.delete("gamealert")
  }
  //respond to w!restart command
  let rebootchan = temp.get("rebootchan")
  if(rebootchan){
    temp.delete("rebootchan")
    client.channels.cache.get(rebootchan).send("Bot has successfully been restarted!").catch(() => temp.delete("rebootchan"))
  }
  
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

client.on('message', async message => {
  if (message.channel.id !== "718418283312840814" && message.author.id !== "718413626079445082") return;
  let veri = message.content, [ _, code, check ] = veri.match(/(\d{6})\-(\d|A)/), checksum = 0
  for (var i = 0; i < code.length; i++) checksum += parseInt(code[i])
  if (check == "A") check = 10
  else check = parseInt(check)
  if (10-(checksum%11)!=check) return;
  // console.log("Received ping from Status bot")
  message.react("👍")
})