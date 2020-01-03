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
  
  setInterval(async () => {
    let QuickGames = games.get("quick")
    
    for (let i = 0; i < QuickGames.length; i++) {
      let game = QuickGames[i]
      if (game.currentPhase === 999) {
        game.currentPhase ++
        for (var j = 0; j < game.players.length; j++)
          players.set(`${game.players[j].id}.currentGame`, 0)
      }
      if (game.currentPhase == -1 || game.currentPhase >= 999) continue;
      if (moment(game.nextPhase) <= moment()) {
        if (game.currentPhase % 3 == 2)  {
          let lynchVotes = game.players.filter(player => player.alive).map(player => player.vote),
              lynchCount = []
          for (var j = 0; j < lynchVotes.length; j++) {
            if (!lynchCount[lynchVotes[j]]) lynchCount[lynchVotes[j]] = 0
            lynchCount[lynchVotes[j]] += 1
          }
          if (lynchCount.length) {
            let max = lynchCount.reduce((m, n) => Math.max(m, n))
            let lynched = [...lynchCount.keys()].filter(i => lynchCount[i] === max)
            if (lynched.length > 1 || lynchCount[lynched[0]] < game.players.filter(player => player.alive).length/2)
              fn.broadcast(client, game, "The village cannot decide on who to lynch.")
            else {
              game.players[lynched[0]-1].alive = false
              game.players[lynched[0]-1].roleRevealed = true
              game.lastDeath = game.currentPhase
              fn.broadcast(client, game, `${lynched[0]} ${client.users.get(game.players[lynched[0]-1].id).username} (${game.players[lynched[0]-1].role}) was lynched by the village.`)
              if (game.players[lynched[0]-1].role == "Fool") {
                game.currentPhase = 999
                fn.broadcast(client, game, `Game has ended. Fool wins!`)
                continue;
              }
              if (lynched[0] == game.hhTarget) {
                game.currentPhase = 999
                fn.broadcast(client, game, `Game has ended. Headhunter wins!`)
                continue;
              }
            /*  if (game.players.filter(p => p.alive && roles[p.role].team != "Village").length == 0) {
                game.currentPhase = 999
                fn.broadcast(client, game, `Game has ended. The village wins!`)
                continue;
              }
                game.currentPhase = 999
                fn.broadcast(client, game, `Game has ended. The werewolves wins!`)
                continue;
              }*/
             // if (game.players.filter(p =>)) {
              //  game.currentPhase = 999
            //    fn.broadcast(client, game, `Game has ended. The ${game.players.filter(p => p.alive).map(p => p.role)[0].role} wins!`)
              //  continue;
            //  }
            }
          } else
            fn.broadcast(client, game, "The village cannot decide on who to lynch.")
        }
        
        if (game.lastDeath + 6 == game.currentPhase) {
          fn.broadcast(client, game, "There has been no deaths for two days. Three consecutive days without deaths will result in a tie.")
        }
        
        if (game.lastDeath + 9 == game.currentPhase) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. It was a tie.`)
          continue;
        }
        
        game.currentPhase += 1
        game.nextPhase = moment().add(game.currentPhase % 3 == 2 ? 60 : 120, 's')
        
        fn.broadcast(
          client, game, 
          game.currentPhase % 3 == 0 ? `Night ${Math.floor(game.currentPhase/3)+1} has started!` :
          game.currentPhase % 3 == 1 ? `Day ${Math.floor(game.currentPhase/3)+1} has started!` :
          `Voting time has started. ${Math.floor(game.players.filter(player => player.alive).length/2)} votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
        )
        
        if (game.players.filter(p => p.alive && !roles[p.role].team.includes("Village")).length == 0) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. The village wins!`)
          continue;
        }
        if (game.players.filter(p => p.alive && roles[p.role].team == "Werewolves").length >=
            game.players.filter(p => p.alive && roles[p.role].team != "Werewolves").length) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. The werewolves wins!`)
          continue;
        }
       /* if (game.players.filter(p => p.alive).map(p => p.role).length == 1 && ["Serial Killer"].includes(game.players.filter(p => p.alive).map(p => p.role)[0].role)) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. The ${game.players.filter(p => p.alive).map(p => p.role)[0].role} wins!`)
          continue;
        }*/
        
        if (game.currentPhase % 3 == 0) {
          fn.broadcast(
            client, game, 
            new Discord.RichEmbed()
              .setTitle(`${client.emojis.find(e => e.name == "Night")} Night`)
              .setDescription("Nothing to do right now.\n" +
                              "Go back to sleep!"),
            game.players.filter(
              p => p.alive &&
                  ["Doctor","Bodyguard","Tough Guy","Jailer","Red Lady","Marksman","Seer","Aura Seer","Spirit Seer",
                   "Detective","Medium","Witch","Avenger","Beast Hunter","Grumpy Grandma","Cupid","Werewolf","Alpha Werewolf",
                   "Wolf Shaman","Wolf Seer","Junior Werewolf","Nightmare Werewolf","Werewolf Berserk","Sorcerer","Serial Killer",
                   "Arsonist","Bomber","Sect Leader","Zombie","Corruptor","Cannibal"].includes(p.role)).map(p => p.id)
          )
          if (game.roles.includes("Gunner")) {
            let gunners = game.players.filter(p => p.role == "Gunner").map(p => p.number)
            for (var x = 0; x < gunners.length; x++) 
              game.players[gunners[i]-1].shotToday = false
          }
          if (game.players.find(p => p.jailed && p.alive)) {
            let jailed = game.players.find(p => p.jailed && p.alive)
            client.users.get(game.players[game.roles.indexOf("Jailer")].id)
              .send(
                new Discord.RichEmbed()
                  .setTitle(`${client.emojis.find(e => e.name == "Jail")} Jail`)
                  .setDescription(`**${jailed.number} ${client.users.get(jailed.id).username}** is your prisoner.\n` +
                                  `You can talk anonymously to your prisoner, and you can execute your prisoner with \`w!shoot\`.`)
              )
            client.users.get(jailed.id)
              .send(
                new Discord.RichEmbed()
                  .setTitle(`${client.emojis.find(e => e.name == "Jail")} Jailed!`)
                  .setDescription(`You are now jailed.\nYou can talk to the jailer to prove your innocence.`)
              )
            if (roles[jailed.role].team == "Werewolves") {
              let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && p.number != jailed.number)
              for (var x = 0; x < wolves.length; x++) 
                client.users.get(jailed.id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`${client.emojis.find(e => e.name == "Jail")} Jailed!`)
                      .setDescription(`Fellow werewolf **${jailed.number} ${client.users.get(jailed.id).username}** has been jailed!`)
                  )
            }
          } else if (game.roles.includes("Jailer")) {
            client.users.get(game.players[game.roles.indexOf("Jailer")].id)
              .send(
                new Discord.RichEmbed()
                  .setTitle(`${client.emojis.find(e => e.name == "Jail")} Jail`)
                  .setDescription("You didn't target somebody yesterday or killed your convict.\n" +
                                  "Go back to sleep!")
              )
          }
        }
        
        if (game.currentPhase % 3 == 1)  {
          if (game.players.find(p => p.reved)) {
            fn.broadcast(client, game, `Medium revived ${game.players.find(p => p.reved).number} ${client.users.get(game.players.find(p => p.reved).id).username} (${game.players.find(p => p.reved).role}).`)
            game.players[game.players.find(p => p.reved).number-1].alive = true
            game.players[game.players.find(p => p.reved).number-1].reved = false
          }
          
          let seers = game.players.filter(p => ["Aura Seer","Seer","Wolf Seer"].includes(p.role)).map(p => p.number)
          for (var x = 0; x < seers.length; x++) game.players[seers[x]-1].checkedTonight = false
          
          
          let wwVotes = game.players.filter(player => player.alive && player.role.toLowerCase().includes("wolf")).map(player => player.vote),
              wwRoles = game.players.filter(player => player.alive && player.role.toLowerCase().includes("wolf")).map(player => player.role),
              wwVotesCount = []
          for (var j = 0; j < wwVotes.length; j++) {
            if (!wwVotesCount[wwVotes[j]]) wwVotesCount[wwVotes[j]] = 0
            wwVotesCount[wwVotes[j]] += wwRoles[j] == "Alpha Werewolf" ? 2 : 1
          }
          if (wwVotesCount.length) {
            let max = wwVotesCount.reduce((m, n) => Math.max(m, n))
            let killed = [...wwVotesCount.keys()].filter(i => wwVotesCount[i] === max)
            
            let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && !p.jailed).map(p => p.id)
            if (!game.players[killed[0]-1].bgProt && !game.players[killed[0]-1].docProt && !game.players[killed[0]-1].jailed && 
                !["Bodyguard", "Serial Killer"].includes(game.players[killed[0]-1].role)) {
              if (game.players[killed[0]-1].docProt)
                client.users.get(game.players[game.players[killed[0]-1].docProt-1].id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`${client.emojis.get(e => e.name == "Doctor_Protect")} Protection`)
                      .setDescription(`Your protection saved **${game.players[killed[0]-1].number} ${
                                      client.users.get(game.players[killed[0]-1].id).username}** last night!`)
                  )
              
              if (game.players[killed[0]-1].role == "Cursed") {
                game.players[killed[0]-1].role = "Werewolf"
                client.users.get(game.players[killed[0]-1].id).send(
                  new Discord.RichEmbed()
                    .setTitle(`${client.emojis.get(e => e.name == "Werewolf")} Converted!`)
                    .setDescription("You have been attacked by the werewolves and converted into a Werewolf!")
                )
                for (var j = 0; j < wolves.length; j++)
                  client.users.get(wolves[j]).send(
                    new Discord.RichEmbed()
                      .setTitle(`${client.emojis.get(e => e.name == "Cursed")} Converted!`)
                      .setDescription(
                        `**${game.players[killed[0]-1].number} ${client.users.get(game.players[killed[0]-1].id).username
                        }** is the Cursed and is turned into a Werewolf!`)
                  )
              } else {
                game.players[killed[0]-1].alive = false
                game.players[killed[0]-1].roleRevealed = true
                game.lastDeath = game.currentPhase-1
                fn.broadcast(client, game, `${killed[0]} ${client.users.get(game.players[killed[0]-1].id).username
                             } (${game.players[killed[0]-1].role}) was killed by the werewolves.`)
              }
            } else if (game.players[killed[0]-1].role == "Bodyguard") {
              game.players[killed[0]-1].health -= 1
              if (game.players[killed[0]-1].health <= 0) {
                fn.broadcast(client, game, `${killed[0]} ${client.users.get(game.players[killed[0]-1].id).username
                             } (${game.players[killed[0]-1].role}) was killed by the werewolves.`)
                game.lastDeath = game.currentPhase-1
                game.players[killed[0]-1].roleRevealed = true
                game.players[killed[0]-1].alive = false
              } else {
                client.users.get(game.players[killed[0]-1].id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`${client.emojis.find(e => e.name == "Bodyguard_Shield")} Attacked!`)
                      .setDescription("You fought off an attack last night and survived.\nNext time you are attacked you will die.")
                  )
                for (var j = 0; j < wolves.length; j++)
                  client.users.get(wolves[j])
                    .send(`**${game.players[killed[0]-1].number} ${client.users.get(game.players[killed[0]-1].id).username
                          }** cannot be killed!`)
              }
            } else if (game.players[killed[0]-1].bgProt) {
              game.players[game.players[killed[0]-1].bgProt-1].health -= 1
              if (game.players[game.players[killed[0]-1].bgProt-1].health <= 0) {
                game.lastDeath = game.currentPhase-1
                fn.broadcast(client, game, `${game.players[killed[0]-1].bgProt} ${
                             client.users.get(game.players[game.players[killed[0]-1].bgProt-1].id).username
                             } (${game.players[game.players[killed[0]-1].bgProt-1].role}) was killed by the werewolves.`)
                game.players[game.players[killed[0]-1].bgProt-1].alive = false
                game.players[killed[0]-1].roleRevealed = true
              } else {
                client.users.get(game.players[game.players[killed[0]-1].bgProt-1].id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`${client.emojis.find(e => e.name == "Bodyguard_Shield")} Attacked!`)
                      .setDescription("You fought off an attack last night and survived.\nNext time you are attacked you will die.")
                  )
                for (var j = 0; j < wolves.length; j++)
                  client.users.get(wolves[j])
                    .send(`**${game.players[killed[0]-1].number} ${client.users.get(game.players[killed[0]-1].id).username
                          }** cannot be killed!`)
              }
            } else {
              for (var j = 0; j < wolves.length; j++)
                client.users.get(wolves[j])
                  .send(`**${game.players[killed[0]-1].number} ${client.users.get(game.players[killed[0]-1].id).username
                        }** cannot be killed!`)
            }
          }
          
          let skTarget = game.players.filter(player => player.alive && player.role == "Serial Killer").map(player => player.vote)
          for (var j = 0; j < skTarget.length; j++) {
            if (!game.players[skTarget[i]-1].bgProt && !game.players[skTarget[i]-1].docProt && !game.players[skTarget[i]-1].jailed && 
                !["Bodyguard", "Serial Killer"].includes(game.players[skTarget[i]-1].role)) {
              game.players[skTarget[i]-1].alive = false
              fn.broadcast(client, game, `${skTarget[i]} ${client.users.get(game.players[skTarget[i]-1].id).username} (${game.players[skTarget[i]-1].role}) was killed by the serial killer.`)
            } else if (game.players[skTarget[i]-1].role == "Bodyguard") {
              game.players[skTarget[i]-1].health -= 1
              if (game.players[skTarget[i]-1].health <= 0) {
                fn.broadcast(client, game, `${skTarget[i]} ${client.users.get(game.players[skTarget[i]-1].id).username} (${game.players[skTarget[i]-1].role}) was killed by the serial killer.`)
                game.players[skTarget[i]-1].alive = false
              }
            } else if (game.players[skTarget[i]].bgProt) {
              game.players[game.players[skTarget[i]-1].bgProt-1].health -= 1
              if (game.players[game.players[skTarget[i]-1].bgProt-1].health <= 0) {
                fn.broadcast(client, game, `${game.players[skTarget[i]-1].bgProt} ${client.users.get(game.players[game.players[skTarget[i]-1].bgProt-1].id).username} (${game.players[game.players[skTarget[i]-1].bgProt-1].role}) was killed by the serial killer.`)
                game.players[game.players[skTarget[i]-1].bgProt-1].alive = false
              }
            }
          }
          
          // clears protections (should be after ww kill xD lol..) kk
          for (var j = 0; j < game.players.length; j++) {
            game.players[j].jailed = false
            game.players[j].bgProt = null
            game.players[j].docProt = null
          }
        }
        
        for (var j = 0; j < game.players.length; j++) {
          game.players[j].vote = null
        }
      }
      QuickGames[i] = game
    }
    games.set('quick', QuickGames)
  }, 1000)
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

client.on('message', async message => {
  if (!message.author.bot) console.log(message.author.tag + ' | ' + message.cleanContent)
  
  if (message.channel.type !== "dm" || message.author.bot) return;
  if (message.content.startsWith('w!')) return;
  
  let player = players.get(message.author.id)
  if (!player.currentGame) return;

  let content = message.content
  for (var role in roles) {
    for (var abbr of roles[role].abbr)
      content = content.replace(new RegExp(`\\b(${abbr})\\b`, 'gi'), `$1 (${role})`)
  }
  let otherabbr = require('/app/util/otherabbr')
  for (var [full, abbrList] of Object.entries(otherabbr)) {
    for (var abbr of abbrList)
      content = content.replace(new RegExp(`\\b(${abbr})\\b`, 'gi'), `$1 (${full})`)
  }
  
  let game = games.get("quick").find(game => game.gameID == player.currentGame)
  let gamePlayer = game.players.find(player => player.id == message.author.id)
  if (game.currentPhase == -1)
    return await fn.broadcast(client, game, `**${message.author.username}**: ${content}`, [message.author.id])
  
  if (game.currentPhase % 3 != 0)
    if (gamePlayer.alive)
      return fn.broadcast(client,game,`**${gamePlayer.number} ${message.author.username}**: ${content}`, [message.author.id])
    else {
      let dead = game.players.filter(p => !p.alive).map(p => p.id)
      for (var i = 0; i < dead.length; i++)
        if (dead[i] != message.author.id)
          client.users.get(dead[i])
            .send(`:skull: **${gamePlayer.number} ${message.author.username}**${gamePlayer.roleRevealed ? ` ${client.emojis.find(e => e.name == gamePlayer.role.replace(/ /g, "_"))}` : ""}: ${content}`)
      return undefined
    }
  if (game.currentPhase % 3 == 0) {
    if (!gamePlayer.alive) {
      let dead = game.players.filter(p => !p.alive).map(p => p.id)//.push(game.players[game.roles.indexOf("Medium")].id)
      for (var i = 0; i < dead.length; i++)
        if (dead[i] != message.author.id)
          client.users
            .get(dead[i])
            .send(`:skull: **${gamePlayer.number} ${message.author.username}**${gamePlayer.roleRevealed ? ` ${client.emojis.find(e => e.name == gamePlayer.role.replace(/ /g, "_"))}` : ""}: ${content}`)
      if (game.players[game.roles.indexOf("Medium")].alive && !game.players[game.roles.indexOf("Medium")].jailed) 
        client.users.get(game.players[game.roles.indexOf("Medium")].id)
          .send(`:skull: **${gamePlayer.number} ${message.author.username}**${gamePlayer.roleRevealed ? ` ${client.emojis.find(e => e.name == gamePlayer.role.replace(/ /g, "_"))}` : ""}: ${content}`, [message.author.id])
      return undefined
    }
    if (gamePlayer.role == "Medium" && gamePlayer.alive && !gamePlayer.jailed) {
      let dead = game.players.filter(p => !p.alive).map(p => p.id)
      for (var i = 0; i < dead.length; i++)
        client.users.get(dead[i]).send(`**Medium**: ${content}`)
      return undefined
    }
    
    if (gamePlayer.jailed && gamePlayer.alive) 
      return client.users.get(game.players[game.roles.indexOf("Jailer")].id).send(`**${gamePlayer.number} ${message.author.username}**: ${content}`)
    
    if (gamePlayer.role == "Jailer" && gamePlayer.alive) 
      if (game.players.find(p => p.jailed && p.alive))
        return client.users.get(game.players.find(p => p.jailed && p.alive).id).send(`**Jailer**: ${content}`)
      else
        return message.author.send("You did not jail anyone or your target cannot be jailed.")
    if (roles[gamePlayer.role].team == "Werewolves" && !gamePlayer.jailed) {
      let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && !p.jailed).map(p => p.id)
      for (var i = 0; i < wolves.length; i++)
        if (wolves[i] != message.author.id) 
          client.users.get(wolves[i])
            .send(`**${gamePlayer.number} ${message.author.username}**: ${content}`)
    }
  }
})