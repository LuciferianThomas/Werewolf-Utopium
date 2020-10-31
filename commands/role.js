const Discord = require('discord.js')

const roles = require('/home/utopium/wwou/util/roles.js'),
      fn = require('/home/utopium/wwou/util/fn.js')

module.exports = {
  name: "role",
  run: async (client, message, args, shared) => {
    if (!args.length) return await message.channel.send("You did not specify a role.")
    
    let targetRole = args.join(' ')
    let role = Object.values(roles).find(
      data =>
        data.name.toLowerCase().startsWith(targetRole.toLowerCase()) ||
         (data.abbr && data.abbr.includes(targetRole.toLowerCase()))
    )
    
    if (!role) return await message.channel.send("Unknown role.")
    let rolecmdobj = client.commands.filter((cmd) => cmd.gameroles && cmd.gameroles.includes(role.name)).array()
    let rolecmds = []
    rolecmdobj.forEach(cmd => {
      rolecmds.push(cmd.name)
    })
    // console.log(role)
    if (!role) return await message.channel.send("Unknown role.")
    
    let embed = new Discord.MessageEmbed()
        .setTitle(`${role.name}`)
        .setThumbnail(fn.getEmoji(client, role.name).url)
        .setDescription(`${role.desc}${role.aura ? `\n\nAura: ${role.aura}` : ""}${role.team ? `\nTeam: ${role.team}` : ""}\n${role.ideaBy ? `\nIdea By: ${role.ideaBy}` : ""}${role.graphicsBy ? `\nGraphics By: ${graphicsBy}` : ""}`);
    if (rolecmds.length)
      embed.addField("Action Commands", `${rolecmds.map(c => `\`w!${c}\``).join(', ')}`)
    
    await message.channel.send(embed)
  }
}