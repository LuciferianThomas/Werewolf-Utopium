const Discord = require("discord.js"),
  moment = require("moment"),
  db = require("quick.db")

const fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "help",
  run: async (client, message, args) => {
    let embed = new Discord.MessageEmbed()
      .setTitle("Staff Help Menu")
      .setColor(0x7289da)
      .setThumbnail(client.user.avatarURL())
    let member = client.guilds.cache
      .get("522638136635817986")
      .members.cache.get(message.author.id)
    if (member) {
      if (
        member.roles.cache.find(r =>
          ["βTester Helper", "Developer"].includes(r.name)
        )
      )
        embed.addField(
          "βTester Helper Commands",
          "`w!beta <datetime>` | Schedule a beta test | Example: `w!beta 2020 Jan 1 00:00 GMT+0`\n" +
            "`w!betawarn <messageID> <gameCode>` | Alerts everyone who responded to the scheduled game\n" +
            "`w!games get [gameID]` | Get game information for specific game.\n" +
            "`w!games list [mode]` | Get list of games and partial information of each game.\n" +
            "`w!coins add [player] [amount] [reason]` | Give coins for beta tests. **Must provide reason**."
        )
      if (member.roles.cache.find(r => ["Staff"].includes(r.name)))
        embed.addField(
          "Staff Commands",
          "`w!now <timezone>` | Shows your current time as well as the server time | Example: `w!now -0600`\n" +
            "`w!tag <tag_id>` | Sends a saved tag message\n" +
            "`w!tag create <tag_id> <tag_message>` | Save a new tag message"
        )
      if (member.roles.cache.find(r => ["Moderator"].includes(r.name)))
        embed.addField(
          "Moderator Commands",
          "`w!gwaclm <userID> <messageID>` | Sends a message that the user has claimed their giveaway\n" +
            "`w!gwainf <user> <messageID> <reason>` | Logs a giveaway infracion\n"
        )
    }
    if (embed.fields.length > 0) message.author.send(embed)
  }
}
