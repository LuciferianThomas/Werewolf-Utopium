module.exports = {
  "Aura Seer": {
    desc: "Each night the Aura Seer can select one player with `w!check [number]`. They can see whether this player is good, evil or unknown." +
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village"
  },
  "Medium": {
    desc: "During the night, the Medium can talk (anonymously) with dead players." +
          " Once per game, they can revive a dead player with `w!revive [number]`.",
    aura: "Unknown",
    team: "Village"
  },
  "Jailer": {
    desc: "The jailer can select one player to jail each day with `w!jail [number]`. That night, the jailer can talk to their prisoner privately." +
          " During this time, that jailed player cannot use their abilities." +
          " Once every game, they can execute their prisoner with `w!shoot`.",
    aura: "Unknown",
    team: "Village"
  },
  "Werewolf": {
    desc: "Each night the Werewolf can vote on a player to kill with `w!vote [number]` and talk with the other Werewolves.",
    aura: "Evil",
    team: "Werewolves"
  },
  "Doctor": {
    desc: "Each night the Doctor can select one player to heal. If this player is attacked by the Werewolves, they don't die in that night." +
          " The Doctor can heal every night that they are alive. The Doctor cannot heal themselves.",
    aura: "Good",
    team: "Village"
  },
  "Alpha Werewolf": {
    desc: "The Alpha Werewolf has the same abilities as a regular Werewolf and can vote on one player to kill each night with `w!vote [number]`." +
          " However, when the Alpha Werewolf votes on a player to kill during the night, his vote counts twice.",
    aura: "Unknown",
    team: "Werewolves",
  },
  "Seer": {
    desc: "Each night, the Seer can see the role of one player.",
    aura: "Good",
    team: "Village"
  },
  "Fool": {
    desc: "The Fool has no special abilities besides talking and voting during the day." +
          "The Fool wins the game if they are lynched by the village.",
    aura: "Unknown",
    team: "Solo"
  },
  "Headhunter": {
    desc: "The Headhunter has no special abilities. On the first night of the game they receive a target on a random village roles." +
          " If their target dies in a way other than being lynched, they become a regular villager.",
    aura: "Unknown",
    team: "Solo/Village"
  }
}
// ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
                // "Bodyguard", "Gunner", "Shaman Werewolf", "Serial Killer", "Cursed", "Priest", "Wolf Seer", "Aura Seer"]