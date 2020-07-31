const Discord = require("discord.js"),
  moment = require("moment"),
  db = require("quick.db")

const giveaways = new db.table("giveaways")

const fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "releaseroll",
  aliases: ["releaseroll"],
  run: async (client, message, args, shared) => {
    let bonus = giveaways.get("bonus")
    let gwa = await client.guilds.cache.get("522638136635817986").channels.cache.get("704231388592996392").messages.fetch("723930189943537856")
    let entries = gwa.reactions.cache.first()
    entries = entries.users.cache.map(x => x.id)
    console.log(entries)
  }
}
