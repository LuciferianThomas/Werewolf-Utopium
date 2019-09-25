const Discord = require('discord.js'),
      db = require("quick.db")

const modCases = new db.table("MODCASES")

const fn = require('/app/util/fn')

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
    
    let caseID = args[0], mod = args[1].toLowerCase(), newVal = args.slice(2).join(" ")
    
    if (!caseID || isNaN(parseInt(caseID))) return message.channel.send(fn.embed(client, `There has been ${cases.length} cases!`))
    
    var thisCase = cases.find(r => r.id == parseInt(caseID))
    if (!thisCase) return message.channel.send(fn.embed(client, `Case #${caseID} does not exist!`))
    
    if (mod == "delete") cases.splice(cases.indexOf(cases.find(r => r.id == parseInt(caseID))), 1)
    if (mod == "edit") cases[cases.indexOf(cases.find(r => r.id == parseInt(caseID)))] = newVal
    
    let embed = fn.modCaseEmbed(client, thisCase)
    
    message.channel.send(embed)
    return undefined
  }
}