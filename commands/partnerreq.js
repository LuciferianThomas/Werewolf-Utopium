const Discord = require("discord.js"),
  fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "partnerreq",
  run: async (client, message, args, shared) => {
    let user = message.mentions.members.first()
    message.delete()
    if(!user) return message.channel.send("Please specify a user")
    let newchan = await client.guilds.cache
      .get("522638136635817986")
      .channels.create(user.username.toLowerCase(), {
        type: "text",
        parent: "688966538270736583",
        topic: "User: " + user.user.tag,
        permissionOverwrites: [
          {
            id: user.user.id,
            allow: [
              "VIEW_CHANNEL",
              "SEND_MESSAGES"
            ],
            deny: ["MENTION_EVERYONE"]
          },
          {
            id: "688967410480709663",
            allow: [
              "VIEW_CHANNEL",
              "SEND_MESSAGES"
            ]
          },
          { id: message.guild.id, deny: ["VIEW_CHANNEL"] }
        ]
      })
  }
}
