const Discord = require("discord.js")
const moment = require("moment")

const db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players")

const { defaultPrefix, embedColor } = require('./config.js'),
      fn = require('./fn'),
      roles = require("./roles")

const broadcast = async (client, game, content, ignore = []) => {
  for (var i = 0; i < game.players.length; i++) 
    if (!ignore.includes(game.players[i].id)) await client.users.get(game.players[i].id).send(content)
}

const broadcastTo = (client, users, content) => {
  if (typeof users[0] !== "string") users = users.map(x => x.id)
  
  let game = games.get("quick").find(g => g.gameID == players.get(`${users[0]}.currentGame`))
  // if (game.currentPhase % 3 !== 0) users.push(...game.spectators)
  
  for (var i = 0; i < users.length; i++) 
    client.users.get(users[i]).send(content)
}

const addXP = (users, xp) => {
  if (typeof users[0] !== "string") users = users.map(x => x.id)
  for (var i = 0; i < users.length; i++)
    players.add(`${users[i]}.xp`, xp)
}

const addWin = (game, winners, team) => {
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].suicide) continue;
    if (winners.includes(game.players[i].number))
      players.push(`${game.players[i].id}.wins`, {
        role: game.players[i].role,
        team: team ? team : roles[game.players[i].role].team
      })
    else 
      players.push(`${game.players[i].id}.loses`, {
        role: game.players[i].role,
        team:
          game.players[i].role == "Headhunter" &&
          game.players.find(
            p => p.alive && p.headhunter == game.players[i].number
          )
            ? "Solo"
            : roles[game.players[i].role].team
      })
  }
}

module.exports = {
  broadcast: broadcast,
  broadcastTo: broadcastTo,
  addXP: addXP,
  addWin: addWin,
}