module.exports = {
  "Villager": {
    desc: "The Villager has no special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["vil","vill","forksman"]
  },
  "Aura Seer": {
    desc: "Each night the Aura Seer can select one player (`w!check [number]`). They can see whether this player is good, evil or unknown." +
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"]
  },
  "Medium": {
    desc: "During the night, the Medium can talk (anonymously) with dead players." +
          " Once per game, they can revive a dead player (`w!revive [number]`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["med"]
  },
  "Jailer": {
    desc: "The jailer can select one player to jail each day (`w!jail [number]`). That night, the jailer can talk to their prisoner privately." +
          " During this time, that jailed player cannot use their abilities." +
          " Once every game, they can execute their prisoner (`w!shoot`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"]
  },
  "Werewolf": {
    desc: "Each night the Werewolf can vote on a player to kill (`w!vote [number]`) and talk with the other Werewolves.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"]
  },
  "Doctor": {
    desc: "Each night the Doctor can select one player to heal (`w!heal [number]`). If this player is attacked by the Werewolves, they don't die in that night." + // alias: w!protect
          " The Doctor can heal every night that they are alive. The Doctor cannot heal themselves.",
    aura: "Good",
    team: "Village",
    abbr: ["doc"]
  },
  "Alpha Werewolf": {
    desc: "The Alpha Werewolf has the same abilities as a regular Werewolf and can vote on one player to kill each night (`w!vote [number]`)." +
          " However, when the Alpha Werewolf votes on a player to kill during the night, his vote counts twice.",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha"]
  },
  "Seer": {
    desc: "Each night, the Seer can see the role of one player (`w!check [number]`).",
    aura: "Good",
    team: "Village",
    abbr: []
  },
  "Fool": {
    desc: "The Fool has no special abilities besides talking and voting during the day." +
          "The Fool wins the game if they are lynched by the village.",
    aura: "Unknown",
    team: "Solo",
    abbr: []
  },
  "Headhunter": {
    desc: "The Headhunter has no special abilities. On the first night of the game they receive a target on a random village roles." +
          " If their target dies in a way other than being lynched, they become a regular villager.",
    aura: "Unknown",
    team: "Solo/Village",
    abbr: ["hh"]
  },
  "Bodyguard": {
    desc: "Each night the Bodyguard can select one player to protect (`w!protect [number]`). They also automatically protect themselves." +
          " If the Bodyguard or the player they are protecting gets attacked, they will survive." +
          " However, if they are attacked again the bodyguard will die.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"]
  },
  "Gunner": {
    desc: "The Gunner has no special abilities during the night. During the day, the Gunner has two bullets that it can use (`w!shoot [number]`)." +
          " After they use the first bullet, the shot is so loud that everyone knows who the Gunner is." +
          " The bullets will kill a player no matter what protection they have. They can only use one bullet per day.",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"]
  },
  "Wolf Shaman": {
    desc: "Each night the Wolf Shaman can vote on a player to kill (`w!vote [player]`) and talk with the other Werewolves." +
          " During the day, the Shaman can put an Enchantment on another player." +
          " This will make that player appear as a Wolf Shaman to the Seer, Aura Seer or Detective.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["sha","sham","shaman"]
  },
  "Serial Killer": {
    desc: "Each night the Serial Killer can kill one player. They can kill a player by doing `w!stab [player]`. They cannot be killed by the Werewolves." +
          " However, they are in competition with the werewolves, as both win if they kill enough people.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"]
  },
  "Cursed": {
    desc: "The Cursed begins the game on the village team. It is loyal to the village." +
          " If the cursed is attacked by the werewolves, it does not die. Instead, it becomes a regular Werewolf." +
          " If he is not bitten, the seer sees him as Cursed and the Aura Seer sees him as good." +
          " If he gets bitten by the werewolves, the seer sees him as a werewolf." +
          " The cursed can also be protected from the bite. Doctor, Bodyguard, Beast Hunter and Jailer can protect him at night." +
    			" If you are biiten, you can vote with the werewolves (`w!vote [player]`).", 
    aura: "Good",
    team: "Village",
    abbr: []
  },
  "Priest": {
    desc: "Once per game, the Priest can throw Holy Water at one player. The Priest can only do this during the day." +
          " If the water is thrown at a werewolf, they will die (excluding Sorcerer). If that player is not a Werewolf, the Priest dies.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"]
  },
  "Wolf Seer": {
    desc: "Each night the Wolf Seer can see the role of one player (`w!check [number]`)." +
          " They can talk with the other Werewolves and provide any information they found." +
          " However, the Wolf Seer cannot vote on a player to kill unless they resign their ability to see roles." +
          " If they are the last werewolf alive they instantly resign their seeing ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "ww seer", "wwseer"]
  }, 
  /*"Arsonist": {
  	desc: "You are the Arsonist." +
    			" Each night, you can douse 2 players with gasoline (`w!douse [player]`) or ignite doused players by doing (`w!burn`)." + // alias: w!ignite
          " You cannot be killed by the Werewolves. \nYou win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["ars", arso", "arson", "pyro"]
  }, 
  "Bomber": {
  	desc: "You are the Bomber." +
    			" At night, place a bomb on 3 players vertically, horizontally or diagonally (`w!placebomb`)." +
          " The following night, tbe bomb explodes, killing the selected players." +
          "", 
  
  
  
  */
}