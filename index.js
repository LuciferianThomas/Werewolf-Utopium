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
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const roles = require("/app/util/roles")

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
  
  await client.user.setPresence({
		status: 'online',
		game: {
			name: `for Werewolf Simulation Games`,
      type: "WATCHING"
		}
	})

  require('/app/process/game.js')(client)
})

client.on('guildMemberAdd', async member => {
  if (member.guild.id != "522638136635817986") return;
  member.guild.channels.get("640530363587887104").send(
    `${member}, welcome to **Werewolf Utopium**!`
  )
})

client.on('guildMemberRemove', async member => {
  if (member.guild.id != "522638136635817986") return;
  member.guild.channels.get("640530363587887104").send(
    `Hope to see you again in the near future, **${member.user.username}**!`
  )
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
    
    if (!players.get(message.author.id) || !nicknames.get(message.author.id)) {
      let player = players.get(message.author.id) || {
        xp: 0,
        coins: 0,
        roses: 0,
        currentGame: null,
        wins: [],
        loses: [],
        suicides: 0
      }
      
      await message.channel.send("Please check your DMs!")
       
      let m = await message.author.send(
        new Discord.RichEmbed()
          .setTitle("Please choose a username to proceed.")
          .setDescription("You have 1 minute to respond.")
      ).catch(() => {})
      if (!m) return await message.channel.send("I cannot DM you!")
      
      let input
      while (!input) {
        let response = await m.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1, time: 60*1000, errors: ["time"] }).catch(() => {})
        if (!response) return await m.channel.send("Question timed out.")
        response = response.first().content
        
        let usedNicknames = nicknames.all().map(x => x.data.toLowerCase())
        
        if (response.match(/^[a-z0-9\_]{3,14}$/i) && !usedNicknames.includes(response.toLowerCase()))
          input = response.replace(/_/g, "\\_")
        else if (response.length > 14)
          await m.channel.send("This username is too long!")
        else if (response.length < 3)
          await m.channel.send("This username is too short!")
        else if (!response.match(/^[a-z0-9\_]{3,14}$/i))
          await m.channel.send("This username contains invalid characters! Only alphanumerical characters or underscores are accepted.")
        else if (usedNicknames.includes(response.toLowerCase()))
          await m.channel.send("This username has been taken!")
        else
          await m.channel.send("Invalid username. Please try again.")
      }
      
      nicknames.set(message.author.id, input)
      player.lastNick = moment()
      
      players.set(message.author.id, player)
    }
    
		try {
			await command.run(client, message, args, shared)
		} catch (error) {
			console.log(error)
		}
    
    message.delete().catch(error => {})
	}
})

client.on('message', async message => {  
  if (message.author.bot || message.channel.type !== 'dm') return;
  console.log(message.author.tag + ' | ' + message.cleanContent)
  
  let player = players.get(message.author.id)
  if (!player || !player.currentGame) return;
  
  let QG = games.get("quick")
  let game = QG.find(game => game.gameID == player.currentGame)
  if (!game) return undefined;
  let gamePlayer = game.players.find(player => player.id == message.author.id)
  
  gamePlayer.lastAction = moment()
  gamePlayer.prompted = false
  games.set("quick", QG)
  
  if (message.channel.type !== "dm" || message.author.bot) return;
  if (message.content.startsWith('w!') || message.content.toLowerCase() == "w!") return;

  let content = message.cleanContent
  content = content.replace(/(https?:\/\/)?((([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+\.)+([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+|localhost)(:\d+)?(\/[^\s]*)*/gi, "")
  if (content.trim().length == 0) return undefined;
  
  if (game.currentPhase == -1)
    return fn.broadcast(client, game, `**${nicknames.get(message.author.id)}**: ${content}`, [message.author.id])
  
  if (game.currentPhase >= 999)
    if (gamePlayer.alive)
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && p.id != message.author.id),
        `**${gamePlayer.number} ${nicknames.get(message.author.id)}**${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: ${content}`
      )
    else {
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && p.id != message.author.id),
        `_**${gamePlayer.number} ${nicknames.get(message.author.id)}**${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: ${content}_`
      )
    }
  
  if (gamePlayer.mute) content = "..."
  
  if (game.currentPhase % 3 != 0)
    if (gamePlayer.alive)
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && p.id != message.author.id),
        `**${gamePlayer.number} ${nicknames.get(message.author.id)}**: ${content}`
      )
    else if (!gamePlayer.alive && gamePlayer.boxed && game.players.find(p => p.role == "Soul Collector" && p.alive)) return undefined
    else {
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && !p.alive && p.id != message.author.id),
        `_**${gamePlayer.number} ${nicknames.get(message.author.id)}**${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: ${content}_`
      )
    }
  if (game.currentPhase % 3 == 0) {
    if (!gamePlayer.alive && gamePlayer.boxed && game.players.find(p => p.role == "Soul Collector" && p.alive)) return undefined
    else if (!gamePlayer.alive) {
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && (!p.alive || (p.alive && p.role == "Medium")) && p.id != message.author.id),
        `_**${gamePlayer.number} ${nicknames.get(message.author.id)}**${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: ${content}_`
      )
    }
    if (gamePlayer.role == "Medium" && gamePlayer.alive && !gamePlayer.jailed) {
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && (!p.alive || (p.alive && p.role == "Medium")) && p.id != message.author.id).map(p => p.id),
        `**Medium**: ${content}`
      )
    }
    
    if (gamePlayer.jailed && gamePlayer.alive) 
      return fn.getUser(client, game.players[game.roles.indexOf("Jailer")].id)
        .send(`**${gamePlayer.number} ${nicknames.get(message.author.id)}**: ${content}`)
    
    if (gamePlayer.role == "Jailer" && gamePlayer.alive) 
      if (game.players.find(p => p.jailed && p.alive))
        return fn.getUser(client, game.players.find(p => p.jailed && p.alive).id)
          .send(`**<:Jailer:658633215824756748> Jailer**: ${content}`)
      else
        return message.author.send("You did not jail anyone or your target cannot be jailed.")
    
    if (roles[gamePlayer.role].team == "Werewolves" && gamePlayer.role !== "Sorcerer" && !gamePlayer.jailed) {
      fn.broadcastTo(
        client,
        game.players
          .filter(p => roles[p.role].team == "Werewolves" &&
                  gamePlayer.role !== "Sorcerer" && !gamePlayer.jailed && 
                  gamePlayer.id != p.id),
        `**<:Fellow_Werewolf:660825937109057587> ${gamePlayer.number} ${nicknames.get(message.author.id)}**: ${content}`)
    }
  }
})

