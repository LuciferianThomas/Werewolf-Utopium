const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")

const fn = require("/app/util/fn")

const roles = require('/app/util/roles')

module.exports = async (client, game) => {
  let ModeGames = games.get(game.mode)
  
  await fn.broadcast(client, game, "Game is starting...")
  
  for (var i = 0; i < game.players.length; i++) {
    game.players[i].number = i+1
    game.players[i].role = game.roles.splice(Math.floor(Math.random() * (game.players.length-i)), 1)[0]
    await client.users.get(game.players[i].id)
      .send(
        new Discord.RichEmbed()
          .setThumbnail(client.emojis.find(e => e.name == game.players[i].role.replace(/ /g, "_")))
          .setTitle(game.players[i].role)
          .setDescription(`${roles[game.players[i].role].desc}\n\nAura: ${roles[game.players[i].role].aura}\nTeam: ${roles[game.players[i].role].team}`)
      )
    game.players[i].alive = true
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
        !["Serial Killer", "Gunner", "Priest", "Mayor", "Cursed"].includes(player.role)
      ).map(player => player.number)
    game.hhTarget = possibleTargets[Math.floor(Math.random()*possibleTargets.length)]
    await client.users.get(game.players.find(player => player.role == "Headhunter").id)
      .send(`Your target is ${game.hhTarget} ${game.players[game.hhTarget-1]}.`)
  }
  
  ModeGames[ModeGames.indexOf(ModeGames.find(g => g.id == game.id))] = game
  
  await fn.broadcast(client, game, "Night 1 has started.")
  
  games.set(game.mode, ModeGames)
}