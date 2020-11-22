const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "give",
  run: async (client, message, args, shared) => {
    //return await message.channel.send("Giving coins is disabled right now :(")
    let thisPlayer = players.get(message.author.id)
    let targetPlayer
    if (!args[0])
      return await message.channel.send("Missing arguments.")
    else if (message.mentions.users.size) targetPlayer = message.mentions.users.first()
    if (!targetPlayer && args[0]) 
      targetPlayer = fn.getUser(
        client, 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")) ? 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")).ID : args[0]
      )
    if (args[0] && !targetPlayer)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} User \`${args[0]}\` not found.`)
    if (!targetPlayer)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    
    let thatPlayer = players.get(targetPlayer.id)
    if (!thatPlayer)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    if (message.author.id == targetPlayer.id)
      return await message.channel.send(`k done`)
    
    let input = parseInt(args[1], 10)
    if (isNaN(input))
      return await message.channel.send(`${args[1]} is not a valid integer!`)
    
    if (thisPlayer.coins < input)
      return await message.channel.send(`You do not have ${input} coins!`)
    if (input < 0)
      return await message.channel.send(`Nope. You can't **give negative coins**!`)
    if (input == 0)
      return await message.channel.send(`Nope. You can't **give zero coins**!`)
    
    players.subtract(`${message.author.id}.coins`, input)
    players.add(`${targetPlayer.id}.coins`, input)
    await message.channel.send(
      new Discord.MessageEmbed()
      .setTitle(`Coins for you!`)
      .setDescription(
        `Successfully transferred ${input} ${fn.getEmoji(client, "Coin")} from your balance to ${nicknames.get(targetPlayer.id)}!\n` +
        `You now have ${players.get(`${message.author.id}.coins`)} ${fn.getEmoji(client, "Coin")}.\n` +
        `${nicknames.get(targetPlayer.id)} now has ${players.get(`${targetPlayer.id}.coins`)} ${fn.getEmoji(client, "Coin")}.`
      )
    )
    await targetPlayer.send(
      new Discord.MessageEmbed()
      .setTitle("Moar coins!")
      .setDescription(
        `${nicknames.get(message.author.id)} transferred ${input} ${fn.getEmoji(client, "Coin")} to you.\n` +
        `You now have ${players.get(`${targetPlayer.id}.coins`)} ${fn.getEmoji(client, "Coin")}.`
      )
    )
  }
}