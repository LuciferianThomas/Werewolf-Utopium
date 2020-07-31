const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames,
      logs = new db.table("Logs")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = (client) => {
  setInterval(() => {
    let bannedPlayers = players.all().map(p => players.get(p.ID)).filter(p => p.banned)
    for (var bannedPlayer of bannedPlayers) {
      if (moment(bannedPlayer.banned.until) <= moment()) {
        players.delete(`${bannedPlayer.id}.banned`)
        let unbanned = fn.getUser(client, bannedPlayer.id)
        if (!unbanned) continue;
        unbanned.send("Your blacklist has expired!").catch(() => {})
      }
    }
  }, 1000*60)
}