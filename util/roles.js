let roles = {
  
  // Villager roles
  
  "Villager": {
    desc: "You are a regular Villager with no special abilities.",
    aura: "Good",
    team: "Village",
    abbr: ["reg","vil","vill","forkman","forkmen"],
    cat : "Regular Villager"
  },
  "Aura Seer": {
    desc: "Each night you can select one player to see whether this player is good, evil or unknown (`w!check [player]`)." + // alias: w!see
          " If the player is good, they are on the village and if they are evil they are on the Werewolves." + 
          " The <:Wolf_Shaman:659722357711306753> Wolf Shaman's enchantment can make an Aura Seer see a player as evil, regardless of their actual aura.",
    aura: "Good",
    team: "Village",
    abbr: ["az","aura"],
    cat : "Regular Villager"
  }, 
  "Avenger": {
    desc: "You can select a player to be avenged on when you die (`w!avenge [player]`).",
    aura: "Good",
    team: "Village",
    abbr: ["hunter"],
    cat : "Regular Villager"
  }, 
  "Beast Hunter": {
    desc: "At night you can set a trap on a person (`w!trap [player]`). The trap activates on the following night." +
          " If the person you placed a trap on was attacked, the weakest werewolf dies." +
          " You can place a trap on yourself." +
          " Your trap will deactivate when solo killers try to kill you but it won't kill them.",
    aura: "Unknown",
    team: "Village",
    abbr: ["bh"],
    cat : "Regular Villager"
  },
  "Bodyguard": {
    desc: "Each night you can select one player to protect (`w!protect [player]`). You automatically protect yourself." +
          " If you or the player you are protecting gets attacked, you will survive." +
          " However, if you are attacked again you will die.",
    aura: "Good",
    team: "Village",
    abbr: ["bg"],
    cat : "Regular Villager"
  },
  "Cupid": {
  	desc: "During the first night, select 2 players to be a couple with (`w!couple [player1] [player2]`). They will know each other's roles at the beginning of the next day." +
    			" Your couple must survive until the end of the game and must be the last players alive in order to win as couple." +
          " If one your couple dies, the other couple dies along and you become a regular villager.",
    aura: "Good",
    team: "Village",
    abbr: [],
    oneOnly: true
  },
  "Cursed": {
    desc: "You are a regular villager until the werewolves kill you at which point, you become a werewolf." +
          " <:Doctor:658633450353590295> Doctors, <:Bodyguard:659721472310509588> Bodyguards," +
          " <:Beast_Hunter:660071569980260352> Beast Hunters and <:Jailer:658633215824756748> Jailer can protect him at night." +
    			" You cannot be converted to an another team (e.g. sect).", 
    aura: "Good",
    team: "Village",
    abbr: ["lycan"]
  },
  "Detective": {
  	desc: "Every night, select two players to check if they belong to the same team with (`w!detect [player]`)." +
    			" Players from the same team will result an <:Detective_Equal:660496165535612958> sign" +
          " while players from a different team will show a <:Detective_NotEqual:660496385388445725> sign." +
          " The <:Wolf_Shaman:659722357711306753> Wolf Shaman's enchantment will make you see enchanted players on the werewolf team.",
    aura: "Good",
    team: "Village",
    abbr: ["det","sherlock","holmes"],
    cat : "Strong Villager"
  },
  "Doctor": {
    desc: "Every night, select a player to save with (`w!heal [player]`)." + // alias: w!protect
          " You will be notified when your protected player was attaked. You cannot protect yourself.",
    aura: "Good",
    team: "Village",
    abbr: ["doc", "medic"],
    cat : "Regular Villager"
  },
  "Flower Child": {
 		desc: "Once a game, you can protect anyone from being lynched by using (`w!protect [player]`).",
    aura: "Good", 
    team: "Village", 
 		abbr: ["fc", "flower"],
    cat : "Regular Villager"
  }, 
  "Fortune Teller": {
  	desc: "During the first night, give two cards to two players (`w!givecards [player1] [player2]`)." +
    			" These players can use the cards and reveal their role.",
    aura: "Unknown",
    team: "Village",
    abbr: ["ft"],
    cat : "Regular Villager"
  }, 
  "Grumpy Grandma": {
    desc: "After the first night, select a player to mute with (`w!mute [player]`). This player won't be able to talk or vote the next day." +
    			" However, if someone is muted, the village will be notified. You cannot mute the same person twice in a row.",
    aura: "Good",
    team: "Village",
    abbr: ["granny","gg"],
    cat : "Regular Villager"
  },
  "Gunner": {
    desc: "During the day, you have two bullets which you can use them to shoot players by doing (`w!shoot [player]`)." +
          " However, the shots are loud, so your role will be revealed after the first shot. ",
    aura: "Unknown",
    team: "Village",
    abbr: ["gun"],
    cat : "Strong Villager"
  },
  "Jailer": {
    desc: "Every day, select one player to jail by doing (`w!jail [number]`)." +
          " Your target will be jailed the following night and cannot use their abilities." +
    			" If you find your target suspicious, you can execute them (`w!shoot [player]`).",
    aura: "Unknown",
    team: "Village",
    abbr: ["jail"],
    cat : "Strong Villager",
    oneOnly: true
  },
  "Marksman": {
 		desc: "During the night, select one player to mark with (`w!mark [player]`)." +
          " The following night, you can either shoot with (`w!release [player]`) or change your target." + // alias: w!shoot
    			" If you try to shoot a villager, your shot will backfire and kill you instead.",
    aura: "Unknown",
    team: "Village",
    abbr: ["mm"],
    cat : "Regular Villager"
  }, 
  "Mayor": {
  	desc: "Once a game, you can reveal your role with (`w!reveal`) and your vote will count as double.",
    aura: "Good",
    team: "Village",
    abbr: [],
  },
  "Medium": {
    desc: "During the night, you can talk anonymously with the dead players." +
          " Once per game, you can revive a dead player (`w!revive [player]`).", // alias: w!rev
    aura: "Unknown",
    team: "Village",
    abbr: ["med"],
    cat : "Strong Villager"
  },
  "Pacifist": {
  	desc: "Once a game, you can reveal one player with (`w!reveal [player]`) and skip the voting session.",
    aura: "Good",
    team: "Village",
    abbr: ["paci"],
    cat : "Regular Villager"
  },
  "President": {
  	desc: "Your role is revealed to everyone. If you die the village loses." +
          " You cannot be killed by werewolves unless there are 4 villagers or below.",
    aura: "Good",
    team: "Village",
    abbr: ["trump","obama"],
    oneOnly: true
  },
  "Priest": {
    desc: "Once per game, you can throw holy water at one player (`w!water [player]`). You can only do this during the day." +
          " If the water is thrown at a werewolf, they will die (excluding <:Sorcerer:660883179250647045> Sorcerer)." +
          " If that player is not a werewolf, you dies.",
    aura: "Good",
    team: "Village",
    abbr: ["pri"],
    cat : "Regular Villager"
  },
  "Red Lady": {
  	desc: "Every night, you can choose to visit a player with (`w!visit [player]`)." +
    			" If you are selected to be killed that night, you will be protected." +
          " However, if the player you visited is evil or attacked, you will die.",
    aura: "Good",
    team: "Village",
    abbr: ["rl", "prostitute"],
    cat : "Regular Villager"
  },
  "Seer": {
    desc: "Every night, you uncover the role of one player with (`w!check [player]`).", // alias: w!see
    aura: "Good",
    team: "Village",
    abbr: [],
    cat : "Strong Villager"
  },
  "Seer Apprentice": {
    desc: "You start out as an ordinary villager with no special powers." +
          " However, if the <:Seer:658633721448235019> Seer dies you will become the new Seer." +
          " If the original seer is revived, you will remain a Seer.",
    aura: "Good",
    team: "Village",
    abbr: ["sapp", "sa", "app", "seer app"],
    cat : "Regular Villager"
  },
  "Sheriff": {
  	desc: "Every night, select a player to look at with (`w!lookout [player]`)." +
    			" If that player is killed, you will get 2 suspects. One is the real killer of that player while the other is random.",
    aura: "Good",
    team: "Village",
    abbr: ["sher", "cowboy"], 
    cat : "Regular Villager"
  }, 
  "Spirit Seer": {
  	desc: "Every night, watch 2 players with (`w!watch [player]`)." +
          " If one or more of them have killed, you will receive red spirits." +
          " If none of them killed, you will receive blue spirits.", 
    aura: "Good",
    team: "Village",
    abbr: ["ss", "sz", "spirit", "spz", "sps"],
    cat : "Regular Villager"
  }, 
  "Tough Guy": {
  	desc: "During the night, you can select one player to protect (`w!defend [player]`)." + // alias: w!protect
          " If you or your target is attacked, you get hit." + 
    			" However, you will know the role of the attacker or the weakest werewolf." +
          " If more than 1 attacker or team attacks you, you will know all their roles." +
          " Unfortunately, because of your wounds, you will die at the end of the day",
    aura: "Good",
    team: "Village",
    abbr: ["tg"],
    cat : "Regular Villager"
  }, 
  "Witch": {
  	desc: "You have 2 potions that you can use at night." +
          " One is a protective potion that will only be consumed if the player was attacked by doing (`w!heal [player]`)." + // alias: w!protect
    			" The other is a poison potion that can be used after the first night." +
          " This potion can kill a player instantly by doing (`w!poison [player]`). You can use both potions once.",
    aura: "Unknown",
    team: "Village",
    abbr: [],
    cat : "Regular Villager"
  },
  
  // Werewolf roles
  "Werewolf": {
    desc: "You are a regular werewolf with no special abilities. Do `w!vote [player]` to vote with your werewolf teammates.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww"],
    cat : "Werewolf"
  },
  "Alpha Werewolf": {
    desc: "You are a regular werewolf except when you vote with the werewolves (`w!vote [player]`), your vote counts as double!",
    aura: "Unknown",
    team: "Werewolves",
    abbr: ["aww","alpha", "alpha ww"],
    cat : "Werewolf"
  },
  "Guardian Wolf": {
  	desc: "Once a game, you can protect anyone from being lynched by doing (`w!protect [player]`).",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["gww"],
    cat : "Werewolf"
  }, 
  "Junior Werewolf": {
    desc: "You can select a player to be avenged on when you die (`w!avenge [player]`).",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["jww", "jr", "jnr", "jrww", "jnrww"],
    cat : "Werewolf"
  },
  "Kitten Wolf": {
    desc: "You can select can choose a player to convert a player to the Werewolves team (`w!scratch [player]`)." +
          " If this player is part of the Village, they will be converted. If not, they will remain on their team." +
          " Protector roles can negate this ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["kww"],
    cat : "Werewolf"
  }, 
  "Nightmare Werewolf": {
    desc: "Each day you can select a player to be numbed at night (`w!numb [player]`). That player cannot use their abilities that night.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["nww"],
    cat : "Werewolf"
  },
  "Sorcerer": {
    desc: "Each night you can see the roles of a player (`w!check [player]`)." +
          " However, you cannot see the roles of the other werewolves nor can you talk to them." +
          " The role of the checked player will not be known by the other werewolves." +
          " You can however find out the other wolves by seeing their roles." +
          " You cannot be killed by the Priest's Holy Water.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["sorc"]
  },
  "Werewolf Berserk": {
    desc: "Once per game you can announce a Werewolves 'frenzy' during the day." +
          " If during the night of the frenzy their target is protected, all protectors of the victim will die, along with the victim.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wwb","bww","bers","berz"],
    cat : "Werewolf"
  },
  "Wolf Seer": {
    desc: "Each night you can uncover the role of one player (`w!check [player]`)." +
          " You can talk with the other werewolves and provide any information you found." +
          " However, you cannot vote on a player to kill unless you resign your ability to see roles." +
          " If you are the last werewolf alive you instantly resign your seeing ability.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["wws", "wwz", "wwseer", "ww seer"],
    cat : "Werewolf"
  },
  "Wolf Shaman": {
    desc: "Each night, you can vote on a player to kill (`w!vote [player]`) and talk with the other werewolves." +
          " During the day, you can put an enchantment on another player (`w!enchant [player]`)." +
          " This will make that player appear as a Wolf Shaman to the <:Seer:658633721448235019> Seer," +
          " Evil to the <:Aura_Seer:658632880490020874> Aura Seer and on the werewolves team for <:Detective:660070860832505863> Detective.",
    aura: "Evil",
    team: "Werewolves",
    abbr: ["ww sham","sham","shaman"],
    cat : "Werewolf"
  },
  
  // Solo non-killing roles
  
  "Fool": {
    desc: "Your only goal is to get lynched by the village.",
    aura: "Unknown",
    team: "Solo",
    abbr: [],
    cat : "Voting"
  },
  "Headhunter": {
    desc: "Your only goal is to get your target lynched by the village." +
          " If your target dies in a way other than being lynched, you become a regular villager.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["hh"],
    cat : "Voting"
  },
  
  // Solo killing roles
  
  "Arsonist": {
  	desc: "Each night, you can douse 2 players with gasoline (`w!douse [player]`) or ignite doused players by doing (`w!ignite`)." + // alias: w!burn
          " You cannot be killed by the werewolves." + 
          " You win if you are the last player alive.", 
    aura: "Unknown", 
    team: "Solo",
    abbr: ["ars", "arso", "arson", "pyro"],
    cat : "Killer"
  }, 
  "Bomber": {
  	desc: "At night, place a bomb on 3 players vertically, horizontally or diagonally (`w!placebomb [player]`)." +
          " The following night, tbe bomb explodes, killing the selected players." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.",
 		aura: "Unknown",
    team: "Solo",
    abbr: ["bb", "bomb"],
    cat : "Killer"
  },
  "Corruptor": {
  	desc: "Every night, select a player 'glitch' by doing (`w!glitch [player]`)." +
    			" That player won't be able to speak or vote the next day and will die at the end of the day." +
  				" The role of the player won't be revealed. You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["corr"],
    cat : "Killer"
  },
  "Cannibal": {
  	desc: "Every night, you can kill a player or save up your hunger to kill more the next night by doing (`w!eat [player]`)." +
    			" You can only stack up to 5 kills. You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown",
    team: "Solo",
    abbr: ["canni", "cani", "cb"],
    cat : "Killer"
  },
  "Illusionist": {
  	desc: "Every night, select a player to disguise." +
    			" These players will appear to be the Illusionist to the <:Seer:658633721448235019> Seer," +
          " a different team to the <:Detective:660070860832505863> Detective and unknown to the <:Aura_Seer:658632880490020874> Aura Seer." +
          " During the day, you can choose to kill all disguised players." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.",
    aura: "Unknown", 
    team: "Solo", 
    abbr: ["illu", "illusion"],
    cat : "Killer"
  },
  "Sect Leader": {
  	desc: "Every night, select a player to convert into a Sect Member with (`w!sect [player]`). You can only convert villagers to the Sect Team." +
    			" However, if you're killed, every Sect Member dies along. You win if everyone alive is converted into a Sect Member.", 
    aura: "Unknown",
    team: "Sect",
    abbr: ["sl"],
    cat : "Killer",
    oneOnly: true
	},
  "Serial Killer": {
    desc: "Each night, stab one player with (`w!stab [player]`)." +
          " You cannot be killed by the werewolves. You win if you are the last player alive.", 
    aura: "Unknown",
    team: "Solo",
    abbr: ["sk"],
    cat : "Killer"
  },
  "Zombie": {
  	desc: "Each night, select a player to convert to a Zombie by (`w!zombify [player]`). Only players from the Village team can be converted." +
    			" However, players take one day to convert before turning to a zombie. You win if all alive players are converted into Zombies.",
    aura: "Unknown",
    team: "Zombies",
    abbr: ["zomb", "zom", "zb"],
    cat : "Killer"
  },
  
  // Random Roles
  
  "Random": {
    desc: "Any role.",
    abbr: ["rdm"],
    cat : "Random"
  },
  "Random Regular Villager": {
    desc: "Any of:\nVillager, Aura Seer, Avenger, Beast Hunter, Bodyguard, Doctor, Flower Child," +
          " Fortune Teller, Grumpy Grandma, Marksman, Pacifist, Priest, Red Lady," +
          " Seer Apprentice, Sheriff, Spirit Seer, Tough Guy or Witch",
    abbr: ["rrv"],
    cat : "Random"
  },
  "Random Strong Villager": {
    desc: "Any of:\nDetective, Gunner, Jailer, Medium or Seer",
    abbr: ["rsv"],
    cat : "Random"
  },
  "Random Werewolf": {
    desc: "Any of:\nWerewolf, Alpha Werewolf, Guardian Wolf, Junior Werewolf," +
          "Kitten Wolf, Nightmare Werewolf, Werewolf Berserk, Wolf Seer, Wolf Shaman",
    abbr: ["rw"],
    cat : "Random"
  },
  "Random Voting": {
    desc: "Any of:\nFool or Headhunter",
    abbr: ["rv"],
    cat : "Random"
  },
  "Random Killer": {
    desc: "Any of:\nArsonist, Bomber, Corruptor, Cannibal, Illusionist," +
          " Sect Leader, Serial Killer, Zombie",
    abbr: ["rk"],
    cat : "Random"
  }
}

for (const [key,] of Object.entries(roles))
  roles[key].name = key

module.exports = roles