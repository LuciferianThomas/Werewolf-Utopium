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
          let lynchVotes = game.players.filter(player => player.alive).map(player => player.lynchVote),
              lynchCount = []
          for (var j = 0; j < lynchVotes.length; j++) {
            if (!lynchCount[lynchVotes[j]]) lynchCount[lynchVotes[j]] = 0
            lynchCount[lynchVotes[j]] += 1
          }
          let max = lynchCount.reduce((m, n) => Math.max(m, n))
          let lynched = [...lynchCount.keys()].filter(i => lynchCount[i] === max)
          if (lynched.length > 1 || lynchCount[lynched[0]] < game.players.filter(player => player.alive).length/2)
            await fn.broadcast(client, game, "The village cannot decide on who to lynch.")
          else {
            game.players[lynched[0]-1].alive = false
            await fn.broadcast(client, game, `${lynched[0]} ${client.users.get(game.players[lynched[0]-1].id).username} (${game.players[lynched[0]-1].role}) was lynched by the village.`)
          }
        }
        
        game.currentPhase += 1
        
        await fn.broadcast(
          client, game, 
          game.currentPhase % 3 == 0 ? `Night ${game.currentPhase/3+1} has started!` :
          game.currentPhase % 3 == 1 ? `Day ${game.currentPhase/3+1} has started!` :
          `Voting time has started. ${Math.floor(game.players.filter(player => player.alive).length/2)}`
        )
        
        if (game.currentPhase % 3 == 1)  {
          let wwVotes = game.players.filter(player => player.alive).map(player => player.lynchVote),
              wwVotesCount = []
          for (var j = 0; j < wwVotes.length; j++) {
            if (!wwVotesCount[wwVotes[j]]) wwVotesCount[wwVotes[j]] = 0
            wwVotesCount[wwVotes[j]] += 1
          }
          let max = wwVotesCount.reduce((m, n) => Math.max(m, n))
          let killed = [...wwVotesCount.keys()].filter(i => wwVotesCount[i] === max)
          if (game.bgTarget == killed[0] || game.docTarget == killed[0] || game.players[killed[0]-1].role)
          game.players[killed[0]-1].alive = false
          await fn.broadcast(client, game, `${killed[0]} ${client.users.get(game.players[killed[0]-1].id).username} (${game.players[killed[0]-1].role}) was killed by the werewolves.`)
        }
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