module.exports = {
  "Aura Seer": {
    desc: "Each night the Aura Seer can select one player (`w!check [number]`). They can see whether this player is good, evil or unknown." +
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village"
  },
  "Medium": {
    desc: "During the night, the Medium can talk (anonymously) with dead players." +
          " Once per game, they can revive a dead player (`w!revive [number]`).",
    aura: "Unknown",
    team: "Village"
  },
  "Jailer": {
    desc: "The jailer can select one player to jail each day (`w!jail [number]`). That night, the jailer can talk to their prisoner privately." +
          " During this time, that jailed player cannot use their abilities." +
          " Once every game, they can execute their prisoner (`w!shoot`).",
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
    desc: "Each night, the Seer can see the role of one player (`w!check [number]`).",
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
  },
  "Bodyguard": {
    desc: "Each night the Bodyguard can select one player to protect (`w!protect [number]`). They also automatically protect themselves." +
          " If the Bodyguard or the player they are protecting gets attacked, they will survive." +
          " However, if they are attacked again the bodyguard will die.",
    aura: "Good",
    team: "Village"
  },
  "Gunner": {
    desc: "The Gunner has no special abilities during the night. During the day, the Gunner has two bullets that it can use (`w!shoot [number]`)." +
          " After they use the first bullet, the shot is so loud that everyone knows who the Gunner is." +
          " The bullets will kill a player no matter what protection they have. They can only use one bullet per day.",
    aura: "Unknown",
    team: "Village"
  },
  "Wolf Shaman": {
    desc: "Each night the Wolf Shaman can vote on a player to kill and talk with the other Werewolves." +
          " During the day, the Shaman can put an Enchantment on another player." +
          " This will make that player appear as a Shaman Werewolf to the Seer, Aura Seer or Detective.",
    aura: "Evil",
    team: "Werewolves"
  },
  "Serial Killer": {
    desc: "Each night the Serial Killer can kill one player. They cannot be killed by the Werewolves." +
          " However, they are in competition with the werewolves, as both win if they kill enough people.",
    aura: "Unknown",
    team: "Solo"
  },
  "Cursed": {
    desc: "The Cursed begins the game on the village team. It is loyal to the village." +
          " If the cursed is attacked by the werewolves, it does not die. Instead, it becomes a regular Werewolf." +
          " If he is not bitten, the seer sees him as Cursed and the Aura Seer sees him as good." +
          " If he gets bitten by the werewolves, the seer sees him as a werewolf." +
          " The cursed can also be protected from the bite. Doctor, Bodyguard, Beast Hunter and Jailer can protect him at night.",
    aura: "Good",
    team: "Village"
  }
}
// ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
                // "Bodyguard", "Gunner", "Shaman Werewolf", "Serial Killer", "Cursed", "Priest", "Wolf Seer", "Aura Seer"]