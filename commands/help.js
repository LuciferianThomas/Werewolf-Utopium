const Discord = require('discord.js')

module.exports = {
  name: "help",
  usage: "help [command]",
  description: "Help command.",
  category: "Utility",
  botStaffOnly: false,
  run: async (client, msg, args, shared) => {
		const data = []
		const { commands } = msg.client
    
    var displayCommandList = {}
    var mapped = commands.map(command => `${shared.prefix}${command.name}\n`)
    var perms = {}
    perms.bot = commands.map(command => !(command.botStaffOnly && !shared.permissions.bot))
    perms.guild = commands.map(command => !(command.guildPerms && !msg.member.hasPermission(command.guildPerms) == undefined ? false : command.guildPerms && !msg.member.hasPermission(command.guildPerms)))
    var cmdCats = commands.map(command => command.category)
    for (var i = 0; i < mapped.length; i++) {
      if (perms.bot[i] && perms.guild[i]) {
        if (!displayCommandList[cmdCats[i]]) displayCommandList[cmdCats[i]] = []
        displayCommandList[cmdCats[i]].push(mapped[i])
      }
    }

		if (args.length == 0) {
      for (var i in displayCommandList) {
        let embed = new Discord.RichEmbed() 
          .setTitle(`${client.user.username} | ${i} Commands`)
          .setColor(0xe86ae8)
          .setThumbnail(client.user.avatarURL)
          .setDescription(displayCommandList[i].join('') + "\nDo `help [command]` to get information about specific commands!")
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

			var embed = new Discord.RichEmbed().setColor(0xe86ae8).setAuthor(`${shared.prefix}${command.name}`, client.user.avatarURL)

			if (command.aliases) embed.addField(`Aliases`, command.aliases.join(', '))
			if (command.description) embed.addField(`Description`, command.description)
			if (command.usage) embed.addField(`Usage`,`\`${command.usage}\``)

			msg.channel.send(embed).then(msg.delete())
		}
  }
}