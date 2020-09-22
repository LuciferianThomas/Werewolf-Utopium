const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      tags = require('/home/utopium/wwou/util/tags.js')

module.exports = {
  name: "buy",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.inventory["custom maker"]) return await message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(`Hmm...`)
        .setDescription(
          `You do not have the Custom Maker item yet.`
        )
        .setFooter(`Head over to \`w!shop\` to buy it.`)
    )
    
    let targetRole = args.join(' ')
    let role = Object.values(roles).find(
      data =>
        data.name.toLowerCase().startsWith(targetRole.toLowerCase()) ||
         (data.abbr && data.abbr.includes(targetRole.toLowerCase()))
    )
    
    if (role) {
      if (player.custom.includes(role.name)) return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`You already own ${fn.getEmoji(client, role.name)} ${role.name}.`)
      )

      if (role.name.includes("Random") && player.custom.length < 21) return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`You need to purchase ${21-player.custom.length} more roles before claiming random roles.`)
      )

      let price = role.cgp
      let amt = parseInt(role.cgp)
      if (isNaN(amt) || (role.tag & (tags.ROLE.UNAVAILABLE | tags.ROLE.TO_BE_TESTED))) return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`This role is unavailable to be purchased.`)
      )
      let currency = role.cgp[role.cgp.length-1]
      currency = currency == "c" ? "coins" : "roses"
      if (player[currency] < amt) return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`Insufficient Balance`)
          .setDescription(
            `${amt} ${fn.getEmoji(client, currency.substring(0, 4))} are required to buy ${fn.getEmoji(client, role.name)} ${role.name}.\n` +
            `You currently have ${player[currency]} ${fn.getEmoji(client, currency.substring(0, 4))}.`
          )
      )

      player[currency] -= amt
      player.custom.push(role.name)
      players.set(message.author.id, player)

      await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("GREEN")
          .setTitle("Purchase Successful")
          .setDescription(
            `You can now create custom games with ${fn.getEmoji(client, role.name)} ${role.name}.\n` +
            `You now have ${player[currency]} ${fn.getEmoji(client, currency.substring(0, 4))}.`
          )
          .setThumbnail(fn.getEmoji(client, role.name).url)
      ).catch(()=>{})
    }
    else if (args.length && args[0].toLowerCase() == "gamecode") {
      if (player.roses < 50) return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`Insufficient Balance`)
          .setDescription(
            `${50} ${fn.getEmoji(client, "Rose")} are required to buy Custom Game Code Creation Access.\n` +
            `You currently have ${player.roses} ${fn.getEmoji(client, "Rose")}.`
          )
      )

      player.roses -= 50
      player.custom.push("CGCCAI")
      players.set(message.author.id, player)

      await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("GREEN")
          .setTitle("Purchase Successful")
          .setDescription(
            `You can now create your own game code for custom games.\n` +
            `You now have ${player.roses} ${fn.getEmoji(client, "Rose")}.`
          )
      )
    }
    else return await message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Invalid input")
        .setDescription("The first argument should be either `gamecode` or a role!")
    )
  }
}