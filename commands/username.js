const Discord = require("discord.js"),
      db = require("quick.db"),
      moment = require("moment")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

module.exports = {
  name: "username",
  aliases: ["nick", "nickname"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You cannot change your username during a game!")

    let m = await message.author
      .send(
        new Discord.RichEmbed()
          .setTitle("Please choose a username.")
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
      response = response.first().content
      
      let usedNicknames = nicknames.all().map(x => x.data.toLowerCase())

      if (
        response.match(/^[a-z0-9\_]{3,14}$/i) &&
        !usedNicknames.includes(response.toLowerCase())
      )
        input = response.replace(/_/g, "\\_")
      else if (response.length > 14)
        await m.channel.send("This username is too long!")
      else if (response.length < 3)
        await m.channel.send("This username is too short!")
      else if (!response.match(/^[a-z0-9\_]{3,14}$/i))
        await m.channel.send("This username contains invalid characters! Only alphanumerical characters or underscores are accepted.")
      else if (usedNicknames.includes(response.toLowerCase()))
        await m.channel.send("This username has been taken!")
      else await m.channel.send("Invalid username. Please try again.")
    }

    nicknames.set(message.author.id, input)
    player.lastNick = moment()
    
    await m.channel.send(`You changed your nickname to **${input}**.`)

    players.set(message.author.id, player)
  }
}