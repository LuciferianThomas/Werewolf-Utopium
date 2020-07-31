const Discord = require("discord.js"),
      db = require("quick.db"),
      moment = require("moment")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js')

module.exports = {
  name: "username",
  aliases: ["nick", "nickname"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id),
        origNick = nicknames.get(message.author.id)
    
    if (player.currentGame) 
      return await message.author.send("You cannot change your username during a game!")
    
    if (moment(player.lastNick).add(7, "d") >= moment()) {
      let diff = moment(player.lastNick)
        .add(7, "d")
        .diff(moment(), "seconds")
      return await message.author.send(
        `You cannot change your username for another **${Math.floor(
          diff / 60 / 60 / 24
        )}d ${Math.floor(diff / 60 / 60) % 24}h ${Math.floor(diff / 60) %
          60}m ${diff % 60}s**.`
      )
    }
    
    if (player.coins < 100)
      return await message.author.send(
        `Changing your username costs 100 ${fn.getEmoji(
          client,
          "Coin"
        )}. You have ${player.coins} ${fn.getEmoji(
          client,
          "Coin"
        )} and you need ${100 - player.coins} ${fn.getEmoji(
          client,
          "Coin"
        )} more.`
      )
    
    if (players.get(`${message.author.id}.prompting`)) 
      return await message.author.send("You have an active prompt already!")
    players.set(`${message.author.id}.prompting`, true)
    
    let conf = await message.author.send(`Changing your username costs 100 ${fn.getEmoji(client, "Coin")}. Proceed?`)
    await conf.react(fn.getEmoji(client, "green_tick"))
    let reactions = await conf.awaitReactions(
      (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
                u.id == message.author.id,
      { max: 1, time: 10000, errors: ["time"] }
    ).catch(() => {})
    if (!reactions) return await message.author.send("Prompt cancelled.")

    let m = await message.author
      .send(
        new Discord.MessageEmbed()
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
        response.match(/^[a-z0-9\_]{3,15}$/i) &&
        !usedNicknames.includes(response.toLowerCase())
      )
        input = response.replace(/_/g, "\\_")
      else if (response.length > (player.usernameLength || 14)) {
        await m.channel.send("This username is too long! The maximum number of characters is " + (player.usernameLength || 15) + ".")
        continue;
      }
      else if (response.length < 3) {
        await m.channel.send("This username is too short!")
        continue;
      }
      else if (!response.match(/^[a-z0-9\_]{3,14}$/i)) {
        await m.channel.send("This username contains invalid characters! Only alphanumerical characters or underscores are accepted.")
        continue;
      }
      else if (usedNicknames.includes(response.toLowerCase())) {
        await m.channel.send("This username has been taken!")
        continue;
      }
      else await m.channel.send("Invalid username. Please try again.")
    
      let conf2 = await message.author.send(`Changing your nickname to **${input}**. Proceed?`)
      await conf2.react(fn.getEmoji(client, "green_tick"))
      let reactions = await conf2.awaitReactions(
        (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 10000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
    }

    nicknames.set(message.author.id, input)
    player.lastNick = moment()
    player.coins -= 100
    
    await m.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`You changed your nickname to **${input}**.`)
        .setDescription(`You now have ${player.coins} ${fn.getEmoji(client, "Coin")}.`)
    )
    
    await client.channels.cache.get("686761420271910940").send(
      new Discord.MessageEmbed()
        .setTitle(`${origNick} changed their nickname to **${input}**.`)
        .setDescription(`They now have ${player.coins} ${fn.getEmoji(client, "Coin")}.`)
    )

    players.set(message.author.id, player)
  }
}