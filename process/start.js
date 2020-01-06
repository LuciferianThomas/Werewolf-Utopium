const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")

const fn = require("/app/util/fn")

const roles = require('/app/util/roles')

module.exports = async (client, game) => {
  let Games = games.get("quick")
  
  await fn.broadcast(client, game, "Game is starting...")
  
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].spectator) continue;
    game.players[i].number = i+1
    let role = game.players[i].role = game.roles.splice(Math.floor(Math.random() * (game.players.length-i)), 1)[0]
    await client.users.get(game.players[i].id)
      .send(
        new Discord.RichEmbed()
          .setThumbnail(client.emojis.find(e => e.name == game.players[i].role.replace(/ /g, "_")).url)
          .setTitle(`You are ${["Jailer","Cupid","President","Sect Leader"].includes(role) ? "the" :
                               (/^([aeiou])/i).test(role) ? "an" : "a"} ${role}.`)
          .setDescription(`${roles[role].desc}\n\nAura: ${roles[role].aura}\nTeam: ${roles[role].team}`)
      )
    Object.assign(game.players[i], {alive: true, protectors: []})
    if (game.players[i].role == "Bodyguard") game.players[i].health = 2
    if (game.players[i].role == "Medium") game.players[i].revUsed = false
    if (game.players[i].role == "Jailer") game.players[i].bullets = 1
    if (game.players[i].role == "Gunner") game.players[i].bullets = 2
  }
  
  game.lastDeath = 0
  game.roles = game.players.map(player => player.role)
  game.currentPhase += 1
  game.nextPhase = moment().add(1, "m")
  if (game.roles.includes("Headhunter")) {
    let possibleTargets = game.players
      .filter(player => 
        !player.role.toLowerCase().includes("wolf") && 
        !["Serial Killer", "Gunner", "Priest", "Mayor", "Cursed"].includes(player.role) && 
        player.id !== game.players.find(player => player.role == "Headhunter").id
      ).map(player => player.number)
    game.hhTarget = possibleTargets[Math.floor(Math.random()*possibleTargets.length)]
    await client.users.get(game.players.find(player => player.role == "Headhunter").id)
      .send(`Your target is ${game.hhTarget} ${client.users.get(game.players[game.hhTarget-1].id).username}.`)
  }
  
  Games[Games.indexOf(Games.find(g => g.gameID == game.gameID))] = game
  
  await fn.broadcast(client, game, "Night 1 has started.")
  
  games.set("quick", Games)
}