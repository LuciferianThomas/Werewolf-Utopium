const Discord = require('discord.js')

module.exports = {
  name: "embed",
  usage: "embed [color] <message>",
  description: "Commands information.",
  category: "Utility",
  botStaffOnly: false,
  run: async (client, msg, args, shared) => {
    
		const { commands } = msg.client
    let mapped = commands.map(command => `${shared.guild.prefix}${command.name}\n`)
    
    let perms = {}
    perms.bot = commands.map(command => !(command.botStaffOnly && !shared.user.botStaff))
    perms.guild = commands.map(command => !(command.guildPerms && !msg.member.hasPermission(command.guildPerms)))
    let cmdCats = commands.map(command => command.category)
    
    let userCommands = {}
    for (var i = 0; i < mapped.length; i++) {
      if (perms.bot[i] && perms.guild[i]) {
        if (!userCommands[cmdCats[i]]) userCommands[cmdCats[i]] = []
        userCommands[cmdCats[i]].push(mapped[i])
      }
    }

		if (args.length == 0) {
      for (var i in userCommands) {
        let embed = new Discord.RichEmbed() 
          .setTitle(`${client.user.username} | ${i} Commands`)
          .setColor(shared.embedColor)
          .setThumbnail(client.user.avatarURL)
          .setDescription(userCommands[i].join('') + "\nDo `help [command]` to get information about specific commands!")
          .setTimestamp()
        msg.author.send(embed)
          .catch(err => {
          msg.channel.send(embed).catch(error => {
            msg.channel.send("I can't DM you, nor can I send my help information here!\nThe `Embed Links` permissions is crucial to me, so please enable it whereever I should be!")
          })
        })
      }
		} else {
			const name = args[0].toLowerCase();
			const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

			if (!command) {
				return msg.reply('that\'s not a valid command!')
			}

			var embed = new Discord.RichEmbed()
        .setColor(shared.embedColor)
        .setAuthor(`${shared.prefix}${command.name}`, client.user.avatarURL)

			if (command.aliases) embed.addField(`Aliases`, command.aliases.join(', '))
			if (command.description) embed.addField(`Description`, command.description)
			if (command.usage) embed.addField(`Usage`,`\`${command.usage}\``)

			msg.channel.send(embed).then(msg.delete())
		}
  }
}