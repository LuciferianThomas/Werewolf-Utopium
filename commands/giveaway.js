const Discord = require("discord.js"),
      moment = require("moment"),
      fn = require("/home/utopium/wwou-staff/util/fn"),
      fs = require("fs")

let commands = new Discord.Collection()

const commandFiles = fs.readdirSync('/home/utopium/wwou-staff/commands/giveaway').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`/home/utopium/wwou-staff/commands/giveaway/${file}`)
  commands.set(command.name, command)
}

module.exports = {
  name: "giveaway",
  aliases: ["gwa"],
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

    let args = message.content.trim().slice(shared.commandName.length+3).split(/\s+/u)
    
		const commandName = args.shift().toLowerCase()
		const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return await message.author.send("Unknown command.")
    
		await command.run(client, message, args)
  }
}