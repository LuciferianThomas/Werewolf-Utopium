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

let streak = 0

let rollBonus = (streak) => {
  let items = [
    {
      weight:
        100 + streak,
      item: "coin",
      amount: Math.ceil(Math.pow(5 * streak, 0.725) / 5) * 5
    },
    {
      weight:
        Math.ceil(Math.pow(5 * streak, 0.725) / 3) == 0
          ? 0
          : 50 + streak,
      item: "rose",
      amount:
        Math.min(Math.ceil((Math.pow(5 * streak, 0.725) / 3) / 5) * 5, 50)
    },
    {
      weight:
        Math.round(Math.pow(5 * streak, 0.725) / 25) == 0
          ? 0
          : 25 + streak,
      item: "lootbox",
      amount: Math.min(
        Math.round(Math.pow(5 * streak, 0.725) / 25),
        5
      )
    },
    {
      weight:
        Math.round(Math.pow(5 * streak, 0.725) / 50) == 0
          ? 0
          : 15 + streak,
      item: "apprentice lootbox",
      amount: Math.min(
        Math.round(Math.pow(5 * streak, 0.725) / 50),
        5
      )
    },
    {
      weight: streak < 15 ? 0 : 10 + streak,
      item: "talisman",
      amount: 3
    },
    // {
    //   weight:
    //     Math.round(Math.pow(5 * streak, 0.725) / 100) == 0
    //       ? 0
    //       : 5 + streak,
    //   item: "gem",
    //   amount: Math.min(
    //     Math.round(Math.pow(5 * streak, 7 / 10) / 100),
    //     5
    //   )
    // },
    {
      weight: streak < 60 ? 0 : streak,
      item: "master lootbox",
      amount: 2
    }
  ]
  
  let bonusItem = items[wrg(items.map(x => x.weight))]
  
  return bonusItem
}

module.exports = {
  name: "daily",
  run: async (client, message, args) => {
    let player = players.get(message.author.id)
    if (!player.lastDaily) player.lastDaily = 0
    
    let guild = client.guilds.cache.get("522638136635817986")
    let booster = false
    if (
      fn.getMember(guild, message.author.id) &&
      fn.getRole(guild, "Server Booster") &&
      fn.getMember(guild, message.author.id)
        .roles.cache.has(fn.getRole(guild, "Server Booster").id)
    )
      booster = true
        
    if (moment(player.lastDaily).add(20, "h") >= moment()) {
      let diff = moment(player.lastDaily)
        .add(20, "h")
        .diff(moment(), "seconds")
      let diffclaim = moment()
        .diff(moment(player.lastDaily), "seconds")
      let rdmmsgs = [
        `you cannot collect daily rewards for another **${Math.floor(
          diff / 60 / 60
        ) % 24}h ${Math.floor(diff / 60) % 60}m ${diff % 60}s**.`,
        `hmm... You need to wait for another **${Math.floor(diff / 60 / 60) %
          24}h ${Math.floor(diff / 60) % 60}m ${diff %
          60}s** to claim your next daily reward!`
      ]
      return await message.reply(
        Math.floor(diffclaim / 60 / 60) % 24 < 12
          ? `how is it "daily" if you claim it **${Math.floor(
              diffclaim / 60 / 60
            ) % 24}h ${Math.floor(diffclaim / 60) % 60}m ${diffclaim %
              60}s** after you last claimed?`
          : rdmmsgs[Math.floor(rdmmsgs.length * Math.random())]
      )
    }
    
    let consumedSPs = 0
    if (moment(player.lastDaily || 0).add(48, "h") <= moment()) {
      if (((player.inventory || {})["streak preserver"] || 0) >= Math.ceil((moment().diff(moment(player.lastDaily || 0), 'hours') - 48)/24)) {
        consumedSPs = Math.ceil((moment().diff(moment(player.lastDaily || 0), 'hours') - 48)/24)
        player.inventory["streak preserver"] -= consumedSPs
      }
      else player.streak = 0
    }
      
    
    let bonusItem = rollBonus(
      Math.round(
        player.streak *
          (booster
            ? player.streak > 60
              ? 1.1
              : player.streak > 30
              ? 1.175
              : 1.25
            : 1)
      )
    )
    
    // console.log(bonusItem.item, bonusItem.amount)
    
    let embed = new Discord.MessageEmbed()
      .setTitle(`Daily Rewards for ${nicknames.get(message.author.id)}`)
      .setThumbnail(fn.getEmoji(client, "Daily").url)
      .setDescription(`You received 10 ${fn.getEmoji(client, "Coin")}.\n`)
      .setFooter("Remember to come back and claim your daily reward tomorrow for streak bonus!")
    
    players.add(`${message.author.id}.coins`, 10)
    
    player.streak++
    if (player.streak > 1) {
      if (["coin","gem"].includes(bonusItem.item)) {
        players.set(`${message.author.id}.${bonusItem.item}s`, (players.get(`${message.author.id}.${bonusItem.item}s`) || 0) + bonusItem.amount)
        embed.description +=
          (`**${player.streak}-day streak** | ${bonusItem.amount} ${fn.getEmoji(client, bonusItem.item)}\n` +
          `You now have ${players.get(`${message.author.id}.coins`)} ${fn.getEmoji(client, "Coin")}${bonusItem.item == "gem" ? ` and ${
          players.get(`${message.author.id}.${bonusItem.item}`)} ${fn.getEmoji(client, bonusItem.item)}` : ""}.`)
      }
      else if (bonusItem.item == "talisman") {
        let roles = ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", "Bodyguard", "Gunner", "Wolf Shaman", "Aura Seer", "Cursed", "Wolf Seer", "Priest"]
        let selectedRole = roles[Math.floor(roles.length*Math.random())]
        players.set(
          message.author.id + ".inventory.talisman." + selectedRole,
          (players.get(
            message.author.id + ".inventory.talisman." + selectedRole
          ) || 0) + 3
        )
        embed.description +=
          (`**${player.streak}-day streak** | 3 ${fn.getEmoji(client, selectedRole)}${fn.getEmoji(client, "Talisman")}\n` +
          `You now have ${players.get(`${message.author.id}.coins`)} ${fn.getEmoji(client, "Coin")} and ${
          players.get(`${message.author.id}.inventory.talisman.${selectedRole}`)} ${fn.getEmoji(client, selectedRole)}${
          fn.getEmoji(client, bonusItem.item)}.`)
      }
      else {
        players.set(
          `${message.author.id}.inventory.${bonusItem.item}`,
          (players.get(`${message.author.id}.inventory.${bonusItem.item}`) || 0) +
            bonusItem.amount
        )
        embed.description +=
          (`**${player.streak}-day streak** | ${bonusItem.amount} ${fn.getEmoji(client, bonusItem.item)}\n` +
          `You now have ${players.get(`${message.author.id}.coins`)} ${fn.getEmoji(client, "Coin")} and ${
          players.get(`${message.author.id}.inventory.${bonusItem.item}`)} ${fn.getEmoji(client, bonusItem.item)}.`)
      }
    }
    else {
      embed.description += `You now have ${players.get(`${message.author.id}.coins`)} ${fn.getEmoji(client, "Coin")}.`
    }
    
    if (consumedSPs) embed.description += `\n\n${consumedSPs} Streak Preservers are consumed to save your streak!`
    
    players.set(`${message.author.id}.lastDaily`, moment())
    players.set(`${message.author.id}.streak`, player.streak)
    
    message.channel.send(embed)
    message.author.send(fn.event())
  }
}