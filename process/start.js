const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")

const fn = require("/app/util/fn"),
      roles = require('/app/util/roles')

module.exports = async (client, game) => {
  let Games = games.get("quick")
  
  await fn.broadcast(client, game, "Game is starting...")
    
  game.originalRoles.splice(game.players.length)
  let gameRoles = fn.clone(game.originalRoles)
  
  for (var i = 0; i < game.players.length; i++) {
    game.players[i].number = i+1
    let thisPlayer = game.players[i]
    let role = thisPlayer.role = gameRoles.splice(Math.floor(Math.random() * (game.players.length-i)), 1)[0]
    Object.assign(game.players[i], {alive: true, protectors: []})
        
    if (thisPlayer.role == "Bodyguard")
        thisPlayer.health = 2
    if (thisPlayer.role == "Tough Guy")
        thisPlayer.health = 1
    if (thisPlayer.role == "Medium")
        thisPlayer.revUsed = false
    if (thisPlayer.role == "Jailer" || thisPlayer.role == "Priest")
        thisPlayer.bullets = 1; break;
    if (thisPlayer.role == "Gunner" || thisPlayer.role == "Marksman")
        thisPlayer.bullets = 2; break;
    if (thisPlayer.role == "Fortune Teller":
        thisPlayer.cards = []; break;
    }
    
    if (thisPlayer.role.includes("Random")) {
      let rdmRoles = Object.values(roles).filter(
        role =>
          ((thisPlayer.role == "Random" && role.cat !== "Random") || thisPlayer.role == `Random ${role.cat}`) && 
            !(game.originalRoles.includes(role.name) && role.oneOnly)
      )
      
      role = thisPlayer.role = rdmRoles[thisPlayer.role][Math.floor(Math.random()*rdmRoles[thisPlayer.role].length)]
    }
    
    await client.users.get(thisPlayer.id).send(
      new Discord.RichEmbed()
        .setThumbnail(fn.getEmoji(client, game.players[i].role).url)
        .setTitle(
          `You are ${
            roles[role].oneOnly
              ? "the"
              : /^([aeiou])/i.test(role)
              ? "an"
              : "a"
          } ${role}.`
        )
        .setDescription(
          `${roles[role].desc}\n\nAura: ${roles[role].aura}\nTeam: ${roles[role].team}`
        )
    )
  }
  
  game.roles = game.players.map(p => p.role)
  game.lastDeath = 0
  game.currentPhase += 1
  game.nextPhase = moment().add(30, "s")
  
  let headhunters = game.players.filter(p => p.role == "Headhunter")
  for (var i = 0; i < headhunters.length; i++) {
    let possibleTargets = game.players
      .filter(p => 
        roles[p.role].team.includes("Village") && 
        !["Gunner", "Priest", "Mayor", "Cursed"].includes(p.role) && 
        p.number !== headhunters[i].number &&
        !p.headhunter
      ).map(p => p.number)
    if (!possibleTargets.length) 
      possibleTargets = game.players.filter(p => !p.headhunter).map(p => p.number)
    let target = possibleTargets[Math.floor(Math.random()*possibleTargets.length)]
    game.players[target-1].headhunter = headhunters[i].number
    await client.users.get(game.players.find(player => player.role == "Headhunter").id)
      .send(
        new Discord.RichEmbed()
          .setAuthor(`Target`, client.emojis.find(e => e.name == "Headhunter_Target").url)
          .setDescription(`Your target is ${target} ${client.users.get(game.players[target-1].id).username}.`)
      )
  }
  
  fn.broadcastTo(
    client, game.players.filter(p => !p.left),
    "Night 1 has started."
  )
  
  if (game.roles.includes("President")) {
    let president = game.players.find(p => p.role == "President")
    
    fn.broadcastTo(
      client, game.players.filter(p => !p.left),
      new Discord.RichEmbed()
        .setTitle("President")
        .setThumbnail(fn.getEmoji(client, "President"))
        .setDescription(`**${president.number} ${fn.getUser(client, president.id).username}** is the President!`)
    )
    
    president.roleRevealed = "President"
  }
  
  let thisGame = Games.find(g => g.gameID == game.gameID)
  thisGame = game
  
  games.set("quick", Games)
}