const Discord = require("discord.js"),
      db = require("quick.db"),
      moment = require("moment")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

module.exports = {
  name: "nickname",
  aliases: ["nick"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)

    let m = await message.author
      .send(
        new Discord.RichEmbed()
          .setTitle("Please choose a nickname.")
          .setDescription("You have 1 minute to respond.")
      )
      .catch(() => {})
    if (!m) return await message.channel.send("I cannot DM you!")

    let input
    while (!input) {
      let response = await m.channel
        .awaitMessages(msg => msg.author.id == message.author.id, {
          max: 1,
          time: 60 * 1000,
          errors: ["time"]
        })
        .catch(() => {})
      if (!m) return await m.channel.send("Question timed out.")
      response = response.first()
      
      let usedNicknames = nicknames.all().map(x => x.data)

      if (
        response.content.match(/^[a-z0-9\_]{4,14}$/i) &&
        !usedNicknames.includes(response.content)
      )
        input = response.content
      else if (usedNicknames.includes(response.content))
        await message.channel.send("This nickname has been taken!")
      else await message.channel.send("Invalid nickname. Please try again.")
    }

    nicknames.set(message.author.id, input)
    player.lastNick = moment()

    players.set(message.author.id, player)
  }
}