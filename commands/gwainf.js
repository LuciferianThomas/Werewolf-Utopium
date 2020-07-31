const Discord = require("discord.js"),
      db = require('quick.db'),
      moment = require('moment')

const fn = require("/home/utopium/wwou-staff/util/fn")

const gwainf = new db.table("gwainf")

module.exports = {
  name: "gwainf",
  run: async (client, message, args, shared) => {
    if (message.guild.id !== "522638136635817986" && !message.member.roles.cache.get("678427121701617676"))
      return undefined;
    
    if (!args.length) 
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please mention the user you want to add an giveaway infraction.`)
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target)
      target = await fn.getMember(message.guild, args[0])
    if (!target)
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please mention the user you want to add an giveaway infraction.`)
    
    let msg = await client.channels.cache.get("704231388592996392").messages.fetch(args[1])
    if (!msg) return await message.channel.send(`${fn.getEmoji(client, "red tick")} Unknown message.`)
    
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
        `**User:** ${target.user} (${target.user.id})\n` +
        `**Infraction** #${gwainf.get(`${targetID}.inf`)}\n` +
        `**Reason:** ${reason}\n` +
        `[Jump to giveaway](${msg.url})`
      )
    
    await client.channels.cache.get("704644135558316032").send(embed)
    await target.user
      .send(
        "**You have received a giveaway infraction.**\n" +
          "3 strikes will result in a one-month giveaway ban.\n" +
          "5 strikes will result in a two-month giveaway ban.\n" +
          "7 strikes will result in a permanent giveaway ban.",
        embed
      )
      .catch(async e => {
        let m = await message.channel.send(
          new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Error")
            .setDescription(`I cannot DM ${target.user}!`)
        )
        m.delete({timeout: 5000})
      })
    
    let m = await message.channel.send(`${fn.getEmoji(client, "green tick")} Infraction recorded.`)
    await m.delete({timeout: 5000})
  }
}
