const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      fs = require('fs')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

let commands = new Discord.Collection()

const commandFiles = fs.readdirSync('/home/utopium/wwou/commands/logs').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`/home/utopium/wwou/commands/logs/${file}`)
  commands.set(command.name, command)
}

module.exports = {
  name: "logs",
  aliases: ["log"],
  run: async (client, message, asdf, shared) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "βTester Helper",
            "Mini Moderator",
            "Moderator",
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    )
      return undefined
    
    var args = message.content.trim().slice(shared.commandName.length+3).split(/\s+/u)
    
		const commandName = args.shift().toLowerCase()
		const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return await message.author.send("Unknown command.")
    
    await command.run(client, message, args)
  }
}