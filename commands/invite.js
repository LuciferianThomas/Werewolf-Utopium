const Discord = require('discord.js')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
	name: "invite",
	usage: "invite",
	description: "Invite me to your server!",
  category: "Utility",
	run: async (client, message, args, shared) => {
    let link = await client.generateInvite(config.permissions)
    
    return await message.channel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setTitle("**Invite me to your server!**")
        .setURL(link)
        .setFooter(client.user.username, client.user.avatarURL)
    )
	}
}