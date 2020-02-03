const Discord = require("discord.js")
const moment = require("moment")

const db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

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
        team: team ? team : 
              game.players[i].sect ? "Sect" : roles[game.players[i].role].team
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
            : game.players[i].sect
            ? "Sect"
            : roles[game.players[i].role].team
      })
  }
}

const death = (client, game, number, suicide = false) => {
  let deadPlayer = game.players.find(p => p.number == number)
  
  if (!suicide) {
    // AVENGING
    if (!deadPlayer.alive && ["Junior Werewolf","Avenger"].includes(deadPlayer.role)
        && !deadPlayer.avenged && !deadPlayer.suicide) {
      let avengingPlayer = deadPlayer
      let avengedPlayer = game.players[avengingPlayer.avenge-1]
      if (!avengedPlayer.alive) return undefined

      avengedPlayer.alive = false
      if (game.config.deathReveal) avengedPlayer.roleRevealed = avengedPlayer.role

      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `${fn.getEmoji(
          client,
          `${avengingPlayer.role} Select`
        )} The ${avengingPlayer.role.toLowerCase()}'s death has been avenged, **${
          avengedPlayer.number
        } ${nicknames.get(avengedPlayer.id)}${
          game.config.deathReveal
            ? ` ${fn.getEmoji(client, avengedPlayer.role)}`
            : ""
        }** is dead!`
      )

      game = death(client, game, avengedPlayer.number)
    }

    // LOVE COUPLE SUICIDE
    if (!deadPlayer.alive && !deadPlayer.suicide && deadPlayer.lover) {
      let otherLover = game.players.find(p => p.number !== deadPlayer.number && p.lover)
      if (!otherLover.alive) return undefined

      otherLover.alive = false
      if (game.config.deathReveal) otherLover.roleRevealed = otherLover.role

      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `${fn.getEmoji(
          client, `Cupid Lovers`
        )} **${
          otherLover.number
        } ${nicknames.get(otherLover.id)}${
          game.config.deathReveal
            ? ` ${fn.getEmoji(client, otherLover.role)}`
            : ""
        }** lost the love of their life and has suicided!`
      )

      game = death(client, game, otherLover.number)
    }

    // SECT SUICIDE
    if (!deadPlayer.alive && !deadPlayer.suicide && deadPlayer.role == "Sect Leader" && deadPlayer.sectSuicided) {
      let sectLeader = game.players.find(p => p.role == "Sect Leader")
      let sectMembers = game.players.filter(p => p.alive & p.sect)

      for (var sectMember of sectMembers) {
        sectMember.alive = false
        if (game.config.deathReveal) sectMember.roleRevealed = sectMember.role

        fn.broadcastTo(
          client,
          game.players.filter(p => !p.left),
          `${fn.getEmoji(
            client, `Sect Member`
          )} Sect Member **${
            sectMember.number
          } ${nicknames.get(sectMember.id)}${
            game.config.deathReveal
              ? ` ${fn.getEmoji(client, sectMember.role)}`
              : ""
          }** committed suicide!`
        )

        game = death(client, game, sectMember.number)
      }
    }
  }

  return game
}

module.exports = {
  broadcast: broadcast,
  broadcastTo: broadcastTo,
  addXP: addXP,
  addWin: addWin,
  death: death
}