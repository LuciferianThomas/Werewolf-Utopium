const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/home/utopium/wwou-staff/util/fn"),
      db = require("quick.db"),
      cd = new db.table("cd")

module.exports = {
  name: "p4g",
  run: async (client, message, args, shared) => {
    if (message.guild.id !== "522638136635817986") return undefined;
    if (!message.member.roles.cache.find(r => r.name == "Player")) return undefined;
    if (moment(cd.get("p4g") || 0).add(30,'m') >= moment()) {
      let diff = moment(cd.get("p4g") || 0).add(30,'m').diff(moment(), 'seconds')
      return await message.channel.send(`This command is on cooldown for **${Math.floor(diff / 60 / 60) % 24}h ${Math.floor(diff / 60) %
          60}m ${diff % 60}s**.`)
    }
    let p4gr = fn.getRole(message.guild, "Ping for game")
    await p4gr.setMentionable(true)
    cd.set("p4g", moment())
    await message.channel.send(`${p4gr} ${message.author} is calling for a game!`)
    await p4gr.setMentionable(false)
  }
}