const Discord = require("discord.js"),
  moment = require("moment"),
  db = require("quick.db")

const giveaways = new db.table("giveaways")

const fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "bonus",
  aliases: ["bonusentries"],
  run: async (client, message, args, shared) => {
    let bonus = giveaways.get("bonus")
    let embed = new Discord.MessageEmbed()
      .setTitle("Bonus Entries")
      .setDescription("")
      .setTimestamp()
    for (let [key, value] of Object.entries(bonus)) {
      embed.description += `<@${key}> (${key}) - ${value} entr${value == 1 ? "y" : "ies"}\n`
    }
    message.channel.send(embed)
  }
}
