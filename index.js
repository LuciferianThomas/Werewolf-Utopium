/* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

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

client.on('ready', async () => {
  console.log(`${fn.time()} | ${client.user.username} is up!`)
  
  setInterval(async () => {
    let QuickGames = games.get("quick")
    
    let ActiveQG = QuickGames.filter(game => game.currentPhase >= 0)
    for (let i = 0; i < ActiveQG.length; i++) {
      let game = ActiveQG[i]
      if (game.nextPhase >= moment()) {
        if (game.currentPhase % 3 == 2)  {
          let countVotes = {}
          for (var j = 0; j < game.players.filter(player => player.alive).length; i++) 
            if (!countVotes[game.lynchVotes[j]])
              countVotes[game.lynchVotes[j]] = 1
            else
              countVotes[game.lynchVotes[j]] += 1
        }
        
        if (game.currentPhase % 3 == 0 && game.wwKill) 
          await fn.broadcast(client, game, "The village cannot decide on who to lynch.")
        
        game.currentPhase += 1
        
        await fn.broadcast(
          client, game, 
          game.currentPhase % 3 == 0 ? `Night ${game.currentPhase/3+1} has started!` :
          game.currentPhase % 3 == 1 ? `Day ${game.currentPhase/3+1} has started!` :
          `Voting time has started. ${Math.floor(game.players.filter(player => player.alive).length/2)}`
        )
        
        if (game.currentPhase % 3 == 0 && !game.lynch) 
          await fn.broadcast(client, game, "The village cannot decide on who to lynch.")
      }
    }
  }, 250)
})

client.on('message', async message => {
  
  if (message.author.bot) return;
  
  const msg = message.content.trim().toLowerCase()
  
  const prefix = "w!"
  
  let shared = {}
  
  if (message.content.startsWith(prefix)) {
    
    var args = message.content.trim().slice(prefix.length).split(/\s+/u)
    shared.prefix = prefix
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
    if (!players.get(message.author.id)) 
      players.set(message.author.id, {
        xp: 0,
        currentGame: null
      })
    
		try {
			await command.run(client, message, args, shared)
		} catch (error) {
			console.log(error)
		}
    
    message.delete().catch(error => {})
	}
})