log("4 - Paladin.6.js")
load_code(1)
load_code(13)	//skill3shot(), get_nearby_entitties()
load_code(14)	// PARTY
load_code(15)	//bots
load_code(16)	// cm
//load_code(17) // getParentOfCharacter

//const { webFrame } = require('electron');
//webFrame.setZoomFactor(0.5);


performance_trick()
var attack_mode = false

let mobs = [
	"bee", "crab", "squigtoad", 'arcticbee', "snake", "osnake", "rat", "armadillo",
    "croc", "squig", "spider", "porcupine", "goo", "tortoise", "bat", "goldenbat", "phoenix",
    "scorpion", "tinyp", "greenjr", "bbpompom","minimush","iceroamer",'cgoo', 
	'boar', 'bgoo',
];


//if (this.task.hp > character.att * 3 || this.task.att > character.max_hp / 11) {

let desired_potion_count = 9999;
let desired_mp_pot = "mpot1"
let desired_hp_pot = "hpot1"
let MERCHANT_NAME = "VendorGuy";
let PACK_THRESHOLD = 28;

//send_cm("camelCase", {code: "move", loc: locations["camelCase"]})
class Paladin extends Character {
    constructor() {
        super()



    }
    loop(){
        if (character.rip) this.handle_death()
        else {
            attack_mode = false
            this.get_pot();
            this.healing()
            loot();
            this.start_attacking();

            setTimeout(() => {
                this.loop()
            }, 250);
        }
    }; // Loops every 1/4 seconds.






// POTIONS
    dry() {
        // checks to see if we're out of weed
        // if no health potions, go get them
        if (quantity(desired_hp_pot) < 15) {
            return true;
        }

        // if no mana potions, go get them
        if (quantity(desired_mp_pot) < 15) {
            return true;
        }
        
        return false;
    }

    get_pot() {
        if (smart.moving) return;
        if (!this.dry()) return;
        attack_mode = false
        // get potions since we're out of one of them
        // determine how many we need to buy
        let HP_TO_BUY = desired_potion_count - quantity(desired_hp_pot);
        let MP_TO_BUY = desired_potion_count - quantity(desired_mp_pot);
        
        if(self.rip) return;

        // go to the nearest potion seller & buy
        smart_move({ to: "potions", return: true }, function () {
            buy(desired_hp_pot,HP_TO_BUY);
            buy(desired_mp_pot, MP_TO_BUY);
            return;
        })
    }

    healing() {
        if (character.ctype == "paladin") {
            if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp - 500) use(locate_item(desired_mp_pot));
			if (!is_on_cooldown("selfheal") && character.hp < character.max_hp - 200 && character.slots.mainhand.name != "ololipop") {
                if (character.mp > 100) {
                    use_skill("selfheal", character)
                } else {
                    use(locate_item(desired_mp_pot));
                }
				if (is_on_cooldown("selfheal") && !is_on_cooldown("regen_mp") && character.hp <= character.max_hp - 500) use(locate_item(desired_hp_pot)) 
            }
            if (character.slots.mainhand.name == "ololipop") {
                if (!is_on_cooldown("regen_hp") && character.hp <= character.max_hp - 400) use(locate_item(desired_hp_pot));
            }
            if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp) use_skill("regen_mp");
            return;
        } else {
            if (!is_on_cooldown("regen_hp") && character.hp <= character.max_hp - 400) use(locate_item(desired_hp_pot));
            if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp - 500) use(locate_item(desired_mp_pot));
        }
        if (!is_on_cooldown("regen_mp") && character.mp < character.max_mp) use_skill("regen_mp");
        if (!is_on_cooldown("regen_hp") && character.hp < character.max_hp) use_skill("regen_hp");
    }

    start_attacking() {
        if (smart.moving) return
        let target = get_targeted_monster();
        if (!target || target.rip) {
            target = get_nearest_monster()
            if (!target) return;
            if (!mobs.includes(target.mtype)) return;
            if ((!target.target == undefined) && (!is_friendly(target.target))){
                change_target(null);
                return;
            } 
            if (target) change_target(target);
            else {
                set_message("No Monsters");
                return;
            }
        }
        if (target) {
            if (target.max_hp <= 620 && character.slots.mainhand.name != "ololipop") {
                equip(locate_item("ololipop"))
                character.slots.mainhand.name = "ololipop"
            }
            if (target.max_hp > 620 && character.slots.mainhand.name != "xmace") { // > character.attack
                equip(locate_item("xmace"))
                character.slots.mainhand.name = "xmace"
            }
        }

        if (!is_in_range(target)) {
            move(
                character.x + (target.x - character.x) / 2,
                character.y + (target.y - character.y) / 2
            );
            // Walk half the distance
        }
        // if (get_player(character.party)) {
        //     target = get_player(character.party).target;
        //     if (target) change_target(target);
        // }
        moveInCircle({x:target.real_x, y:target.real_y})
        if (can_attack(target)) {
            attack_mode = true;
            set_message("Attacking");
            attack(target);
        }
    }

    death_return(location){
		if (character.rip || is_moving(character)) return;
		smart_move(location)
	}

    handle_death()
    {
        setTimeout(savePosition(), 4000);
        setTimeout(respawn,25000);
        setTimeout(this.death_return(getPosition(character.id)), 26000);
    }

    merchant(start, end) {
		var MERCHANT_NAME = MERCHANT_NAME;
		for (var i = start; i < end; i++) {
			if (character.items[i])
				send_item(MERCHANT_NAME, i)
		}
    }

        unpack() {
        this.merchant(0, 28);
		let excessGold = character.gold - 1000000
		if (excessGold > 0) {
			send_gold(MERCHANT_NAME, excessGold)
		}
    }


    requestUnpack() {
        let unpackPayload = {
            type: 'unpack',
            data: current_location()
        }
        send_cm( MERCHANT_NAME, unpackPayload)
    }


}

function moveInCircle(center, radius = 30, angle = Math.PI / 2.5) { //\
    if (can_move_to(center.x, center.y)) {
        const angleFromCenterToCurrent = Math.atan2(character.y - center.y, character.x - center.x)
        const endGoalAngle = angleFromCenterToCurrent + angle
        const endGoal = { x: center.x + radius * Math.cos(endGoalAngle), y: center.y + radius * Math.sin(endGoalAngle) }
        move(endGoal.x, endGoal.y)
    }  else {
        // Move to where we want to start walking in a circle
        xmove(center)
    }
}

character.on("loot",function(data){
	if (data.opener === character.name) {
		
		// periodically check when looting if we have mluck
		if (!character.s.mluck || !character.s.mluck.f == MERCHANT_NAME) {
			char.requestUnpack()
		}

		let itemCount = 0;
		for (let idx in character.items) {
			if (character.items[idx]) {
				itemCount += 1
			}
		}

		if (itemCount > PACK_THRESHOLD) {
			log("Requesting unpack")
			char.requestUnpack();
		}
	}
});




let char = new Paladin();
char.loop();