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
  
  setInterval( () => { 
    let QuickGames = games.get("quick")
    
    for (let i = 0; i < QuickGames.length; i++) {
      let game = QuickGames[i]
      
      if (game.currentPhase < 999)
        for (let pl = 0; pl < game.players.length; pl++) {
          if (game.currentPhase == -1) {
            if (!game.players[pl].alive || game.players[pl].left) continue;
            if (moment(game.players[pl].lastAction).add(2, 'm') <= moment()) {
              fn.getUser(client, game.players[pl].id).send(`You were removed from Game #${game.gameID} for inactivity.`)
              players.set(`${game.players[pl].id}.currentGame`, 0)
              game.players.splice(pl--, 1)
              fn.broadcastTo(
                client,
                game.players,
                `**${fn.getUser(client, game.players[pl].id
                )} left the game.`
              )
            } else if (moment(game.players[pl].lastAction).add(1.5, 'm') <= moment() && !game.players[pl].prompted) {
              game.players[pl].prompted = true
              fn.getUser(client, game.players[pl].id).send(
                "**You have been inactive for 1.5 minutes.**\n" +
                "Please respond `w!` within 30 seconds to show your activity.\n" +
                "You will be kicked from the game if you fail to do so."
              )
            }
          } else {
            if (!game.players[pl].alive || game.players[pl].left) continue;
            if (moment(game.players[pl].lastAction).add(2, 'm') <= moment()) {
              game.players[pl].alive = false
              game.players[pl].left = true
              game.players[pl].suicide = true
              if (game.config.deathReveal) game.players[pl].roleRevealed = game.players[pl].role
              players.add(`${game.players[pl].id}.suicides`, 1)
              players.set(`${game.players[pl].id}.currentGame`, 0)

              fn.getUser(client, game.players[pl].id).send(`You were removed from Game #${game.gameID} for inactivity.`)
              fn.broadcastTo(
                client,
                game.players.filter(p => !p.left),
                `**${game.players[pl].number} ${fn.getUser(
                  client,
                  game.players[pl].id
                )}${
                  game.config.deathReveal
                    ? ` ${fn.getEmoji(client, game.players[pl].role)}`
                    : ""
                }** suicided.`
              )
            } else if (moment(game.players[pl].lastAction).add(1.5, 'm') <= moment() && !game.players[pl].prompted) {
              game.players[pl].prompted = true
              fn.getUser(client, game.players[pl].id).send(
                "**You have been inactive for 1.5 minutes.**\n" +
                "Please respond `w!` within 30 seconds to show your activity.\n" +
                "You will be considered as suicide if you fail to do so."
              )
            }
          }
        }
      
      if (game.currentPhase === 999) {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left),
          new Discord.RichEmbed()
            .setTitle(`Game #${game.gameID}`)
            .addField(
              `Players`, 
              game.players.map(p => 
                `${p.number} ${client.users.get(p.id).username}${p.alive ? "" : " 💀"} ${
                fn.getEmoji(client, p.roleRevealed)}`
              ).join('\n')
            )
        )
        
        game.currentPhase++
        for (var j = 0; j < game.players.length; j++)
          players.set(`${game.players[j].id}.currentGame`, 0)
      }
      if (game.currentPhase == -1 || game.currentPhase >= 999) continue;
      
      if (moment(game.nextPhase) <= moment()) try { 
        if (game.currentPhase % 3 == 2)  {
          let lynchVotes = game.players.filter(player => player.alive).map(player => player.vote),
              lynchCount = []
          for (var j = 0; j < lynchVotes.length; j++) {
            if (!lynchCount[lynchVotes[j]]) lynchCount[lynchVotes[j]] = 0
            lynchCount[lynchVotes[j]] += game.players.filter(player => player.alive)[j].role == "Mayor" ? 2 : 1
          }
          if (lynchCount.length) {
            let max = lynchCount.reduce((m, n) => Math.max(m, n))
            let lynched = [...lynchCount.keys()].filter(i => lynchCount[i] === max)
            if (lynched.length > 1 || lynchCount[lynched[0]] < Math.floor(game.players.filter(player => player.alive).length/2)) {
              fn.broadcastTo(
                client, game.players.filter(p => !p.left), 
                "The village cannot decide on who to lynch."
              )
            }
            else {
              lynched = lynched[0]
              let lynchedPlayer = game.players[lynched-1]
              
              lynchedPlayer.alive = false
              if (game.config.deathReveal) lynchedPlayer.roleRevealed = lynchedPlayer.role
            
              game.lastDeath = game.currentPhase
              fn.broadcastTo(
                client, game.players.filter(p => !p.left), 
                `**${lynched} ${client.users.get(lynchedPlayer.id).username}${
                  game.config.deathReveal ? ` ${fn.getEmoji(client, lynchedPlayer.role)}` : ""}** was lynched by the village.`)
              
              if (["Junior Werewolf","Avenger"].includes(lynchedPlayer.role) && lynchedPlayer.avenge) {
                let avengedPlayer = game.players[lynchedPlayer.avenge-1]

                avengedPlayer.alive = false
                if (game.config.deathReveal) avengedPlayer.roleRevealed = avengedPlayer.role

                fn.broadcastTo(
                  client,
                  game.players.filter(p => !p.left),
                  `${fn.getEmoji(
                    client,
                    `${lynchedPlayer.role} Select`
                  )} The ${lynchedPlayer.role.toLowerCase()}'s death has been avenged, **${
                    avengedPlayer.number
                  } ${fn.getUser(client, avengedPlayer.id).username}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, avengedPlayer.role)}`
                      : ""
                  }** is dead!`
                )
              }
              if (lynchedPlayer.role == "Fool") {
                game.currentPhase = 999
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  new Discord.RichEmbed()
                    .setTitle("Game has ended.")
                    .setThumbnail(client.emojis.find(e => e.name == "Fool").url)
                    .setDescription(`Fool ${lynched} ${fn.getUser(client, lynchedPlayer.id).username} wins!`)
                )
                fn.addXP(game.players.filter(p => p.number == lynched), 100)
                fn.addXP(game.players.filter(p => !p.left), 15)
                fn.addWin(game, lynched, "Solo")
                continue;
              }
              if (lynchedPlayer.headhunter) {
                let headhunter = game.players[lynchedPlayer.headhunter-1]
                
                if (headhunter.alive) {
                game.currentPhase = 999
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  new Discord.RichEmbed()
                    .setTitle("Game has ended.")
                    .setThumbnail(client.emojis.find(e => e.name == "Headhunter").url)
                    .setDescription(`Headhunter **${headhunter.number} ${fn.getUser(client, headhunter.id).username}** wins!`)
                )
                fn.addXP(game.players.filter(p => p.number == headhunter.number), 100)
                fn.addXP(game.players.filter(p => !p.left), 15)
                fn.addWin(game, headhunter.number, "Solo")
                continue;
                }
              }
            }
          } else
            fn.broadcastTo(
              client, game.players.filter(p => !p.left), 
              "The village cannot decide on who to lynch."
            )
        }
        
        game.currentPhase += 1
        game.nextPhase = moment().add(game.currentPhase % 3 == 1 ? 60 : 45, 's')
        
        if (game.currentPhase % 3 == 1)  {
          let revivedPlayers = game.players.filter(p => p.revive && p.revive.length)
          for (var x = 0; x < revivedPlayers.length; x++){
            fn.broadcastTo(
              client, game.players.filter(p => !p.left).map(p => p.id),
              `<:Medium_Revive:660667751253278730> Medium has revived **${revivedPlayers[x].number} ${fn.getUser(client, revivedPlayers[x].id).username}**.`
            )
            
            game.players[revivedPlayers[x].number-1].alive = true
            for (var y of game.players[revivedPlayers[x].number-1].revive)
              game.players[y-1].revUsed = true
            game.players[revivedPlayers[x].number-1].revive = undefined
          }
          
          for (var x = 0; x < game.players.length; x++)
            Object.assign(game.players[x], {
              usedAbilityTonight: false,
              enchanted: []
            })
          
          let skKills = game.players.filter(player => player.alive && player.role == "Serial Killer").map(player => player.vote),
              sks = game.players.filter(player => player.alive && player.role == "Serial Killer")
          for (var x = 0; x < skKills.length; x++) {
            if (!skKills[x]) continue;
            let attacked = skKills[x],
                attackedPlayer = game.players[attacked-1],
                sk = game.players[sks[x].number-1]
            
            if (attackedPlayer.protectors.length) {
              fn.getUser(client, sk.id).send(
                `**${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** cannot be killed!`
              )
              for (var x of attackedPlayer.protectors) {
                let protector = game.players[x-1]

                if (protector.role == "Bodyguard") {
                  protector.health -= 1
                  if (protector.health) {
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
                    if (game.config.deathReveal) protector.roleRevealed = protector.role
                    fn.broadcastTo(
                      client, game.players.filter(p => !p.left),
                      `The werewolves killed **${protector.number} ${fn.getUser(client, protector.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`
                    )
                  }
                }
                else if (protector.role == "Tough Guy") {
                  protector.health = 0
                  
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor(
                        "Attacked!",
                        fn.getEmoji(client, "Bodyguard Protect").url
                      )
                      .setDescription(
                        `You protected **${attackedPlayer.number} ${
                          fn.getUser(client, attackedPlayer.id).username
                        }** who was attacked by **${sk.number} ${
                          client.getUser(client, sk.id).username
                        } ${client.getEmoji(client, sk.role)}**.\n` +
                        "You have been wounded and will die at the end of the day."
                      )
                  )
                }
                else if (protector.role == "Doctor") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Protection", fn.getEmoji("Doctor_Protection").url)
                      .setDescription(
                        `Your protection saved **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** last night!`
                      )
                  )
                }
                else if (protector.role == "Witch") {
                  protector.elixirUsed = true
                  
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Elixir", fn.getEmoji("Witch Elixir").url)
                      .setDescription("Last night your potion saved a life!")
                  )
                }
                else if (protector.role == "Beast Hunter") {
                }
              }
            }
            else if (attackedPlayer.role == "Bodyguard") {
              attackedPlayer.health -= 1
              if (attackedPlayer.health) {
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
                attackedPlayer.alive = false
                if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `The serial killer stabbed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )
              }
            }
            else if (attackedPlayer.role == "Tough Guy") {
              attackedPlayer.health = 0

              fn.getUser(client, attackedPlayer.id).send(
                new Discord.RichEmbed()
                  .setAuthor(
                    "Attacked!",
                    fn.getEmoji(client, "Bodyguard Protect").url
                  )
                  .setDescription(
                    `You were attacked by **${sk.number} ${
                      client.getUser(client, sk.id).username
                    } ${client.getEmoji(client, sk.role)}**.\n` +
                    "You have been wounded and will die at the end of the day."
                  )
              )
            }
            else {
              game.lastDeath = game.currentPhase - 1
              attackedPlayer.alive = false
              if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
              fn.broadcastTo(
                client, game.players.filter(p => !p.left).map(p => p.id),
                `The serial killer stabbed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}${
                  game.config.deathReveal
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
              
            let wwStrength = ["Werewolf", "Junior Werewolf", "Nightmare Werewolf", "Wolf Shaman", "Guardian Wolf", "Werewolf Berserk", "Alpha Werewolf", "Wolf Seer"]

            let wwByStrength = game.players
              .filter(p => p.alive && roles[p.role].team == "Werewolves")
            wwByStrength.sort((a,b) => {
              if (wwStrength.indexOf(a.role) > wwStrength.indexOf(b.role))
                return 1
              if (wwStrength.indexOf(a.role) < wwStrength.indexOf(b.role))
                return -1
              return 0
            })

            let weakestWW = game.players[wwByStrength[0].number-1]
            
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
                  protector.health -= 1
                  if (protector.health) {
                    fn.getUser(client, protector.id).send(
                      new Discord.RichEmbed()
                        .setAuthor("Attacked!", fn.getEmoji(client, "Bodyguard Protect").url)
                        .setDescription(
                          "You fought off an attack last night and survived.\n" +
                          "Next time you are attacked you will die."
                        )
                    )
                  }
                  else {
                    game.lastDeath = game.currentPhase - 1
                    protector.alive = false
                    if (game.config.deathReveal) protector.roleRevealed = protector.role
                    fn.broadcastTo(
                      client, game.players.filter(p => !p.left),
                      `The werewolves killed **${protector.number} ${fn.getUser(client, protector.id)}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, protector.role)}`
                          : ""
                      }**.`
                    )
                  }
                }
                else if (protector.role == "Tough Guy") {
                  protector.health = 0
                  
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor(
                        "Attacked!",
                        fn.getEmoji(client, "Bodyguard Protect").url
                      )
                      .setDescription(
                        `You protected **${attackedPlayer.number} ${
                          fn.getUser(client, attackedPlayer.id).username
                        }** who was attacked by **${weakestWW.number} ${
                          client.getUser(client, weakestWW.id).username
                        } ${client.getEmoji(client, weakestWW.role)}**.\n` +
                        "You have been wounded and will die at the end of the day."
                      )
                  )
                }
                else if (protector.role == "Doctor") {
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Protection", fn.getEmoji(client, "Doctor Protect").url)
                      .setDescription(
                        `Your protection saved **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}** last night!`
                      )
                  )
                }
                else if (protector.role == "Witch") {
                  protector.elixirUsed = true
                  
                  fn.getUser(client, protector.id).send(
                    new Discord.RichEmbed()
                      .setAuthor("Elixir", fn.getEmoji(client, "Witch Elixir").url)
                      .setDescription("Last night your potion saved a life!")
                  )
                }
                else if (protector.role == "Beast Hunter") {
                  weakestWW.alive = false
                  if (game.config.deathReveal) weakestWW.roleRevealed = weakestWW.role
                  else weakestWW.roleRevealed = "Fellow Werewolf"
                  
                  fn.broadcastTo(
                    client, game.players.filter(p => !p.left),
                    `The beast hunter's trap killed **${weakestWW.number} ${
                      client.getUser(client, weakestWW.id).username
                    } ${
                      game.config.deathReveal
                        ? client.getEmoji(client, weakestWW.role)
                        : client.getEmoji(client, "Fellow Werewolf")
                    }**.`
                  )

                  if (weakestWW.role == "Junior Werewolf" && weakestWW.avenge) {
                    let avengedPlayer = game.players[weakestWW.avenge-1]

                    avengedPlayer.alive = false
                    if (game.config.deathReveal) avengedPlayer.roleRevealed = avengedPlayer.role

                    fn.broadcastTo(
                      client,
                      game.players.filter(p => !p.left),
                      `${fn.getEmoji(
                        client,
                        `Junior Werewolf Select`
                      )} The junior werewolf's death has been avenged, **${
                        avengedPlayer.number
                      } ${fn.getUser(client, avengedPlayer.id).username}${
                        game.config.deathReveal
                          ? ` ${fn.getEmoji(client, avengedPlayer.role)}`
                          : ""
                      }** is dead!`
                    )
                  }
                }
              }
            }
            else if (attackedPlayer.role == "Cursed") {
              attackedPlayer.role = "Werewolf"
              game.lastDeath = game.currentPhase - 1
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
              attackedPlayer.health -= 1
              if (attackedPlayer.health) {
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
                attackedPlayer.alive = false
                if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
                fn.broadcastTo(
                  client, game.players.filter(p => !p.left),
                  `The werewolves killed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id)}${
                    game.config.deathReveal
                      ? ` ${fn.getEmoji(client, attackedPlayer.role)}`
                      : ""
                  }**.`
                )
              }
            }
            else if (attackedPlayer.role == "Tough Guy") {
              attackedPlayer.health = 0

              fn.getUser(client, attackedPlayer.id).send(
                new Discord.RichEmbed()
                  .setAuthor(
                    "Attacked!",
                    fn.getEmoji(client, "Bodyguard Protect").url
                  )
                  .setDescription(
                    `You were attacked by **${weakestWW.number} ${
                      client.getUser(client, weakestWW.id).username
                    } ${client.getEmoji(client, weakestWW.role)}**.\n` +
                    "You have been wounded and will die at the end of the day."
                  )
              )
            }
            else {
              game.lastDeath = game.currentPhase - 1
              attackedPlayer.alive = false
              if (game.config.deathReveal) attackedPlayer.roleRevealed = attackedPlayer.role
              fn.broadcastTo(
                client, game.players.filter(p => !p.left).map(p => p.id),
                `The werewolves killed **${attackedPlayer.number} ${fn.getUser(client, attackedPlayer.id).username}${
                  game.config.deathReveal
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
          
          if (game.currentPhase % 3 == 0 && game.players[j].role == "Tough Guy" && !game.players[j].health) {
            Object.assign(game.players[j], {
              health: 1,
              alive: false,
              roleRevealed: game.players[j].role
            })
            
            fn.broadcastTo(
              client, game.players.filter(p => !p.left),
              `The tough guy **${game.players[j].number} ${fn.getUser(client, game.players[j].id)}** was wounded last night and has died now.`
            )
          }
        }
        
        if (game.players.filter(p => p.alive && !roles[p.role].team.includes("Village")).length == 0) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left).map(p => p.id),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(client.emojis.find(e => e.name == "Villager").url)
              .setDescription(
                `The village wins!`
              )
          )
          fn.addXP(
            game.players.filter(
              p =>
                !p.suicide &&
                (roles[p.role].team == "Village" ||
                  (p.role == "Headhunter" &&
                    !game.players.find(pl => pl.headhunter == p.number).alive))
            ), 50
          )
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(
            p =>
              !p.suicide &&
              (roles[p.role].team == "Village" ||
                (p.role == "Headhunter" &&
                  !game.players.find(pl => pl.headhunter == p.number).alive))
          ).map(p => p.number), "Village")
          continue;
        }
        
        if (game.players.filter(p => p.alive && roles[p.role].team == "Werewolves").length >=
            game.players.filter(p => p.alive && (roles[p.role].team.includes("Village") || p.role == "Fool")).length &&
            !game.players.filter(p => p.alive && roles[p.role].team == "Solo" && p.role != "Fool").length) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left).map(p => p.id),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(client.emojis.find(e => e.name == "Werewolf").url)
              .setDescription(
                `The werewolves win!`
              )
          )
          fn.addXP(game.players.filter(p => !p.suicide && roles[p.role].team == "Werewolves"), 50)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, game.players.filter(p => !p.suicide && roles[p.role].team == "Werewolves").map(p => p.number), "Werewolves")
          continue;
        }
        
        let alive = game.players.filter(p => p.alive)
        
        if ((alive.length == 1 && roles[alive[0].role].team == "Solo" && alive[0].role != "Headhunter") ||
            (alive.length == 2 && alive.map(p => roles[p.role].team).includes("Solo") && !alive.map(p => p.role).includes("Headhunter") && alive.map(p => p.role).includes("Jailer"))) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left).map(p => p.id),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              .setThumbnail(client.emojis.find(e => e.name == alive.find(p => roles[p.role].team == "Solo")).url)
              .setDescription(
                `${alive.find(p => roles[p.role].team == "Solo")} **${alive.find(p => roles[p.role].team == "Solo").number} ` +
                `${fn.getUser(client, alive.find(p => roles[p.role].team == "Solo").id)}** wins!`
              )
          )
          fn.addXP(alive.find(p => roles[p.role].team == "Solo"), 250)
          fn.addXP(game.players.filter(p => !p.left), 15)
          fn.addWin(game, [alive.find(p => roles[p.role].team == "Solo").number], "Solo")
          continue;
        }
        
        if (game.lastDeath + 6 == game.currentPhase) {
          fn.broadcastTo(
            client, game.players.filter(p => !p.left), 
            "There has been no deaths for two days. Three consecutive days without deaths will result in a tie."
          )
        }
        
        if (game.lastDeath + 9 == game.currentPhase || !game.players.filter(p => p.alive).length) {
          game.currentPhase = 999
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.RichEmbed()
              .setTitle("Game has ended.")
              // .setThumbnail(client.emojis.find(e => e.name == "Headhunter").url)
              .setDescription(`It was a tie.`)
          )
          fn.addXP(game.players.filter(p => !p.suicide), 15)
          fn.addXP(game.players.filter(p => !p.left), 15)
          continue;
        }
        
        fn.broadcastTo(
          client, game.players.filter(p => !p.left), 
          game.currentPhase % 3 == 0 ? `Night ${Math.floor(game.currentPhase/3)+1} has started!` :
          game.currentPhase % 3 == 1 ? 
            new Discord.RichEmbed()
              .setTitle(`Day ${Math.floor(game.currentPhase/3)+1} has started!`)
              .setThumbnail(client.emojis.find(e => e.name == "Day").url)
              .setDescription("Start discussing!") :
          `Voting time has started. ${Math.floor(game.players.filter(player => player.alive).length/2)} votes are required to lynch a player.\nType \`w!vote [number]\` to vote against a player.`
        )
        
        if (game.currentPhase % 3 == 0) {
          if (game.roles.includes("Gunner")) {
            let gunners = game.players.filter(p => p.role == "Gunner").map(p => p.number)
            for (var x = 0; x < gunners.length; x++) 
              game.players[gunners[i]-1].shotToday = false
          }
          
          fn.broadcastTo(
            client,
            game.players.filter(
              p => p.alive &&
                  !["Doctor","Bodyguard","Tough Guy","Jailer","Red Lady","Marksman","Seer","Aura Seer","Spirit Seer",
                    "Detective","Medium","Witch","Avenger","Beast Hunter","Grumpy Grandma",
                    game.currentPhase == 0 ? "Cupid" : "",
                    "Werewolf","Alpha Werewolf","Wolf Shaman","Wolf Seer","Junior Werewolf","Nightmare Werewolf",
                    "Werewolf Berserk","Sorcerer",
                    "Serial Killer","Arsonist","Bomber","Sect Leader","Zombie","Corruptor","Cannibal"].includes(p.role)).map(p => p.id), 
            new Discord.RichEmbed()
              .setAuthor(`Night`, client.emojis.find(e => e.name == "Night").url)
              .setDescription("Nothing to do right now.\n" +
                              "Go back to sleep!"),
          )
          
          fn.broadcastTo(
            client,
            game.players.filter(
              p => p.alive &&
                   ["Seer", "Wolf Seer", "Sorcerer"].includes(p.role)).map(p => p.id), 
            new Discord.RichEmbed()
              .setAuthor(`Night`, client.emojis.find(e => e.name == "Night").url)
              .setDescription("Select a player to view their role (`w!check [player]`)."),
          )
          
          fn.broadcastTo(
            client,
            game.players.filter(
              p => p.alive &&
                   p.role == "Aura Seer").map(p => p.id), 
            new Discord.RichEmbed()
              .setAuthor(`Night`, client.emojis.find(e => e.name == "Night").url)
              .setDescription("Select a player to view their aura (`w!check [player]`)."),
          )
          
          if (game.players.find(p => p.role == "Jailer")) {
            let jailer = game.players.find(p => p.role == "Jailer")
              
            if (game.players.find(p => p.jailed && p.alive)) {
              let jailed = game.players.find(p => p.jailed && p.alive)
              
              if (jailer.alive) {
                if (roles[jailed.role].team == "Werewolves" && jailed.role !== "Sorcerer")
                  fn.broadcastTo(
                    client,
                    game.players
                      .filter(p => !p.left && roles[p.role].team == "Werewolves" && p.role !== "Sorcerer" && p.id !== jailed.id)
                      .map(p => p.id),
                    new Discord.RichEmbed()
                      .setTitle(`Jailed!`)
                      .setThumbnail(client.emojis.find(e => e.name == "Jail").url)
                      .setDescription(`Fellow Werewolf **${jailed.number} ${client.users.get(jailed.id).username}** is jailed!`)
                  )

                fn.getUser(client, jailer.id).send(
                  new Discord.RichEmbed()
                    .setTitle(`Jail`)
                    .setThumbnail(client.emojis.find(e => e.name == "Jail").url)
                    .setDescription("You did not select a player last day or your target could not be jailed.\n" +
                                    "Go back to sleep!")
                )

                fn.getUser(client, jailed.id)
                  .send(
                    new Discord.RichEmbed()
                      .setTitle(`Jailed`)
                      .setThumbnail(client.emojis.find(e => e.name == "Jail").url)
                      .setDescription(`You are now jailed.\nYou can talk to the jailer to prove your innocence.`)
                  )
              } else 
                game.players[jailed.number-1].jailed = false
            }
            else if (jailer.alive) {
              fn.getUser(client, jailer.id).send(
                new Discord.RichEmbed()
                    .setTitle(`Jail`)
                    .setThumbnail(client.emojis.find(e => e.name == "Jail").url)
                  .setDescription("You did not select a player last day or your target could not be jailed.\n" +
                                  "Go back to sleep!")
              )
            }
          }
        }
      }
      catch (error) {
        client.channels.get("664285087839420416")
          .send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("<:red_tick:597374220267290624> Game Terminated")
              .setDescription(`Game #${game.gameID} has been terminated due to the following reason: \`\`\`${error.stack}\`\`\``)
          )
        
        game.currentPhase = 999
       // fn.addXP(game.players, 15)
       // fn.addXP(game.players.filter(p => !p.left), 15)
        fn.broadcastTo(
          client, game.players.filter(p => !p.left),
          "<:red_tick:597374220267290624> There is an error causing this game to be terminated." +
          " Please contact staff members."
        )
      }
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
         coins: 0,
         roses: 0,
         currentGame: null,
         wins: [],
         loses: [],
         suicides: 0
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
  if (message.author.bot) return;
  console.log(message.author.tag + ' | ' + message.cleanContent)
  
  let player = players.get(message.author.id)
  if (!player.currentGame) return;
  
  let QG = games.get("quick")
  let game = QG.find(game => game.gameID == player.currentGame)
  let gamePlayer = game.players.find(player => player.id == message.author.id)
  
  gamePlayer.lastAction = moment()
  gamePlayer.prompted = false
  games.set("quick", QG)
  
  if (message.channel.type !== "dm" || message.author.bot) return;
  if (message.content.startsWith('w!') || message.content.toLowerCase() == "w!") return;

  let content = message.cleanContent
  content = content.replace(/(https?:\/\/)?((([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+\.)+([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+|localhost)(:\d+)?(\/[^\s]*)*/gi, "")
  //for (var role in roles) {
  //  if (!roles[role].abbr.length) continue;
  //  content = content.replace(new RegExp(`\\b(${roles[role].abbr.join("|")})\\b`, 'gi'), `$1 (${role})`)
  //}
  let abbrList = require('/app/util/abbr')
  for (var [full, abbrs] of Object.entries(abbrList)) {
    content = content.replace(new RegExp(`\\b(${abbrs.join("|")})\\b`, 'gi'), `$1 (${full})`)
  }
  
  if (game.currentPhase == -1)
    return fn.broadcast(client, game, `**${message.author.username}**: ${content}`, [message.author.id])
  
  if (game.currentPhase % 3 != 0)
    if (gamePlayer.alive)
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && p.id != message.author.id).map(p => p.id),
        `**${gamePlayer.number} ${message.author.username}**: ${content}`
      )
    else {
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && !p.alive && p.id != message.author.id).map(p => p.id),
        `_**${gamePlayer.number} ${message.author.username}**${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: ${content}_`
      )
    }
  if (game.currentPhase % 3 == 0) {
    if (!gamePlayer.alive) {
      return fn.broadcastTo(
        client, game.players.filter(p => !p.left && (!p.alive || (p.alive && p.role == "Medium")) && p.id != message.author.id).map(p => p.id),
        `_**${gamePlayer.number} ${message.author.username}**${gamePlayer.roleRevealed ? ` ${fn.getEmoji(client, gamePlayer.roleRevealed)}` : ""}: ${content}_`
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
        .send(`**${gamePlayer.number} ${message.author.username}**: ${content}`)
    
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
          .filter(p => roles[p.role].team == "Werewolves" && gamePlayer.role !== "Sorcerer" && !gamePlayer.jailed && gamePlayer.id != message.author.id)
          .map(p => p.id),
        `**<:Fellow_Werewolf:660825937109057587> ${gamePlayer.number} ${message.author.username}**: ${content}`)
    }
  }
})