const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      shop = require("/home/utopium/wwou/util/shop")

module.exports = {
  name: "add",
  run: async (client, message, args, shared) => {
    if (!client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.find(r => r.name.includes("Moderator")))
      return await message.channel.send("You do not have permissions to add items!")
    
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
    
    
    let am = parseInt(args[args.length - 1], 10)
    if (!Number.isNaN(am)) args.pop()
    else am = 1
    let input = args.slice(1).join(" "),
        item = shop[input]
    if(!item) return message.channel.send(`${fn.getEmoji(client, "red_tick")} Invalid item.`)
    
    players.add(`${targetPlayer.id}.inventory.${item.itemid}`, am)
    fn.addLog("items", `${message.author.tag} added ${am} ${item.name}(s) to ${nicknames.get(targetPlayer.id)}, giving them a total of ${players.get(`${targetPlayer.id}.inventory.${item.itemid}`)} ${item.name}(s).`)
    
    
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`New item!`)
        .setDescription(
          `Successfully given ${am} ${item.name}(s) to ${nicknames.get(targetPlayer.id)}\n` +
          `${nicknames.get(targetPlayer.id)} now has ${players.get(`${targetPlayer.id}.inventory.${item.itemid}`)} ${item.name}(s).`
        )
    )
    await targetPlayer.send(
      new Discord.MessageEmbed()
        .setTitle("New item!")
        .setDescription(
          `${nicknames.get(message.author.id)} added ${am} ${item.name}(s) to your inventory\n` +
          `You now have ${players.get(`${targetPlayer.id}.inventory.${item.itemid}`)} ${item.name}(s).`
        )
    )
    await client.channels.cache.get("694656469232123965").send(
      new Discord.MessageEmbed()
        .setTitle("New item!")
        .setDescription(
          `${nicknames.get(message.author.id)} added ${am} ${item.name}(s) to ${nicknames.get(targetPlayer.id)}'s inventory\n` +
          `They now have ${players.get(`${targetPlayer.id}.inventory.${item.itemid}`)} ${item.name}(s).`
        )
    )
  }
}