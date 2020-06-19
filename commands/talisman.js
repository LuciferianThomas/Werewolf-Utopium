const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      fs = require('fs')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

let commands = new Discord.Collection()

const commandFiles = fs.readdirSync('/home/sd/wwou//commands/talisman').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`/home/sd/wwou/commands/talisman/${file}`)
  commands.set(command.name, command)
}

module.exports = {
  name: "talisman",
  aliases: ["talis"],
  run: async (client, message, asdf, shared) => {
    var args = message.content.trim().slice(shared.commandName.length+3).split(/\s+/u)
    
		const commandName = args.shift().toLowerCase()
		const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return await message.author.send("Unknown command.")
    
		await command.run(client, message, args)
  }
}