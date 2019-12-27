module.exports = {
  "Villager": {
    desc: "You have no special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["reg","vil","vill","forksman"]
  },
  "Aura Seer": {
    desc: "Each night you can select one player to see whether this player is good, evil or unknown (`w!check [player]`)." +
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The <:Wolf_Shaman:659722357711306753> Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"]
  },
  "Medium": {
    desc: "During the night, you can talk (anonymously) with dead players." +
          " Once per game, you can revive a dead player (`w!revive [player]`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["med"]
  },
  "Jailer": {
    desc: "You can select one player to jail each day (`w!jail [player]`). That night, you can talk to their prisoner privately." +
          " During this time, that jailed player cannot use their abilities." +
          " Once every game, you can execute your prisoner (`w!shoot`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"]
  },
  "Werewolf": {
    desc: "Each night, you can vote on a player to kill (`w!vote [player]`) and talk with the other werewolves.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"]
  },
  "Doctor": {
    desc: "Each night you can select one player to heal (`w!heal [player]`). If this player is attacked by the Werewolves, they don't die in that night." + // alias: w!protect
          " You can heal every night that they are alive. You cannot heal yourself.",
    aura: "Good",
    team: "Village",
    abbr: ["doc"]
  },
  "Alpha Werewolf": {
    desc: "You can vote on one player to kill each night (`w!vote [player]`) like a regular Werewolf." +
          " However, when you vote on a player to kill during the night, your vote counts double.",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha"]
  },
  "Seer": {
    desc: "Each night, you can see the role of one player (`w!check [player]`).",
    aura: "Good",
    team: "Village",
    abbr: []
  },
  "Fool": {
    desc: "You have no special abilities besides talking and voting during the day." +
          " You win the game if you are lynched by the village.",
    aura: "Unknown",
    team: "Solo",
    abbr: []
  },
  "Headhunter": {
    desc: "You have no special abilities. On the first night of the game, you receive a target on a random village role." +
          " If your target dies in a way other than being lynched, you become a regular villager.",
    aura: "Unknown",
    team: "Solo/Village",
    abbr: ["hh"]
  },
  "Bodyguard": {
    desc: "Each night, you can select one player to protect (`w!protect [player]`). You also automatically protect yourself." +
          " If you or the player they are protecting gets attacked, you will survive." +
          " However, if you are attacked again you will die.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"]
  },
  "Gunner": {
    desc: "You have no special abilities during the night. During the day, you have two bullets that it can use (`w!shoot [player]`)." +
          " After you use the first bullet, the shot is so loud that everyone knows who you are." +
          " The bullets will kill a player no matter what protection they have. You can only use one bullet per day.",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"]
  },
  "Wolf Shaman": {
    desc: "Each night, you can vote on a player to kill (`w!vote [player]`) and talk with the other werewolves." +
          " During the day, you can put an enchantment on another player (`w!enchant [player]`)." +
          " This will make that player appear as a Wolf Shaman to the <:Seer:658633721448235019> Seer, <:Aura_Seer:658632880490020874> Aura Seer or <:Detective:660070860832505863> Detective.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["sha","sham","shaman"]
  },
  "Serial Killer": {
    desc: "Each night the Serial Killer can kill one player (`w!stab [player]`). They cannot be killed by the werewolves." +
          " You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"]
  },
  "Cursed": {
    desc: "You begin the game on the village team. You are loyal to the village." +
          " If you are attacked by the werewolves, you do not die." +
          " Instead, you become a regular <:Werewolf:658633322439639050> Werewolf, and can vote to kill a player (`w!vote [player]`) and talk with the werewolves starting the following night." +
          " You can also be protected from the bite." +
          " <:Doctor:658633450353590295> Doctors, <:Bodyguard:659721472310509588> Bodyguards, <:Beast_Hunter:660071569980260352> Beast Hunters and <:Jailer:658633215824756748> Jailers can protect him at night.", 
    aura: "Good",
    team: "Village",
    abbr: []
  },
  "Priest": {
    desc: "Once per game, you can throw Holy Water at one player. You can only do this during the day." +
          " If the water is thrown at a werewolf, they will die (excluding Sorcerer). If that player is not a werewolf, the Priest dies.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"]
  },
  "Wolf Seer": {
    desc: "Each night, you can see the role of one player (`w!check [player]`)." +
          " You can talk with the other werewolves and provide any information you found." +
          " However, you cannot vote on a player to kill unless you resign your ability to see roles." +
          " If you are the last werewolf alive they instantly resign your seeing ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "wwseer"]
  }, 
  /*"Arsonist": {
  	desc: "Each night, you can douse 2 players with gasoline (`w!douse [player]`) or ignite doused players by doing (`w!ignite`)." + // alias: w!burn
          " You cannot be killed by the Werewolves." 
          " You Win if you are the last player alive.", 
    aura: "Unknown", 
    team: "Solo",
    abbr: ["ars", arso", "arson", "pyro"]
  }, 
  "Bomber": {
  	desc: "At night, place a bomb on 3 players vertically, horizontally or diagonally (`w!placebomb [player]`)." +
          " The following night, tbe bomb explodes, killing the selected players." +
          " You cannot be killed by the Werewolves." +
  				" You win if you are the last player alive.",
 		aura: "Unknown",
    team: "Solo",
    abbr: ["bb", "bomb"]
  }, 
  
  */
}