const Discord = require('discord.js'),
      db = require("quick.db")

const modCases = new db.table("MODCASES")

const fn = require('/app/bot/fn.js')

module.exports = {
  name: "case",
  usage: "case <id>",
  description: "View mod case",
  aliases: ["modcase", "cases"],
  category: "Moderation",
  run: async (client, message, args, shared) => {
    let cases = modCases.get(message.guild.id)
    
    if (!cases || cases.length == 0) {
      message.channel.send(fn.embed(client, "There are no cases yet!"))
      modCases.set(message.guild.id, [])
      return undefined
    }
    
    if (!args[0] || isNaN(parseInt(args[0]))) return message.channel.send(fn.embed(client, `There has been ${cases.length} cases!`))
    
    var thisCase = cases.find(r => r.id == parseInt(args[0]))
    if (!thisCase) return message.channel.send(fn.embed(client, `Case #${args[0]} does not exist!`))
    
    let embed = fn.modCaseEmbed(client, thisCase)
    
    message.channel.send(embed)
    return undefined
  }
}