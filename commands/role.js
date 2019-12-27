const Discord = require('discord.js')

const roles = require('/app/util/roles')

module.exports = {
  name: "role",
  run: async (client, message, args, shared) => {
    let targetRole = args.forEach(x => x[0] = x[0].toUpperCase()).join(' ')
    let role = roles[targetRole]
    if (!role) role = Object.values(roles).find(r => r.aliases.includes(targetRole.toLowerCase()))
  }
}