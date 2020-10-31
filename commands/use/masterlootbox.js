const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      wrg = require('weighted-random')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      shop = require("/home/utopium/wwou/util/shop")

let numArray = (start, int, cnt) => {
  let arr = [start]
  for (var i = 1; i < cnt; i++)
    arr.push(start + int * i)
  return arr
}

module.exports = {
  name: "master lootbox",
  aliases: ["mlb","master lb","masterlb"],
  run: async (client, message, args, shared) => {
    let am = parseInt(args[0], 10)
    if (!isNaN(am)) args.pop()
    else am = 1
    let item = shop["master lootbox"]
    let rb = players.get(message.author.id+".inventory."+item.itemid)
    if((rb || 0) < 1) return await message.channel.send(`You do not have any Master Lootboxes.`)
    let player = players.get(message.author.id)
    players.subtract(message.author.id+".inventory.master lootbox", 1)
    
    let items = [
      {
        weight: 10,
        item: "coin",
        possibleValues: numArray(10, 10, 15)
      },
      {
        weight: 5,
        item: "rose",
        possibleValues: numArray(3, 1, 12)
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
      .setTitle("Master Lootbox")
    .setThumbnail(fn.getEmoji(client, "Master Lootbox").url)
    .setFooter(`${nicknames.get(message.author.id)} has ${players.get(message.author.id+".inventory.master lootbox")} master lootboxes left.`)
    
    switch (bonusItem.item) {
      case "talisman":
        let roles = ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", "Bodyguard", "Gunner", "Wolf Shaman", "Aura Seer", "Cursed", "Wolf Seer", "Priest"]
        let selectedRole = roles[Math.floor(roles.length*Math.random())]
        let talisman = await fn.createTalisman(client, selectedRole)
        players.add(message.author.id+".inventory.talisman."+selectedRole, bonusItemAmt)
        embed
          .attachFiles([talisman])
          .setThumbnail(`attachment://${talisman.name}`)
          .setDescription(`${nicknames.get(message.author.id)} has received a ${selectedRole} Talisman from a master lootbox.`)
        break;
      case "coin":
        players.add(message.author.id+".coins", bonusItemAmt)
        embed.setDescription(`${nicknames.get(message.author.id)} has received ${bonusItemAmt} ${fn.getEmoji(client, "Coin")} from a master lootbox.`)
        break;
      case "rose":
        players.add(message.author.id+".inventory.rose", bonusItemAmt)
        embed.setDescription(`${nicknames.get(message.author.id)} has received ${bonusItemAmt} ${fn.getEmoji(client, "Rose")} from a master lootbox.`)
        break;
      case "bouquet":
        players.add(message.author.id+".inventory.rose bouquet", bonusItemAmt)
        embed.setDescription(`${nicknames.get(message.author.id)} has received ${bonusItemAmt} ${fn.getEmoji(client, "Rose Bouquet")} from a master lootbox.`)
        break;
    }
    
    await message.channel.send(embed)
    fn.addLog("items", `${message.author.tag} used ${am} ${item.name}(s) to ${nicknames.get(message.author.id)}, leaving them with a total of ${players.get(`${message.author.id}.inventory.${item.itemid}`)} ${item.name}(s). ${embed.description}`)
    
  }
}