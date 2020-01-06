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
  
  setInterval (async () => {   
    let QuickGames = games.get("quick")
    
    for (let i = 0; i < QuickGames.length; i++) {
      let game = QuickGames[i]
      if (game.currentPhase === 999) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left).map(p => p.id),
          new Discord.RichEmbed()
            .setTitle(`Game #${game.gameID}`)
            .addField(
              `Players`, 
              game.players.map(p => 
                `${p.number} ${client.users.get(p.id).username}${p.alive ? "" : " 💀"} ${
                client.emojis.find(e => e.name == p.role.replace(/ /g, "_"))}`
              ).join('\n')
            )
        )
        game.currentPhase++
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
            }
          } else
            fn.broadcast(client, game, "The village cannot decide on who to lynch.")
        }
        
        game.currentPhase += 1
        game.nextPhase = moment().add(game.currentPhase % 3 == 1 ? 60 : 45, 's')
        
        if (game.currentPhase % 3 == 0) {
          fn.broadcastTo(
            client,
            game.players.filter(
              p => p.alive &&
                  !["Doctor","Bodyguard","Tough Guy","Jailer","Red Lady","Marksman","Seer","Aura Seer","Spirit Seer",
                   "Detective","Medium","Witch","Avenger","Beast Hunter","Grumpy Grandma","Cupid","Werewolf","Alpha Werewolf",
                   "Wolf Shaman","Wolf Seer","Junior Werewolf","Nightmare Werewolf","Werewolf Berserk","Sorcerer","Serial Killer",
                   "Arsonist","Bomber","Sect Leader","Zombie","Corruptor","Cannibal"].includes(p.role)).map(p => p.id), 
            new Discord.RichEmbed()
              .setAuthor(`Night`, client.emojis.find(e => e.name == "Night").url)
              .setDescription("Nothing to do right now.\n" +
                              "Go back to sleep!"),

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
                  .setAuthor(`Jailed!`, client.emojis.find(e => e.name == "Jail").url)
                  .setDescription(`**${jailed.number} ${client.users.get(jailed.id).username}** is your prisoner.\n` +
                                  `You can talk anonymously to your prisoner, and you can execute your prisoner with \`w!shoot\`.`)
              )
            client.users.get(jailed.id)
              .send(
                new Discord.RichEmbed()
                  .setAuthor(`Jailed!`, client.emojis.find(e => e.name == "Jail").url)
                  .setDescription(`You are now jailed.\nYou can talk to the jailer to prove your innocence.`)
              )
            if (roles[jailed.role].team == "Werewolves") {
              let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && p.number != jailed.number)
              fn.broadcastTo(
                client, game.players.filter(p => roles[p.role].team == "Werewolves" && p.number != jailed.number && !p.left),
                new Discord.RichEmbed()
                  .setAuthor(`Jailed!`, client.emojis.find(e => e.name == "Jail").url)
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
          if (game.players.find(p => p.revive)) {
            fn.broadcast(client, game, `Medium revived ${game.players.find(p => p.revive).number} ${client.users.get(game.players.find(p => p.revive).id).username} (${game.players.find(p => p.revive).role}).`)
            game.players[game.players.find(p => p.revive).number-1].alive = true
            game.players[game.players.find(p => p.revive).number-1].revive = false
          }
          
          for (var x = 0; x < game.players.length; x++)
            game.players[x].usedAbilityTonight = false
          
          let skKills = game.players.filter(player => player.alive && player.role == "Serial Killer").map(player => player.vote),
              sks = game.players.filter(player => player.alive && player.role == "Serial Killer").map(player => player.id)
          for (var x = 0; x < skKills.length; x++) {
            if (!skKills[x]) continue;
            let attacked = skKills[x],
                attackedPlayer = game.players[attacked-1]
            
            if (attackedPlayer.protectors.length) {
              fn.getUser(client, sks[x]).send(
                `**${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** cannot be killed!`
              )
              for (var x of attackedPlayer.protectors) {
                let protector = game.players[x-1]

                if (protector.role == "Bodyguard") {
                  game.players[x-1].health -= 1
                  if (game.players[x-1].health) {
                    fn.getUser(client, protector.id).send(
                      new Discord.RichEmbed()
                        .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                        .setDescription(
                          "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                        )
                    )
                  }
                  else {
                    game.lastDeath = game.currentPhase - 1
                    game.players[x-1].alive = false
                    if (game.config.deathReveal) game.players[x-1].roleRevealed = true
                    fn.broadcastTo(
                      client, game.players.filter(p => !p.left),
                      `The werewolves killed **${protector.number} ${fn.getUser(client, protector.id)}${
                        game.config.roleReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`
                    )
                  }
                }
                else if (protector.role == "Tough Guy") {
                  // TODO
                }
                else if (protector.role == "Doctor") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setTitle("<:Doctor_Protect:660491111155892224> Protection")
                      .setDescription(
                        `Your protection saved **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** last night!`
                      )
                  )
                }
                else if (protector.role == "Witch") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setTitle("<:Witch_Elixir:660667541827485726> Elixir")
                      .setDescription("Last night your potion saved a life!")
                  )
                }
                else if (protector.role == "Beast Hunter") {
                  // TODO
                }
              }
            }
            else if (attackedPlayer.role == "Bodyguard") {
              game.players[attacked-1].health -= 1
              if (game.players[attacked-1].health) {
                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.RichEmbed()
                    .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                    .setDescription(
                      "You fought off an attack last night and survived.\n" +
                      "Next time you are attacked you will die."
                    )
                )
              }
              else {
                game.lastDeath = game.currentPhase - 1
                game.players[attacked-1].alive = false
                if (game.config.deathReveal) game.players[attacked-1].roleRevealed = true
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `The werewolves killed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id)}${
                    game.config.roleReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )
              }
            }
            else if (attackedPlayer.role == "Tough Guy") {
              // TODO
            }
            else {
              game.lastDeath = game.currentPhase - 1
              game.players[attacked-1].alive = false
              if (game.config.deathReveal) game.players[attacked-1].roleRevealed = true
              fn.broadcastTo(
                client, game.players.filter(p => !p.left).map(p => p.id),
                `The serial killer stabbed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}${
                  game.config.roleReveal
                    ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                    : ""
                }**.`
              )
            }
          }
          
          let wwVotes = game.players.filter(player => player.alive && roles[player.role].team == "Werewolves").map(player => player.vote),
              wwRoles = game.players.filter(player => player.alive && roles[player.role].team == "Werewolves").map(player => player.role),
              wwVotesCount = []
          for (var j = 0; j < wwVotes.length; j++) {
            if (!wwVotesCount[wwVotes[j]]) wwVotesCount[wwVotes[j]] = 0
            wwVotesCount[wwVotes[j]] += wwRoles[j] == "Alpha Werewolf" ? 2 : 1
          }
          if (wwVotesCount.length) {
            let max = wwVotesCount.reduce((m, n) => Math.max(m, n))
            let attacked = [...wwVotesCount.keys()].filter(i => wwVotesCount[i] === max)[0]
            let attackedPlayer = game.players[attacked-1]
            
            let wolves = game.players.filter(p => roles[p.role].team == "Werewolves" && !p.left).map(p => p.id)
            
            if (["Arsonist","Bomber","Cannibal","Illusionist","Serial Killer"].includes(attackedPlayer.role)) {
              fn.broadcastTo(
                client, wolves,
                `**${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** cannot be killed!`
              )
            }
            else if (attackedPlayer.protectors.length) {
              fn.broadcastTo(
                client, wolves,
                `**${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** cannot be killed!`
              )
              for (var x of attackedPlayer.protectors) {
                let protector = game.players[x-1]

                if (protector.role == "Bodyguard") {
                  game.players[x-1].health -= 1
                  if (game.players[x-1].health) {
                    fn.getUser(client, protector.id).send(
                      new Discord.RichEmbed()
                        .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                        .setDescription(
                          "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                        )
                    )
                  }
                  else {
                    game.lastDeath = game.currentPhase - 1
                    game.players[x-1].alive = false
                    if (game.config.deathReveal) game.players[x-1].roleRevealed = true
                    fn.broadcastTo(
                      client, game.players.filter(p => !p.left),
                      `The werewolves killed **${protector.number} ${fn.getUser(client, protector.id)}${
                        game.config.roleReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`
                    )
                  }
                }
                else if (protector.role == "Tough Guy") {
                  // TODO
                }
                else if (protector.role == "Doctor") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setTitle("<:Doctor_Protect:660491111155892224> Protection")
                      .setDescription(
                        `Your protection saved **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** last night!`
                      )
                  )
                }
                else if (protector.role == "Witch") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setTitle("<:Witch_Elixir:660667541827485726> Elixir")
                      .setDescription("Last night your potion saved a life!")
                  )
                }
                else if (protector.role == "Beast Hunter") {
                  // TODO
                }
              }
            }
            else if (attackedPlayer.role == "Cursed") {
              game.players[attacked-1].role = "Werewolf"
              fn.getUser(client, attackedPlayer.id).send(
                new Discord.RichEmbed()
                  .setTitle("<:Fellow_Werewolf:660825937109057587> Converted!")
                  .setDescription("You have been bitten! You are a <:Werewolf:658633322439639050> Werewolf now!")
              )
              fn.broadcastTo(
                client, wolves,
                `**${attackedPlayer.number} ${
                  fn.getUser(client, attackedPlayer.id).username
                }** is the <:Cursed:659724101258313768> Cursed and is turned into a <:Werewolf:658633322439639050> Werewolf!`
              )
            }
            else if (attackedPlayer.role == "Bodyguard") {
              game.players[attacked-1].health -= 1
              if (game.players[attacked-1].health) {
                fn.getUser(client, attackedPlayer.id).send(
                  new Discord.RichEmbed()
                    .setTitle("<:Bodyguard_Protect:660497704526282786> Attacked!")
                    .setDescription(
                      "You fought off an attack last night and survived.\n" +
                      "Next time you are attacked you will die."
                    )
                )
              }
              else {
                game.lastDeath = game.currentPhase - 1
                game.players[attacked-1].alive = false
                if (game.config.deathReveal) game.players[attacked-1].roleRevealed = true
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `The werewolves killed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id)}${
                    game.config.roleReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )
              }
            }
            else if (attackedPlayer.role == "Tough Guy") {
              // TODO
            }
            else {
              game.lastDeath = game.currentPhase - 1
              game.players[attacked-1].alive = false
              if (game.config.deathReveal) game.players[attacked-1].roleRevealed = true
              fn.broadcastTo(
                client, game.players.filter(p => !p.left).map(p => p.id),
                `The werewolves killed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}${
                  game.config.roleReveal
                    ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                    : ""
                }**.`
              )
            }
          }
          
          for (var j = 0; j < game.players.length; j++) {
            game.players[j].jailed = false
            game.players[j].protectors = []
          }
        }
        
        for (var j = 0; j < game.players.length; j++) {
          game.players[j].vote = null
        }
        
        if (game.players.filter(p => p.alive && !roles[p.role].team.includes("Village")).length == 0) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. The village wins!`)
          continue;
        }
        
        if (game.players.filter(p => p.alive && roles[p.role].team == "Werewolves").length >=
            game.players.filter(p => p.alive && roles[p.role].team != "Werewolves").length) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. The werewolves win!`)
          continue;
        }
        
        let alive = game.players.filter(p => p.alive)
        
        if ((alive.length == 1 && alive[0].role == "Serial Killer") ||
            (alive.length == 2 && alive.map(p => p.role).includes("Serial Killer") && alive.map(p => p.role).includes("Jailer"))) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. Serial Killer wins!`)
          continue;
        }
        
        if (game.lastDeath + 6 == game.currentPhase) {
          fn.broadcast(client, game, "There has been no deaths for two days. Three consecutive days without deaths will result in a tie.")
        }
        
        if (game.lastDeath + 9 == game.currentPhase) {
          game.currentPhase = 999
          fn.broadcast(client, game, `Game has ended. It was a tie.`)
          continue;
        }
        
        fn.broadcast(
          client, game, 
          game.currentPhase % 3 == 0 ? `Night ${Math.floor(game.currentPhase/3)+1} has started!` :
          game.currentPhase % 3 == 1 ? `Day ${Math.floor(game.currentPhase/3)+1} has started!` :
          `Voting time has started. ${Math.floor(game.players.filter(player => player.alive).length/2)} votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
        )
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
  content = content.replace(/(https?:\/\/)?((([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+\.)+([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+|localhost)(:\d+)?(\/[^\s]*)*/gi, "")
  //for (var role in roles) {
  //  if (!roles[role].abbr.length) continue;
  //  content = content.replace(new RegExp(`\\b(${roles[role].abbr.join("|")})\\b`, 'gi'), `$1 (${role})`)
  //}
  let abbrList = require('/app/util/abbr')
  for (var [full, abbrs] of Object.entries(abbrList)) {
    content = content.replace(new RegExp(`\\b(${abbrs.join("|")})\\b`, 'gi'), `$1 (${full})`)
  }
  
  let game = games.get("quick").find(game => game.gameID == player.currentGame)
  let gamePlayer = game.players.find(player => player.id == message.author.id)
  if (game.currentPhase == -1)
    return fn.broadcast(client, game, `**${message.author.username}**: ${content}`, [message.author.id])
  
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