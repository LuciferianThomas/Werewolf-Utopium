const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")

const broadcast = async (client, game, content) => {
  for (var i = 0; i < game.players.length; i++)
    await client.users.get(game.players[i].id).send(content)
}

module.export = async (client, game) => {
  await broadcast(client, game, "Game is starting...")
  
  for (var i = 0; i < game.players.length; i++) {
    game.players[i].role = game.roles.splice(Math.floor(Math.random() * game.roles.length), 1)
    await client.users.get(game.players[i].id)
      .send(`You are a${["A","E","I","O","U"].includes(game.players[i].role[0]) ? "n" : ""} ${game.players[i].role}.`)
  }
  
  game.currentPhase += 1
}