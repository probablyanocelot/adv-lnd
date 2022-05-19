log("6 - Ranger.6.js")
load_code(1)
load_code(13)	//skill3shot(), get_nearby_entitties()
load_code(14)	// PARTY
load_code(15)	//bots
load_code(16)	// cm
//load_code(17) // getParentOfCharacter

//const { webFrame } = require('electron');
//webFrame.setZoomFactor(0.5);


performance_trick()



//if (this.task.hp > character.att * 3 || this.task.att > character.max_hp / 11) {




//send_cm("camelCase", {code: "move", loc: locations["camelCase"]})
class Ranger extends Character {
    constructor() {
        super()
		
		this.master = "camelCase"
		
		this.task;
    }

    botsUp() {
        if (this.master == character.id) {
            log("I am the master")
            start_character("couplaGrapes", 6)
        }
    }

    sequence() {
        this.get_action()
        this.do()
        this.idle()
    }


    loop() {
        if (this.current_action) log(`Processing loop with action: ${this.current_action}`)

        //log(get_active_characters())

        if (this.thinking) {
            return;
        }

        if (character.rip) {
            respawn();
            log("Rip! Respawn clear")
            this.clear_current_action();
            this.thinking = false;
        } else {
            
            if (!this.current_action) {
			}
        }
        setTimeout(() => {
			this.loop()
		}, 1000)
    }
    




const invite_bots = map_key("9","snippet","sendInvites('r3')")

let rangers = ["cannaMace", "camelCase", "couplaGrapes"]

for (var toon of rangers)
{
	continue;
	if (toon == character.id|| toon == "camelCase") continue;
	start_character(toon, 30)
	}


// SET UP A MOB DICT FOR THIS
let cannaMace = {x:-1175.7559333568836, y:-94.26759905415406}//crab
let camelCase = { x: -1143.6557029608748, y: 423.21328251075323 }//"squig"
let couplaGrapes = { x: -1143.6557029608748, y: 423.21328251075323 }//"squig"

// let cMacePos = {map: "main", x: 524.6951256023658, y: 806.8168003462486}
// let cGrapesPos = { map: "main", x: 745.0119325069998, y: 713.0353542476796 }
// let cCasePos = { map: "main", x: 230.8360471312811, y: 1465.6396571609434 }

let locations = {
	"cannaMace": { map: "main", x: 524.6951256023658, y: 806.8168003462486 },
	"camelCase": { map: "main", x: 745.0119325069998, y: 713.0353542476796 },
	"couplaGrapes": { map: "main", x: 230.8360471312811, y: 1465.6396571609434 }}

if (cannaMace) locations["cannaMace"] = cannaMace;
if (camelCase) locations["camelCase"] = camelCase;



function leaveBank(){
	if (character.bank) {
		smart_move("main").then(
			s => {smart_move(locations[character.id])
				 return}
			,
			f => {smart_move("main")
				 }
			)
	}
}


function bee_bank() {
	if (smart.moving || character.moving) return;
	smart_move("bank").then(
		success => {
			if(character.gold < 500000) {
				smart_move({to:"bank", return:true}, function(){ //return:true
					log("Bank success clear");
					bank_withdraw(500000);
				}
				);
			}
			for (let i = 5; i < 42; i++){
				if(character.items[i]) bank_store(i, "items2")
			}
			if (character.gold > 1250000){
				let reserve = 500000;
				let deposit = character.gold - reserve;
				bank_deposit(deposit)
			}
			return
		},
		failure => {
			log("bank failed");
			smart_move(locations[character.id]);
		});
	leaveBank();
}




var attack_mode=true
var playerName = character.id;    
    // get our self
setInterval(function () {
	savePosition()
	if(character.rip) handle_death();
	
	if (character.rip || smart.moving) return;	
		

	let u = setInterval(loot(), 100);
	
	valuaBank()
	
	if (character.esize <= 1) bee_bank();
	
	
	if(character.rip) return;	
	
	if(character.hp<character.max_hp*.85 || character.mp<=character.max_mp-400) use_hp_or_mp();
	
	if(!attack_mode || character.rip || is_moving(character)) return;
	
	if(item_quantity("mpot1")<20) // item_quantity is defined below
	{
		smart_move({to:"potions",return:true},function(){ buy("mpot1",2500); });
		return;
	};
	if(item_quantity("hpot1")<20) // item_quantity is defined below
	{
		smart_move({to:"potions",return:true},function(){ buy("hpot1",600); });
		return;
	};
	skill3shot(get_nearby_entities());
	clearInterval(u);
},210); // Loops every 1/4 seconds.

function item_quantity(name)
{
	for(var i=0;i<42;i++)
	{
		if(character.items[i] && character.items[i].name==name) return character.items[i].q||0;
	}
	return 0;
}

function death_return(locations){
		if (character.rip || is_moving(character)) return;
		smart_move(locations)
	}


function handle_death()
{
	setTimeout(respawn,25000);
	setTimeout(death_return(locations[character.id]), 26000);
}

function toMerch(){
	if (!is_in_range(get_player("VendorGuy"))) return;
	for (let i = 0; i < 9; i++) {
		let item = "egg"
		i = i.toString()
		let itemName=item+i
		if(!locate_item(itemName)) return false;
		let itemLoc = locate_item(itemName)
		send_item("VendorGuy", itemLoc, character.items[itemLoc]['q']);
	}
	for (let i = 5; i<42; i++) {
		if (!character.items[i]) continue;
		send_item("VendorGuy", i, character.items[i]['q']);
	}return;
}

function toSnek(){
	if(is_moving(character)) return;
	smart_move("halloween");
	setInterval(function(){
		if(is_moving(character)) return;
		xmove(-495,-500);
	},5000);
}




    get_task() {
        if (!this.task) {
            this.task = "some_task_logic"
        }
        else if (this.task == "high") {
            // check back in 30 min... how?
        }
    }

}


char = new Ranger;
char.loop();
botsUp()

//setInterval(parentTargetting(), 2000)