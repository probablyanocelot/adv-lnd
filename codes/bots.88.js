log("88")
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

function sendInvites(){
	send_party_invite(bots.r1.name);
	send_party_invite(bots.r2.name);
	send_party_invite("VendorGuy");
	return;
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



function getPosition(id) {
    if(parent.entities[id]) return parent.entities[id]
    return get(`${id}_position`) ?? undefined
}

function savePosition() {
    return set(`${character.id}_position`, {
        server: {
            region: server.region,
            id: server.id
        },
        time: new Date().toISOString(),
        in: character.in,
        map: character.map,
        x: character.x,
        y: character.y
    })
}