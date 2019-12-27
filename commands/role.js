const Discord = require('discord.js')

const roles = require('/app/util/roles')

module.exports = {
  name: "role",
  run: async (client, message, args, shared) => {
    if (!args.length) return await message.author.send("You did not specify a role.")
    
    let targetRole = args.join(' ')
    let role = Object.entries(roles).find(([name, data]) => name.toLowerCase() == targetRole.toLowerCase() || (data.abbr && data.abbr.includes(targetRole.toLowerCase())))[0]
    if (!role) return await message.author.send("Unknown role.")
    
    await message.author.send(
      new Discord.RichEmbed()
        .setTitle(`${client.emojis.find(e => e.name == role.replace(/ /g, "_") && e.guild.id == "658631194870677553")} You are a${["A","E","I","O","U"].includes(role[0]) ? "n" : ""} ${role}.`)
        .setDescription(`${roles[role].desc}\nAura: ${roles[role].aura}\nTeam: ${roles[role].team}`)
    )
  }
}