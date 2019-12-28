const Discord = require('discord.js')

const roles = require('/app/util/roles')

module.exports = {
  name: "role",
  run: async (client, message, args, shared) => {
    if (!args.length) return await message.author.send("You did not specify a role.")
    
    let targetRole = args.join(' ')
    let role = Object.entries(roles).find(([name, data]) => name.toLowerCase() == targetRole.toLowerCase() || (data.abbr && data.abbr.includes(targetRole.toLowerCase())))
    if (!role) return await message.author.send("Unknown role.")
    role = role[0]
    
    await message.author.send(
      new Discord.RichEmbed()
        .setTitle(`${role}`)
        .setThumbnail(client.emojis.find(e => e.name == role.replace(/ /g, "")).url)
        .setDescription(`${roles[role].desc}\n\nAura: ${roles[role].aura}\nTeam: ${roles[role].team}`)
    )
  }
}