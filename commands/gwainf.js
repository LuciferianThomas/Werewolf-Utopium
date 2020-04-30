const Discord = require("discord.js"),
      db = require('quick.db'),
      moment = require('moment')

const fn = require("/app/util/fn")

const gwainf = new db.table("gwainf")

module.exports = {
  name: "gwainf",
  run: async (client, message, args, shared) => {
    if (!args.length) 
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please mention the user you want to add an giveaway infraction.`)
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target)
      target = await fn.getMember(message.guild, args[0])
    if (!target)
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please mention the user you want to add an giveaway infraction.`)
    
    let msg = await client.channels.cache.get("704231388592996392").messages.fetch(args[1])
    if (!msg) return await message.channel.send(`${fn.getEmoji(client, "red tick")} Unknown message.`)
    if (!(msg.author.id == "294882584201003009" && msg.content.includes("GIVEAWAY ENDED")))
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} This is not an ended giveaway!.`)
    
    let reason = args.slice(2).join(' ')
    if (!reason) return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please give a reason why the user is given an infraction!`)
    
    let targetID = target.user.id
    if (!gwainf.get(`${targetID}.inf`)) gwainf.set(`${targetID}.inf`, 0)
    gwainf.add(`${targetID}.inf`, 1)
    
    let embed = new Discord.MessageEmbed()
      .setColor(0x7289da)
      .setTitle("Giveaway Infraction")
      .setThumbnail(target.user.avatarURL())
      .setDescription(
        `**User:** ${target.user} (${target.user.od})\n` +
        `**Infraction** #${gwainf.get(`${targetID}.inf`)}\n` +
        `**Reason:** ${reason}\n` +
        `[Jump to giveaway](${msg.url})`
      )
  }
}
