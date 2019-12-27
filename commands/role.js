const Discord = require('discord.js')

const roles = require('/app/util/roles')

module.exports = {
  name: "role",
  run: async (client, message, args, shared) => {
    if (!args.length) return await message.author.send("You did not specify a role.")
    
    let targetRole = args.join(' ')
    let role = roles[Object.keys(roles).find(r => r.toLowerCase() == targetRole.toLowerCase())] || Object.values(roles).find(r => r.aliases.includes(targetRole.toLowerCase()))
    if (!role) return await message.author.send("Invalid ")
  }
}