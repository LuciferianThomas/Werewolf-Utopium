const Discord = require('discord.js')

module.exports = {
	name: "eval",
	usage: "eval <code>",
	description: "Evaluate JavaScript code!",
  // requirements: "**Bot Administrator**",
	run: async (bot, message, args, shared) => {
    const msg = message, client = bot
    
    if (message.author.id != "336389636878368770" && message.author.id != "344335337889464357") return;

		try {
			var out = eval(args.join(' '))
			// out = JSON.stringify(out)
      
      var embed = new Discord.RichEmbed()
        .setColor("GREEN")
        .setTitle(`<:green_tick:588269976658378768> Evaluation Success!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Result`, '```js\n'+out+'```')
        .setFooter("Project Unity", bot.user.avatarURL)
			message.channel.send(embed)
        .then(message.delete().catch(console.error))
        .catch(console.error)
		} catch (e) {
      var embed = new Discord.RichEmbed()
        .setColor("RED")
        .setTitle(`<:red_tick:588269975798808588> Evaluation Failed!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Error Message`, '```js\n'+e+'```')
        .setFooter("Project Unity", bot.user.avatarURL)
			message.channel.send(embed)
        .then(message.delete().catch(console.error))
        .catch(console.error)
		}
    
	}
}