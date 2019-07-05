const Discord = require('discord.js')
const db = require('quick.db')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

module.exports = {
	name: "eval",
	usage: "eval <code>",
	description: "Evaluate JavaScript code!",
  category: "Bot Staff",
  botStaffOnly: true,
	run: async (bot, message, args, shared) => {
    const msg = message, client = bot

		try {
			var out = eval(args.join(' '))
			// out = JSON.stringify(out)
      
      var embed = new Discord.RichEmbed()
        .setColor("GREEN")
        .setTitle(`<:green_tick:588269976658378768> Evaluation Success!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Result`, '```js\n'+out+'```')
        .setFooter(bot.user.username, bot.user.avatarURL)
			message.channel.send(embed)
        .catch(console.error)
		} catch (e) {
      var embed = new Discord.RichEmbed()
        .setColor("RED")
        .setTitle(`<:red_tick:588269975798808588> Evaluation Failed!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Error Message`, '```js\n'+e+'```')
        .setFooter(bot.user.username, bot.user.avatarURL)
			message.channel.send(embed)
        .catch(console.error)
		}
    
	}
}