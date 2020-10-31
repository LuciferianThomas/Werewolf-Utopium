const Discord = require("discord.js"),
	db = require("quick.db")

const players = new db.table("Players"),
	nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require("/home/utopium/wwou/util/fn.js")

module.exports = {
	name: "whois",
	aliases: [],
	run: async (client, message, args) => {
		// if (
		// 	!client.guilds.cache
		// 		.get("522638136635817986")
		// 		.members.cache.get(message.author.id)
		// 		.roles.cache.find((r) =>
		// 			[
		// 				"*",
		// 				"βTester Helper",
		// 				"Mini Moderator",
		// 				"Moderator",
		// 				"Helper",
		// 				"Bot Helper",
		// 				"Developer",
		// 				"Staff",
		// 			].includes(r.name)
		// 		)
		// )
		// 	return
		let target
		if (!args[0]) target = message.author
		else if (message.mentions.users.size)
			target = message.mentions.users.first()
		if (!target && args[0])
			target = fn.getUser(
				client,
				nicknames
					.all()
					.find(
						(x) =>
							JSON.parse(x.data).toLowerCase() ==
							args[0].toLowerCase().replace(/_/g, "\\_")
					)
					? nicknames
							.all()
							.find(
								(x) =>
									JSON.parse(x.data).toLowerCase() ==
									args[0].toLowerCase().replace(/_/g, "\\_")
							).ID
					: args[0]
			)
		if (args[0] && !target)
			return await message.channel.send(
				`${fn.getEmoji(client, "red_tick")} User \`${args[0]}\` not found.`
			)
		if (!target)
			return await message.channel.send(
				`${fn.getEmoji(client, "red_tick")} Target not found.`
			)

		let nick = `${nicknames.get(target.id)}`
		if (!nick)
			return await message.channel.send(
				`${fn.getEmoji(client, "red_tick")} Target not found.`
			)
		let user = client.users.cache.get(target.id)

		return await message.channel.send(
			new Discord.MessageEmbed()
				.setColor(0x7289da)
				.setTitle(`${user.tag}`)
				.setThumbnail(user.avatarURL())
				.addField("Werewolf Utopium Nickname:", nick)
				.addField("Discord ID:", user.id)
				.setFooter(`Requested by ${message.author.tag}`)
		)
	},
}
