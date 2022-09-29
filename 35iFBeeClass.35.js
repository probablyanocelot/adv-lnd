log("31")
performance_trick()
load_code('23Dicts')
load_code('1Main')
load_code('13Skills')	//skill3shot(), get_nearby_entitties()
load_code('14Partying')	// PARTY, bots
load_code('15Combat')
load_code('16Relations')	// cm
load_code('19management') //sell extras -- merge this and 12Inv?


let merchant = 'VendorGuy';
let group = '2ra'
let currentGroup = getGroup(group)
let myFarmDefault = farmDefault[character.id]

let farmerReserve = 2500000;
let desired_potion_count = 9999;
let desired_mp_pot = "mpot1"
let desired_hp_pot = "hpot1"
let PACK_THRESHOLD = 28;

let myMtype = 'cgoo'



//STARTUP
if (character.name == currentGroup[0]) startBots(currentGroup);
const keyInviteBots = map_key("9", "snippet", "sendInvites('r3')")
const keyKillBots = map_key('8', 'snippet', "killBots(currentGroup)")
setInterval(loot, 65)



function pvpBank() {
	for (let item of character.items) {
		if (!item) continue;
		if (is_pvp()){
			switch (item["name"]) {
				
				case "suckerpunch":
					if (!server.id == "I") {
						change_server("US", "I")
						break;
					}
				case "ink":
					farmerBank()
					break
				case 'seashell':
					if (item.q > 500) farmerBank()
					break
				case 'gem0':
					if (item.q >= 5) farmerBank()
					break
			}
		} 
	}
}


function farmerBank() {
	if (smart.moving) return;
	if (!character.bank && !smart.moving) {
		log('farmerBank move')
		smart_move('bank')
	}
	if (smart.moving || character.moving) return;
	char.current_action = undefined;
	if (character.gold > 2500000) {
		let deposit = character.gold - farmerReserve;
		bank_deposit(deposit)
	}
	if (character.gold < 1500000) {
		log("Bank success");
		bank_withdraw(500000);
	}
	if (character.bank) { // && character.bank['items0'].length < 42
		for (let itemSlot in character.items) {
			let item = character.items[itemSlot]
			if (!item) continue;
			let itemName = item.name
			if (!sell_dict['keep'].includes(itemName)) bank_store(itemSlot)
			
		}
	
	}
	log('farmerBank return move')
	char.moveToThen(myFarmDefault, char.current_action = 'farming')
}



let attack_mode = false

class Ranger {  

	constructor() {
  
		// states
		this.pvp;
		this.thinking;
		this.current_action;
		this.idle_counter = 0;
  
	  // timing
		this.idle_start;
		this.last_cm;
		this.last_respawn;
		this.last_use_potion;
		this.last_use_mp_potion;
		this.last_use_hp_potion;
  
		// combat
		this.turret = true;
		this.mon_type;
		this.can_kill;
		this.itemBounty;
		this.itemBountyQty;
		
		if(character.ctype == 'paladin') this.turret = false

	setTimeout(savePosition(), 10000)
	
	}
	

	set_current_action(action) {
		log(`Requesting to update '${this.current_action}' to '${action}'`);
		if (!this.current_action && action) {
			this.current_action = action;
			this.idle_counter = 0;
		}
	}
	clear_current_action() {
		log(`Requesting to clear: ${this.current_action}`);
		if (this.current_action) {
			this.current_action = ""
			this.idle_counter = 0;
		}
	}
  
	handle_death() {
	  if (character.rip) {
		  if (this.last_respawn == null || new Date() - this.last_respawn >= 10000) {
			  this.clear_current_action();
		  respawn();
		  this.last_respawn = new Date();
		}
	  }
	}
  
	joinEvent(eventMob) {
		if (eventMob == 'franky') return;
		// eventMob = 'icegolem', etc
		if (this.current_action != eventMob && parent.S[eventMob] && !get_monster({ type: eventMob })) {
		// Event is on and can't find mob?
			join(eventMob)
			return true;
			// Go there, then!
		}
		return false;
	}
	
	
	serverEvents() {
		if (character.ctype == 'merchant') return;
		for (let eventMob in G.events) {
			eventMob = String(eventMob)
	
			// if (!joinEvent(eventMob)) continue;
			if (this.joinEvent(eventMob)) this.current_action = eventMob
	

			if (this.current_action == eventMob && !parent.S[eventMob]) this.moveToThen(myFarmDefault, this.clear_current_action())
			
		}
	}

	moveToThen(loc, then) {
		smart_move(loc)
		.catch(() => {
			if (!character.moving && !smart.moving) use_skill('use_town')
				.then(smart_move(loc))
		})
		.then(then)

	}

	manage_idle() {

		if (character.ctype == 'paladin') return
		if (smart.moving || this.current_action || (this.current_action && !this.current_action == '')) return;

		if (character.moving) {
			this.idle_counter = 0;
		}

		// only increment counter when we're doing nothing
		if (!this.current_action && !character.moving && !this.thinking) {
			this.idle_counter += 0.2
			if (this.idle_counter % 1 == 0) log(`Idle: ${this.idle_counter}`);
		}
		
		if (this.idle_counter > 10 && !smart.moving) {
			log('idle move')
			this.moveToThen(myFarmDefault, this.set_current_action('farming'))
		}
	}

  
	fixStuck(){
		if (smart.moving) return
		// stuck in main
		if (character.x == 0 && character.y == 0) {
			this.clear_current_action();
			log('stuck move')
			smart_move(myFarmDefault)
		}
		if (this.current_action == 'farming' && character.x != farmDefault[character.id].x && character.y != farmDefault[character.id].y) {
			smart_move(farmDefault[character.id]).catch(use_skill('use_town'))
		}
	}
  
  
	dry() {
	  // checks to see if we're out of weed
	  // if no health potions, go get them
	  if (quantity(desired_hp_pot) < 100) {
		  return true;
	  }
  
	  // if no mana potions, go get them
	  if (quantity(desired_mp_pot) < 100) {
		  return true;
	  }
	  
	  return false;
	}
  
  
	count_pot() {
		// determine how many we need to buy
		let HP_TO_BUY = desired_potion_count - quantity(desired_hp_pot);
		let MP_TO_BUY = desired_potion_count - quantity(desired_mp_pot);	
		let pots = {
			h: {
				type: desired_hp_pot,
				qty: HP_TO_BUY,
			},
			m: {
				type: desired_mp_pot,
				qty: MP_TO_BUY,
			}
		}
		return pots
	}


  
  farmSell() {


	if (smart.moving || character.ctype == 'merchant') return;
	// if (!character.esize <= 5) return;
	  log('farmSell move')
	smart_move('main').then(() => {
		sell_extras();
		this.clear_current_action()
		// 	// sellAllByName('ringsj');
		// })
	})

	}
	
	// if full, call merchant. if merchant, manage inv
	manage_inv() {
		if (this.dry()) {
			if (this.turret == false) this.set_current_action('unpacking')
			send_cm(merchant, { cmd: 'unpack', loc: current_location(), pots: this.count_pot() });
		}
		pvpBank();
		if (character.esize <= 24) send_cm(merchant, {cmd:'unpack', loc:current_location(), pots: this.count_pot()});
	}
	
  
	manage_healing() {
	  if (character.ctype == "paladin") {
		if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp - 500) use(locate_item(desired_mp_pot));
		if (!is_on_cooldown("selfheal") && character.hp < character.max_hp - 200 && character.slots.mainhand.name != "ololipop") {
		  if (character.mp > 100) {
			  use_skill("selfheal", character).then(s => {return}, f=>{return})
		  } else {
			  use(locate_item(desired_mp_pot));
		  }
		  if (is_on_cooldown("selfheal") && !is_on_cooldown("regen_mp") && character.hp <= character.max_hp - 500) use(locate_item(desired_hp_pot)) 
		}
		if (character.slots.mainhand.name == "ololipop") {
			  if (!is_on_cooldown("regen_hp") && character.hp <= character.max_hp - 400) use(locate_item(desired_hp_pot));
		  }
		  if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp) use_skill("regen_mp").then(s => {return}, f=>{return});
		  return;
	  } else {
		if (!is_on_cooldown("regen_hp") && character.hp <= character.max_hp - 400) use(locate_item(desired_hp_pot));
		if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp - 500) use(locate_item(desired_mp_pot));
	  }
	  if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp) use_skill("regen_mp");
	  if (!is_on_cooldown("regen_hp") && character.hp < character.max_hp) use_skill("regen_hp");
	}
	
  
	  buff(skill) {
  
		  // do more dynamic character solution later
		  let characters = ["VendorGuy", "camelCase", "cannaMace", "couplaGrapes"];
		  for (let idx in characters) {
			  let name = characters[idx]
			  let target = get_player(name)
			  if(!target) continue;
			  if (!target.s.skill || target.s.skill.f !== character.name) {
				  use_skill(skill, name)
					  .then(log(`using skill ${skill}`))
					  .catch(`use skill ${skill} failed`)
			  }
		  }	
	}
	
  
	manage_buffs() { 
	  switch (character.ctype) {
		  case "paladin":
			  this.buff("mshield")
		  default:
			  null
	  }
	}
  

	handleMonsterHunt(){
		if (character.ctype == 'merchant' || character.id == 'camelCase') return;
		let monsterHunterLocation = {
			map: 'main', 
			x: parent.G.maps.main.npcs[24].position[0],
			y: parent.G.maps.main.npcs[24].position[1],
		}


		if (character.s.monsterhunt){
	
			// if monsterhunt not finished, keep killing
			if (character.s.monsterhunt.c > 0){
				// if mobType not in 'mobs' : skip
				let mobType = character.s.monsterhunt.id
				if (!mobsLow.includes(mobType) && this.current_action == 'monsterhunt') {
					this.clear_current_action();
					this.can_kill = false
					return
				};
				if (!mobsLow.includes(mobType)) return
				if (this.current_action == 'farming' && (character.x != monsterHunterLocation.x && character.y != monsterHunterLocation.y)) return;

				// if can kill or not current action, set
				this.can_kill = true
				if (this.current_action != 'monsterhunt') this.set_current_action = 'monsterhunt'

				// if (!mobs.includes(mobType) || !G.monsters[mobType].attack > character.hp/20) return
				// targetting
				let target = get_targeted_monster()
				let nearest = get_monster({ type: mobType, no_target: true })
				if (!target && nearest) change_target(nearest)
	
				// if not there, go!
				log('monsterhunt move')
				if (!nearest && !smart.moving) smart_move(mobType)
			}

	
			// if finished, turn in.
			if (character.s.monsterhunt.c == 0 && !smart.moving){
				log('monsterhunt complete move')
				smart_move(monsterHunterLocation).then(() => {
					parent.socket.emit('monsterhunt')
					this.clear_current_action()
				})
			}
		}
		if (!character.s.monsterhunt && !smart.moving){
			// get quest from Daisy
			log('monsterhunt get quest move')
			smart_move(monsterHunterLocation).then(() => {
				parent.socket.emit('monsterhunt')
				setTimeout(function(){
					parent.socket.emit('monsterhunt')
				}, character.ping)
				this.set_current_action('monsterhunt')
			})
		}
	}


	manage_combat() {
		
		if (character.rip || smart.moving) return;
													
		if (character.ctype != 'ranger' && character.ctype != 'merchant') doCombat(char)

		skill3shot(mobsLow, get_nearby_entities());
	}

	manage_item_bounty() {
		if (!this.itemBounty) return
		if (quantity(this.itemBounty) >= this.itemBountyQty) {
			this.clear_current_action()
			this.itemBountyQty = false
			this.itemBounty = false
		}
	}

	
  
	sequence() {
		this.handle_death()
		if (character.rip) return;
		handle_party()
		this.manage_item_bounty
		//this.handleMonsterHunt();
		this.manage_idle()
		this.manage_inv()
		// this.manage_task()
		this.manage_healing()
		//this.manage_buffs()
		this.manage_combat()
		this.fixStuck();
		this.serverEvents();
	}

  
	loop() {
	  this.sequence()
		  
	  // loop timeout
	  setTimeout(() => {
		this.loop()
	  }, 200);
	};
  }
  
let char = new Ranger;
char.loop();



function item_quantity(name)
{
	for(var i=0;i<42;i++)
	{
		if(character.items[i] && character.items[i].name==name) return character.items[i].q||0;
	}
	return 0;
}

function death_return(location){
		if (character.rip || is_moving(character)||smart.moving) return;
	log('death return move')	
	smart_move(location)
	}



function toMerch(){
	if (!is_in_range(get_player(merchant))) return;
	for (let i = 0; i < 9; i++) {
		let item = "egg"
		i = i.toString()
		let itemName=item+i
		if(!locate_item(itemName)) return false;
		let itemLoc = locate_item(itemName)
		send_item(merchant, itemLoc, character.items[itemLoc]['q']);
	}
	for (let i = 5; i<42; i++) {
		if (!character.items[i]) continue;
		send_item(merchant, i, character.items[i]['q']);
	}return;
}

function getTarget() {

	let target = get_nearest_monster()
	let mobType = null
	if (target) mobType = target.mtype

	if (!mobType) return false

	// if in dict: return target
	if (mobsLow.includes(mobType) || (mobsMed.includes(mobType) &&
		character.ctype == 'paladin')) return target;

	// else, set null and return
	target = null
	set_message("No Monsters");
	return false
}

function goToTarget(target) {
	if (!target) return
	// not in range, or we are moving - skip
	if(is_in_range(target)) return
	if(character.moving || smart.moving) return
	
	// Walk half the distance
	xmove(
		character.x+(target.x-character.x)/2,
		character.y+(target.y-character.y)/2
		);
}

function distanceToTarget(target){
	let dist = null
	if (target) dist = distance(character,target)
	return dist
}

function doCombat() { // doCombat(char)

	if (character.ctype == merchant) return
	// if (char.turret == false && char.current_action === 'unpacking') return
	let target = get_targeted_monster()

	if (!target || target.rip) target = getTarget()
	if (target) myMtype = target.mtype
	change_target(target)
	goToTarget(target)


	if (can_attack(target)) {
		pallySkills(target)
		attack(target);
	}

	if (!getTarget()){
		let spawnBorder = getTargetSpawnBorder(myMtype)
		let topLeft = spawnBorder[0]

		xmove(topLeft[0]*.5, topLeft[1]*.5)
	}
}




function getTargetSpawnBorder(mtype) {
    // get a target monster and return the spawn border
    let map = G.maps[character.map];

    // iterate through the monsters
    for (let monster of map.monsters) {
        // if it's of our target type
        if (monster.type == mtype) {

            let topLeft = [monster.boundary[0], monster.boundary[1]]
            let bottomRight = [monster.boundary[2], monster.boundary[3]]

            return [topLeft, bottomRight]
        }
    }
}

// let spawnBorder = getTargetSpawnBorder(target)
// let topLeft = spawnBorder[0]

// if ( (target.hp < target.max_hp) && character.x !== topLeft[0] ) {
// 	xmove(topLeft[0], topLeft[1])
// }