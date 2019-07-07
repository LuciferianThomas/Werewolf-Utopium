const Discord = require('discord.js')
const db = require('quick.db')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = {
	name: "eval",
	usage: "eval <code>",
	description: "Evaluate JavaScript code!",
  category: "Bot Staff",
  botStaffOnly: true,
	run: async (client, message, args, shared) => {
    const msg = message, bot = client

		try {
			var out = eval(args.join(' '))
			out = JSON.stringify(out)
      
      var embed = new Discord.RichEmbed()
        .setColor("GREEN")
        .setTitle(`${client.guilds.get(config.support).emojis.find(emoji => emoji.name == 'green_tick')} Evaluation Success!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Result`, '```js\n'+out+'```')
        .setFooter(client.user.username, client.user.avatarURL)
			message.channel.send(embed)
        .catch(console.error)
		} catch (e) {
      var embed = new Discord.RichEmbed()
        .setColor("RED")
        .setTitle(`${client.guilds.get(config.support).emojis.find(emoji => emoji.name == 'red_tick')} Evaluation Failed!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Error Message`, '```js\n'+e+'```')
        .setFooter(client.user.username, client.user.avatarURL)
			message.channel.send(embed)
        .catch(console.error)
		}
    
	}
}