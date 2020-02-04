const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      fs = require('fs')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

let commands = new Discord.Collection()

const commandFiles = fs.readdirSync('/app/commands/custom').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`/app/commands/custom/${file}`)
  commands.set(command.name, command)
}

module.exports = {
  name: "custom",
  run: async (client, message, asdf, shared) => {
    var args = message.content.trim().slice(shared.commandName.length+3).split(/\s+/u)
    
		const commandName = args.shift().toLowerCase()
		const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return await message.author.send("Unknown command.")
    
		try {
			await command.run(client, message, args)
		} catch (error) {
			console.log(error)
		}
  }
}