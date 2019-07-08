const Discord = require('discord.js')
const db = require("quick.db")
const modCases = new db.table("MODCASES")

const fn = require('/app/bot/fn.js')

module.exports = {
  name: "case",
  usage: "case <id>",
  description: "View mod case",
  aliases: ["modcase", "cases"], // optional
  category: "Moderation",
  botStaffOnly: false, // required
  run: async (client, message, args, shared) => {
    let cases = modCases.get(message.guild.id)
    
    if (!cases || cases.length == 0) {
      message.channel.send(fn.embed(client, "There are no cases yet!"))
      modCases.set(message.guild.id, [])
      return undefined
    }
    
    if (!args[0] || isNaN(parseInt(args[0]))) {
      message.channel.send(fn.embed(client, `There has been ${cases.length} cases!`))
      return undefined
    }
    
    var thisCase = cases[parseInt(args[0])-1]
    console.log(cases)
    
    let embed = fn.modCaseEmbed(client, thisCase)
    
    message.channel.send(embed)
    return undefined
  }
}