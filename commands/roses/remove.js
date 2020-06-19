const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

module.exports = {
  name: "remove",
  run: async (client, message, args, shared) => {
    if (!client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.find(r => r.name.includes("Moderator")))
      return await message.channel.send("You do not have permissions to remove roses!")
    
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
      return await message.channel.send(`Nope. You can't **give negative roses**!`)
    if (input == 0)
      return await message.channel.send(`Nope. You can't **give zero roses**!`)
    
    input = Math.min(input, players.get(`${targetPlayer.id}.roses`))
    
    players.subtract(`${targetPlayer.id}.roses`, input)
    let item = {name: "Rose"}
    fn.addLog("roses", `${message.author.tag} removed ${input} rose(s) to ${nicknames.get(targetPlayer.id)}, leaving them with a total of ${players.get(`${targetPlayer.id}.roses`)} roses(s).`)
    
    
    let reason = args.slice(2).join(' ')
    
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`Oh no!`)
        .setDescription(
          `Successfully removed ${input} ${fn.getEmoji(client, "Rose")} from ${nicknames.get(targetPlayer.id)}${
          reason.length ? ` for **${reason}**` : ""}!\n` +
          `${nicknames.get(targetPlayer.id)} now has ${players.get(`${targetPlayer.id}.roses`)} ${fn.getEmoji(client, "Rose")}.`
        )
    )
    await targetPlayer.send(
      new Discord.MessageEmbed()
        .setTitle("Oh no!")
        .setDescription(
          `${input} ${fn.getEmoji(client, "Rose")} was removed from your balance${
          reason.length ? ` for **${reason}**` : ""}.\n` +
          `You now have ${players.get(`${targetPlayer.id}.roses`)} ${fn.getEmoji(client, "Rose")}.`
        )
    )
    await client.channels.cache.get("690080603634532433").send(
      new Discord.MessageEmbed()
        .setTitle("Oh no!")
        .setDescription(
          `${input} ${fn.getEmoji(client, "Rose")} was removed from ${nicknames.get(targetPlayer.id)}'s balance${
          reason.length ? ` for **${reason}**` : ""}.\n` +
          `They now have ${players.get(`${targetPlayer.id}.roses`)} ${fn.getEmoji(client, "Rose")}.`
        )
    )
  }
}