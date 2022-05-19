log("15 - Bots.15.js")
// BOTS
const bots = {"r1":{name:"cannaMace", slot:30}, "r2":{name:"couplaGrapes", slot:30}}


// send_cm("CHARACTERNAME",{a:1,b:2,c:"something"});
// to send messages, objects to your character
//character.on("cm",function(m){
//	switch(m.name){
//		case "camelCase":
//		case "couplaGrapes":
//		case "VendorGuy":
//		case "cannaMace":
//		case "Pokehontas":
//		case "Atlus":
//		case "Diocles":
//		case "Mommy":
//			if (m.name == "Pokehontas"){smart_move(m.message)};
//			break;
	// Make sure the message is from a trusted character
		
//		log(m.message);  // Do something with the message!
//	}
//})


function botUp(){
	start_character(bots.r1.name, bots.r1.slot);
	//start_character(bots.r2.name, bots.r2.slot);
	return;
}	

let charDict = {
	"r3": ["cannaMace", "couplaGrapes", "camelCase"]
} 

function sendInvites() {
	let activeChars = Object.keys(get_active_characters())
	for (let idx in activeChars) {
		let char = activeChars[idx];
		if ( char == character.name) continue;
		send_party_invite(char)
	}
}

function botDown(){
	stop_character(bots.r1.name, bots.r1.slot);
	//stop_character(bots.r2.name, bots.r2.slot);
	return;
}	



function slayer()
{
    try 
    {
        if(!character.s.monsterhunt)
        {
            smart_move("monsterhunter");
            parent.socket.emit("monsterhunt");
            return;
        }
        
        //guaranteed to have a monster hunt here.
        mhTarget = character.s.monsterhunt.id;
        mhCount = character.s.monsterhunt.c;
        log ("Your monster hunt: " + mhTarget + " (" + mhCount + ")");
	}
    catch (e) 
    {
        console.error(e);
    }
}

function valuaBank() {
	for (var idx of character.items) {
		if (!idx) continue;
		switch (idx["name"]) {
			case "suckerpunch":
				change_server("US","III")
				break;
			case "ink":
				bee_bank()
		} 
	}
}