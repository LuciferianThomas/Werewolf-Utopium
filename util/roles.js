module.exports = {
  "Villager": {
    desc: "You are a regular Villager with no special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["reg","vil","vill","forkman"]
  },
  "Aura Seer": {
    desc: "You are the Aura Seer." +
    			" Each night you can select one player to see whether this player is good, evil or unknown (`w!check [player]`)." +
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The <:Wolf_Shaman:659722357711306753> Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"]
  },
  "Medium": {
    desc: "You are the Medium." +
    			" During the night, you can talk (anonymously) with the dead players." +
          " Once per game, you can revive a dead player (`w!revive [player]`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["med"]
  },
  "Jailer": {
    desc: "You are the Jailer." +
    			"Every day, select one player to jail by doing (`w!jail [number]`). Your target will be jailed the following night and cannot use its abilitids." +
    			"If you find your target suspicious, you can kill it by doing (`w!jailkill [player]`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"]
  },
  "Werewolf": {
    desc: "You are a regular Werewolf with no special abilities. Do (`w!vote [player]`) to vote with your werewolf teammates.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"]
  },
  "Doctor": {
    desc: "You are the Doctor." + 
          "Every night, select a player to save with (`w!heal [player]`)." + // alias: w!protect
          " You will be notified when your protected player was attaked. You cannot protect yourself.",
    aura: "Good",
    team: "Village",
    abbr: ["doc"]
  },
  "Alpha Werewolf": {
    desc: "You are a regular Werewolf except when you vote with the werewolves by doing (`w!vote [player]`), your vote counts as double!",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha"]
  },
  "Seer": {
    desc: "Each night, you uncover the role of one player with (`w!check [player]`).",
    aura: "Good",
    team: "Village",
    abbr: []
  },
  "Fool": {
    desc: "Your only goal is to get lynched by the village.",
    aura: "Unknown",
    team: "Solo",
    abbr: []
  },
  "Headhunter": {
    desc: "Your only goal is to get your target lynched by the village." +
          " If your target dies in a way other than being lynched, you become a regular villager.",
    aura: "Unknown",
    team: "Solo/Village",
    abbr: ["hh", "hunter"]
  },
  "Bodyguard": {
    desc: "Each night, you can select one player to protect (`w!protect [player]`). You automatically protect yourself." +
          " If you or the player you are protecting gets attacked, you will survive." +
          " However, if you are attacked again you will die.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"]
  },
  "Gunner": {
    desc: "During the day, you have 2 bullets which you can use them to shoot players by doing (`w!shoot [player]`)." +
          " However, the shots are loud, so your role will be revealed after the first shot. ",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"]
  },
  "Wolf Shaman": {
    desc: "Each night, you can vote on a player to kill (`w!vote [player]`) and talk with the other werewolves." +
          " During the day, you can put an enchantment on another player (`w!enchant [player]`)." +
          " This will make that player appear as a Wolf Shaman to the <:Seer:658633721448235019> Seer, Evil to the <:Aura_Seer:658632880490020874> Aura Seer and on the werewolves team for <:Detective:660070860832505863> Detective.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww sham","sham","shaman"]
  },
  "Serial Killer": {
    desc: "Each night, stab one player with (`w!stab [player]`). You cannot be killed by the werewolves", 
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"]
  },
  "Cursed": {
    desc: "You are a regular villager until the werewolves kill you at which point, you become a werewolf." +
          " <:Doctor:658633450353590295> Doctors, <:Bodyguard:659721472310509588> Bodyguards, <:Beast_Hunter:660071569980260352> Beast Hunters and <:Jailer:658633215824756748> Jailer can protect him at night.", 
    aura: "Good",
    team: "Village",
    abbr: ["lycan"]
  },
  "Priest": {
    desc: "Once per game, you can throw Holy Water at one player. You can only do this during the day." +
          " If the water is thrown at a werewolf, they will die (excluding Sorcerer). If that player is not a werewolf, the Priest dies.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"]
  },
  "Wolf Seer": {
    desc: "Each night, you can uncover the role of one player (`w!check [player]`)." +
          " You can talk with the other werewolves and provide any information you found." +
          " However, you cannot vote on a player to kill unless you resign your ability to see roles." +
          " If you are the last werewolf alive you instantly resign your seeing ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "wwseer", "ww seer"]
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
  "Corruptor": {
  	desc: "Every night, select a player 'glitch' by doing (`w!glitch [player]`)." +
    			" That player won't be able to speak or vote the next day and will die at the end of the day." +
  				" The role of the player won't be revealed. You cannot be killed by the Werewolves.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["corr"] 
  },
  "Cannibal": {
  	desc: "Every night, you can kill a player or save up your hunger to kill more the next night." +
    			" You can only stack up to 5 kills. 
  */
}