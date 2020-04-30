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
    
    let targetID = target.user.id
    if (!gwainf.get(`${targetID}.inf`)) gwainf.set(`${targetID}.inf`, 0)
    gwainf.add(`${targetID}.inf`, 1)
    
    
  }
}
