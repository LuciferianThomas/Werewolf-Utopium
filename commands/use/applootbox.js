const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      wrg = require('weighted-random')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js"),
      shop = require("/home/sd/wwou/util/shop")

let numArray = (start, int, cnt) => {
  let arr = [start]
  for (var i = 1; i < cnt; i++)
    arr.push(start + int * i)
  return arr
}

module.exports = {
  name: "apprentice lootbox",
  aliases: ["alb","app lootbox","app lb","applb"],
  run: async (client, message, args, shared) => {
    let am = parseInt(args[0], 10)
    if (!isNaN(am)) args.pop()
    else am = 1
    let item = shop["apprentice lootbox"]
    let rb = players.get(message.author.id+".inventory."+item.itemid)
    if((rb || 0) < 1) return await message.channel.send(`You do not have any Apprentice Lootboxes.`)
    let player = players.get(message.author.id)
    players.subtract(message.author.id+".inventory.apprentice lootbox", 1)
    
    let items = [
      {
        weight: 7,
        item: "coin",
        possibleValues: numArray(15, 15, 15)
      },
      {
        weight: 5,
        item: "rose",
        possibleValues: numArray(5, 1, 20)
      },
      {
        weight: 3,
        item: "bouquet",
        possibleValues: numArray(1, 1, 3)
      },
      {
        weight: 2,
        item: "talisman",
        possibleValues: [3]
      },
    ]
    let bonusItem = items[wrg(items.map(x => x.weight))]
    let possibleValues = fn.deepClone(bonusItem.possibleValues)
    let bonusItemAmt = bonusItem.possibleValues[wrg(possibleValues.reverse().map(x => Math.pow(x,2)))]
    
    let embed = new Discord.MessageEmbed()
      .setTitle("Apprentice Lootbox")
      .setThumbnail(fn.getEmoji(client, "Apprentice Lootbox").url)
      .setFooter(`${nicknames.get(message.author.id)} has ${players.get(message.author.id+".inventory.apprentice lootbox")} apprentice lootboxes left.`)
    
    switch (bonusItem.item) {
      case "talisman":
        let roles = ["Mayor","Beast Hunter","Detective","Fortune Teller","Marksman","Red Lady","Sheriff","Witch","Avenger","Werewolf Berserk","Guardian Wolf","Junior Werewolf","Arsonist","Bomber","Zombie"]
        let selectedRole = roles[Math.floor(roles.length*Math.random())]
        let talisman = await fn.createTalisman(client, selectedRole)
        players.add(message.author.id+".inventory.talisman."+selectedRole, bonusItemAmt)
        embed
          .attachFiles([talisman])
          .setThumbnail(`attachment://${talisman.name}`)
          .setDescription(`${nicknames.get(message.author.id)} has received 3 ${selectedRole} Talismans from an apprentice lootbox.`)
        break;
      case "coin":
        players.add(message.author.id+".coins", bonusItemAmt)
        embed.setDescription(`${nicknames.get(message.author.id)} has received ${bonusItemAmt} ${fn.getEmoji(client, "Coin")} from an apprentice lootbox.`)
        break;
      case "rose":
        players.add(message.author.id+".inventory.rose", bonusItemAmt)
        embed.setDescription(`${nicknames.get(message.author.id)} has received ${bonusItemAmt} ${fn.getEmoji(client, "Rose")} from an apprentice lootbox.`)
        break;
      case "bouquet":
        players.add(message.author.id+".inventory.rose bouquet", bonusItemAmt)
        embed.setDescription(`${nicknames.get(message.author.id)} has received ${bonusItemAmt} ${fn.getEmoji(client, "Rose Bouquet")} from an apprentice lootbox.`)
        break;
    }
    
    await message.channel.send(embed)
    fn.addLog("items", `${message.author.tag} used ${am} ${item.name}(s) to ${nicknames.get(message.author.id)}, leaving them with a total of ${players.get(`${message.author.id}.inventory.${item.itemid}`)} ${item.name}(s). ${embed.description}`)
    message.author.send(fn.event())
  }
}