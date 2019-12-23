const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")

const fn = require("/app/util/fn")

module.exports = async (client, game) => {
  let ModeGames = games.get(game.mode)
  
  await fn.broadcast(client, game, "Game is starting...")
  
  for (var i = 0; i < game.players.length; i++) {
    game.players[i].number = i+1
    game.players[i].role = game.roles.splice(Math.floor(Math.random() * game.players.length-i), 1)[0]
    await client.users.get(game.players[i].id)
      .send(`You are a${["A","E","I","O","U"].includes(game.players[i].role[0]) ? "n" : ""} ${game.players[i].role}.`)
    game.players[i].alive = true
    if (game.players[i].role == "Bodyguard") game.players[i].health = 2
  }
  
  game.currentPhase += 1
  game.nextPhase = moment().add(1, "m")
  if (game.players.map(player => player.role).includes("Headhunter")) {
    let possibleTargets = game.players
      .filter(player => 
        !player.role.toLowerCase().includes("wolf") && 
        !["Serial Killer", "Gunner", "Priest", "Mayor", "Cursed"].includes(player.role)
      ).map(player => player.id)
    game.hhTarget = possibleTargets[Math.floor(Math.random()*possibleTargets.length)]
    await client.users.get(game.players.find(player => player.role == "Headhunter").id)
      .send(`Your target is ${game.hhTarget} ${game.players[game.hhTarget-1]}.`)
  }
  
  ModeGames[ModeGames.indexOf(ModeGames.find(g => g.id == game.id))] = game
  
  await fn.broadcast(client, game, "Night 1 has started.")
  
  games.set(game.mode, ModeGames)
}