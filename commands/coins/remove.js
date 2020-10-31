const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "remove",
  run: async (client, message, args, shared) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "βTester Helper",
            "Mini Moderator",
            "Moderator",
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    )
      return undefined
    
    if (!client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.find(r => r.name.includes("Moderator")))
      return await message.channel.send("You do not have permissions to add coins! Use `w!coins give` to give coins.")
    
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
    
    let input = parseInt(args[1], 10)
    if (isNaN(input))
      return await message.channel.send(`${args[1]} is not a valid integer!`)
    
    if (input < 0)
      return await message.channel.send(`Nope. You can't **give negative coins**!`)
    if (input == 0)
      return await message.channel.send(`Nope. You can't **give zero coins**!`)
    
    input = Math.min(input, players.get(`${targetPlayer.id}.coins`))
    
    players.subtract(`${targetPlayer.id}.coins`, input)
    
    let reason = args.slice(2).join(' ')
    
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`Oh no!`)
        .setDescription(
          `Successfully removed ${input} ${fn.getEmoji(client, "Coin")} from ${nicknames.get(targetPlayer.id)}${
          reason.length ? ` for **${reason}**` : ""}!\n` +
          `${nicknames.get(targetPlayer.id)} now has ${players.get(`${targetPlayer.id}.coins`)} ${fn.getEmoji(client, "Coin")}.`
        )
    )
    await targetPlayer.send(
      new Discord.MessageEmbed()
        .setTitle("Oh no!")
        .setDescription(
          `${nicknames.get(message.author.id)} removed ${input} ${fn.getEmoji(client, "Coin")} from your balance${
          reason.length ? ` for **${reason}**` : ""}.\n` +
          `You now have ${players.get(`${targetPlayer.id}.coins`)} ${fn.getEmoji(client, "Coin")}.`
        )
    )
    await client.channels.cache.get("686761420271910940").send(
      new Discord.MessageEmbed()
        .setTitle("Oh no!")
        .setDescription(
          `${nicknames.get(message.author.id)} removed ${input} ${fn.getEmoji(client, "Coin")} to ${nicknames.get(targetPlayer.id)}'s balance${
          reason.length ? ` for **${reason}**` : ""}.\n` +
          `They now have ${players.get(`${targetPlayer.id}.coins`)} ${fn.getEmoji(client, "Coin")}.`
        )
    )
  }
}