const Discord = require("discord.js"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "clear",
  aliases: ["clr"],
  run: async (client, message, args) => {
    if (!client.guilds.get("522638136635817986").members.get(message.author.id).roles.find(r => r.name == "clr prm"))
      return undefined
    
    if (!args.length) 
      return message.reply("please give a reason why you have to clear all games!")
    
    let reason = args.join(" ")
    
    games.set("quick", [])
    
    for (var x = 0; x < players.all().length; x++) {
      let player = players.get(players.all()[x].ID)
      if (typeof player == "object")
        players.set(`${players.all()[x].ID}.currentGame`, 0)
      else players.set(`${players.all()[x].ID}`, {
        currentGame: 0, 
        xp: 0
      })
    }
    
    message.reply("cleared all games!")
    
    client.users.get("336389636878368770")
      .send(`${message.author.tag} cleared all games because of \`${reason}\`.`)
  }
}