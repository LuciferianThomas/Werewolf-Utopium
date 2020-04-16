const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn")


module.exports = {
	name: "seval",
	usage: "seval <code>",
	description: "Evaluate JavaScript code!",
 // category: "Bot Staff",
 // botStaffOnly: true,
	run: async (client, message, args, shared) => {
    if (!["336389636878368770","658481926213992498","439223656200273932"].includes(message.author.id)) return;
    
    const msg = message, bot = client
    
    let modifier = "-e"
    
    if (args[args.length-1] == "-t" || args[args.length-1] == "-l" || args[args.length-1] == "-e") {
      modifier = args.pop()
    }

		try {
			var out = eval(args.join(' '))
			out = JSON.stringify(out)
      if (out === undefined) out = "undefined"
      var input = args.join(' ').substring(0, 1024)
      
      if (modifier == "-e" && out.length <= 1024-8) message.channel.send(
        new Discord.MessageEmbed()
          .setColor("GREEN")
          .setTitle(`${fn.getEmoji(client, 'green_tick')} Evaluation Success!`)
          .addField(`Expression`, '```js\n'+args.join(" ")+'```')
          .addField(`Result`, '```js\n'+out+'```')
          .setFooter(client.user.username+" Staff", client.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }))
      ).catch(console.error)
      else if (out.length <= 2000-8 && (modifier == "-t" || (modifier == "-e" && out.length > 1024-8))) message.channel.send('```js\n'+out+'```')
      else if (modifier = "-l") console.log(`${fn.time()} | Evaluation Result | ${out}`)
      else {
        console.log(`${fn.time()} | Evaluation Result | ${out}`)
        message.channel.send(
          new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle(`${fn.getEmoji(client, 'green_tick')} Evaluation Success!`)
            .addField(`Expression`, '```js\n'+args.join(" ")+'```')
            .addField(`Result`, '```js\nOutput too long. Check console log.```')
            .setFooter(client.user.username+" Staff", client.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }))
        ).catch(console.error)
      }
		} catch (e) {
      // console.log(e.stack)
      var embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(`${fn.getEmoji(client, "red_tick")} Evaluation Failed!`)
        .addField(`Expression`, "```js\n" + args.join(" ") + "```")
        .addField(
          `Error Message`,
          "```js\n" +
            e.stack.replace(
              /(?:(?!\n.*?\(\/app.*?)\n.*?\(\/.*?\))+/g,
              "\n\t..."
            ) +
            "```"
          
        )
        .setFooter(
          client.user.username+" Staff",
          client.user.avatarURL({ format: "png", dynamic: true, size: 1024 })
        )
      message.channel.send(embed).catch(console.error)
		}
    
	}
}

