const Discord = require('discord.js'),
      db = require("quick.db"),
      moment = require("moment")

const modCases = new db.table("MODCASES"),
      guildData = new db.table("GUILDDATA")

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
    
    let caseID = args[0], mod = args[1].toLowerCase(), item = args[2].toLowerCase(), newVal = args.slice(3).join(" ")
    
    if (!caseID || isNaN(parseInt(caseID))) return message.channel.send(fn.embed(client, `There has been ${cases.length} cases!`))
    
    var thisCase = cases.find(r => r.id == parseInt(caseID))
    if (!thisCase) return message.channel.send(fn.embed(client, `Case #${caseID} does not exist!`))
    
    if (mod == "delete") cases.splice(cases.indexOf(thisCase), 1)
    if (mod == "edit") {
      switch (item) {
        case "reason":
          cases[cases.indexOf(thisCase)].reason = newVal
          break;
        case "duration": case "period":
          if (!["TEMPMUTE", "MUTE"].includes(thisCase.type))
            return message.channel.send(fn.embed(client, `You can only modify the durations of a mute!`))
          
          let time = args[3].toLowerCase()
          if (!time) return message.channel.send(
            fn.embed(client, {
              title: "You did not state a valid time length!",
              description: "`d` for days, `h` for hours, `m` for minutes\nExample: `3d12h` = 3 days and 12 hours"}
            )
          )

          var days = parseInt(time.toLowerCase().match(/\d+d/g))
          var hours = parseInt(time.toLowerCase().match(/\d+h/g))
          var mins = parseInt(time.toLowerCase().match(/\d+m/g))
          if (Number.isNaN(days)) days = 0
          if (Number.isNaN(hours)) hours = 0
          if (Number.isNaN(mins)) mins = 0
          var length = ((days * 24 + hours) * 60 + mins) * 60 * 1000

          if (Number.isNaN(length) || length == 0) return message.channel.send(
            fn.embed(client, {
              title: "You did not state a valid time length!",
              description: "- `3d` for 3 days\n- `12h` for 12 hours\n- `30m` for 30 minutes\nStacking of different units is allowed, i.e. `3d12h` = 3 days and 12 hours"}
            )
          )
          
          cases[cases.indexOf(thisCase)].period = length
          cases[cases.indexOf(thisCase)].type = "TEMPMUTE"
          
          if (!guildData.has(`${message.guild.id}.tempmutes`)) guildData.set(`${message.guild.id}.tempmutes`, [])
          guildData.push(`${message.guild.id}.tempmutes`, {
            case: thisCase.id,
            user: thisCase.user,
            unmute: moment().add(length/1000/60, 'm')
          })
          break;
        default:
          return message.channel.send(fn.embed(client, `\`${item}\` is either not editable or is invalid!`))
      }
      let msg
      if (thisCase.message) {
        let c = client.channels.get(guildData.get(`${message.guild.id}.modlog`))
        if (c) {
          let m = c.fetchMessage(thisCase.message).catch(() => {})
          if (m) m.edit(fn.modCaseEmbed(client, thisCase))
        }
      }
    }
    
    message.channel.send(fn.modCaseEmbed(client, thisCase))
    return undefined
  }
}