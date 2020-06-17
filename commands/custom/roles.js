const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

module.exports = {
  name: "roles",
  aliases: ["role"],
  run: async (client, message, args, shared) => {
    let target
    if (!args[0]) target = message.author
    else if (message.mentions.users.size) target = message.mentions.users.first()
    if (!target && args[0]) 
      target = fn.getUser(
        client, 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")) ? 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")).ID : args[0]
      )
    if (args[0] && !target)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} User \`${args[0]}\` not found.`)
    if (!target)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    target = target.id
    if(!players.get(target+".custom") || !players.get(target+".inventory.custom maker")) return message.reply("you don't have the Custom Maker! Buy it in the shop first")
    
    let embed = new Discord.MessageEmbed()
    .setTitle(`Custom Roles for ${nicknames.get(target)}`)
    .addField("\u200b", "\u200b", true)
    .setFooter(`You can buy more roles with the command \`w!custom buy <role>\`.`)
    let i = 0
    await players.get(target+".custom").forEach(role => {
      embed.fields[i].name = "\u200b"
      embed.fields[i].value += `${fn.getEmoji(client, role)}`
      if(embed.fields[i].value.length > 900){
        i++
        embed.fields.push({name: "\u200b", value: "\u200b", inline: true})
      }
    })
    message.channel.send(embed)
  }
}