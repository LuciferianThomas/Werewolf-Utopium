module.exports = {
  
  // Villager roles
  
  "Villager": {
    desc: "You are a regular Villager with no special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["reg","vil","vill","forkman"]
  },
  "Aura Seer": {
    desc: "Each night you can select one player to see whether this player is good, evil or unknown (`w!check [player]`)." + // alias: w!see
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The <:Wolf_Shaman:659722357711306753> Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"]
  }, 
  /* "Avenger": {
    desc: "You can select a player to be killed when you die (`w!tag [player]`).",
    aura: "Good",
    team: "Village",
    abbr: []
  }, 
  "Beast Hunter": {
    desc: "",
    aura: "Unknown",
    team: "Village",
    abbr: []
  }, */
  "Bodyguard": {
    desc: "Each night, you can select one player to protect (`w!protect [player]`). You automatically protect yourself." +
          " If you or the player you are protecting gets attacked, you will survive." +
          " However, if you are attacked again you will die.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"]
  },
  /*"Cupid": {
  	desc: "During the first night, select 2 players to be a couple with (`w!couple [player1] [player 2]`). They will know each other's roles at the beginning of the next day." +
    			" Your couple must survive until the end of tne game and must be the last players alive in order to win as couple." +
          " If one your couple dies, the other couple dies along and you become a regular villager.",
    aura: "Good",
    team: "Village/Couple",
    abbr: []
  },*/
  "Cursed": {
    desc: "You are a regular villager until the werewolves kill you at which point, you become a werewolf." +
          " <:Doctor:658633450353590295> Doctors, <:Bodyguard:659721472310509588> Bodyguards," +
          " <:Beast_Hunter:660071569980260352> Beast Hunters and <:Jailer:658633215824756748> Jailer can protect him at night." +
    			" You cannot be converted to an another team (e.g. sect).", 
    aura: "Good",
    team: "Village",
    abbr: ["lycan"]
  },
  /*"Detective": {
  	desc: "Every night, select two players to check if they belong to the same team with (`w!detect [player]`)." +
    			" Players from the same team will result an `=` sign meanwhile players from a different team will show a `≠` sign." + // replace with emoji later
          " The <:Wolf_Shaman:659722357711306753> Wolf Shaman's enchantment will make you see enchanted players on the werewolf team.",
    aura: "Good",
    team: "Village",
    abbr: ["det"]
  }, */
  "Doctor": {
    desc: "Every night, select a player to save with (`w!heal [player]`)." + // alias: w!protect
          " You will be notified when your protected player was attaked. You cannot protect yourself.",
    aura: "Good",
    team: "Village",
    abbr: ["doc", "medic"] // bruh wot lmao medic
  },
  /*"Flower Child": {
 		desc: "Once a game, you can protect anyone from being lynched by using (`w!petal [player]`).",
    aura: "Good", 
    team: "Village", 
 		abbr: ["fc"] 
  }, 
  "Fortune Teller": {
  	desc: "During the first night, give two cards to two players with (`w!givecards [player1] [player 2]`)." +
    			" These players can use the cards and reveal their role.",
    aura: "Unknown",
    team: "Village",
    abbr: []
  }, 
  "Grumpy Grandma": {
    desc: "After the first night, select a player to mute with (`w!mute [player]`). This player won't be able to talk or vote the next day." +
    			" However, if someone is muted, the village will be notified. You cannot mute the same person twice in a row.",
    aura: "Good",
    team: "Village",
    abbr: ["gg", "grandma"]
  }, */
  "Gunner": {
    desc: "During the day, you have 2 bullets which you can use them to shoot players by doing (`w!shoot [player]`)." +
          " However, the shots are loud, so your role will be revealed after the first shot. ",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"]
  },
  "Jailer": {
    desc: "Every day, select one player to jail by doing (`w!jail [number]`). Your target will be jailed the following night and cannot use its abilitids." +
    			" If you find your target suspicious, you can kill it by doing (`w!shoot [player]`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"]
  },
  /* Marksman, Mayor */
  "Medium": {
    desc: "During the night, you can talk anonymously with the dead players." +
          " Once per game, you can revive a dead player (`w!revive [player]`).", // alias: w!rev
    aura: "Unknown",
    team: "Village",
    abbr: ["med"]
  },
  /* Pacifist, President */
  "Priest": {
    desc: "Once per game, you can throw holy water at one player. You can only do this during the day." +
          " If the water is thrown at a werewolf, they will die (excluding Sorcerer). If that player is not a werewolf, the Priest dies.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"]
  },
  /* Red Lady */
  "Seer": {
    desc: "Each night, you uncover the role of one player with (`w!check [player]`).", // alias: w!see
    aura: "Good",
    team: "Village",
    abbr: []
  },
  /* Sheriff, Spirit Seer, Tough Guy, Witch */
  
  // Werewolf roles
  "Werewolf": {
    desc: "You are a regular Werewolf with no special abilities. Do (`w!vote [player]`) to vote with your werewolf teammates.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"]
  },
  "Alpha Werewolf": {
    desc: "You are a regular Werewolf except when you vote with the werewolves by doing (`w!vote [player]`), your vote counts as double!",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha"]
  },
  /* Guardian Wolf, Junior Werewolf, Kitten Wolf, Nightmare Werewolf, Sorcerer, Werewolf Berserk */
  "Wolf Seer": {
    desc: "Each night, you can uncover the role of one player (`w!check [player]`)." +
          " You can talk with the other werewolves and provide any information you found." +
          " However, you cannot vote on a player to kill unless you resign your ability to see roles." +
          " If you are the last werewolf alive you instantly resign your seeing ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "wwseer", "ww seer"]
  },
  "Wolf Shaman": {
    desc: "Each night, you can vote on a player to kill (`w!vote [player]`) and talk with the other werewolves." +
          " During the day, you can put an enchantment on another player (`w!enchant [player]`)." +
          " This will make that player appear as a Wolf Shaman to the <:Seer:658633721448235019> Seer," +
          " Evil to the <:Aura_Seer:658632880490020874> Aura Seer and on the werewolves team for <:Detective:660070860832505863> Detective.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww sham","sham","shaman"]
  },
  
  // Solo non-killing roles
  
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
  
  // Solo killing roles
  
  "Arsonist": {
  	desc: "Each night, you can douse 2 players with gasoline (`w!douse [player]`) or ignite doused players by doing (`w!ignite`)." + // alias: w!burn
          " You cannot be killed by the werewolves." + 
          " You win if you are the last player alive.", 
    aura: "Unknown", 
    team: "Solo",
    abbr: ["ars", "arso", "arson", "pyro"]
  }, 
  "Bomber": {
  	desc: "At night, place a bomb on 3 players vertically, horizontally or diagonally (`w!placebomb [player]`)." +
          " The following night, tbe bomb explodes, killing the selected players." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.",
 		aura: "Unknown",
    team: "Solo",
    abbr: ["bb", "bomb"]
  },
  "Corruptor": {
  	desc: "Every night, select a player 'glitch' by doing (`w!glitch [player]`)." +
    			" That player won't be able to speak or vote the next day and will die at the end of the day." +
  				" The role of the player won't be revealed. You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["corr"] 
  },
  "Cannibal": {
  	desc: "Every night, you can kill a player or save up your hunger to kill more the next night by doing (`w!eat [player]`)." +
    			" You can only stack up to 5 kills. You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["canni", "cani", "cb"]
  },
  "Illusionist": {
  	desc: "Every night, select a player to disguise." +
    			" These players will appear to be the Illusionist to the <:Seer:658633721448235019> Seer," +
          " a different team to the <:Detective:660070860832505863> Detective and unknown to the <:Aura_Seer:658632880490020874> Aura Seer." +
          " During the day, you can choose to kill all disguised players." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown", 
    team: "Solo", 
    abbr: ["illu", "illusion"]
  },
  "Sect Leader": {
  	desc: "Every night, select a player to convert into a Sect Member with (`w!sect [player]`). You can only convert villagers to the Sect Team." +
    			" However, if you're killed, every Sect Member dies along. You win if everyone alive is converted into a Sect Member.", 
    aura: "Unknown",
    team: "Sect",
    abbr: ["sl", "sect"] 
	},
  "Serial Killer": {
    desc: "Each night, stab one player with (`w!stab [player]`)." + // alias: w!kill
          " You cannot be killed by the werewolves. You win if you are the last player alive.", 
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"]
  },
  "Zombie": {
  	desc: "Each night, select a player to convert to a Zombie by (`w!zombify [player]`). Only players from the Village team can be converted." +
    			" However, players take one day to convert before turning to a zombie. You win if all alive players are converted into Zombies.",
    aura: "Unknown",
    team: "Zombies",
    abbr: ["zomb", "zom", "zb"]
  }
}