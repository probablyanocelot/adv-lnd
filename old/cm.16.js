log( "16 - cm.16.js" )
character.on("cm", function (m) {
	if (is_friendly(m.name)) {
		// Make sure the message is from a trusted character
		log(m.message);  // Do something with the message!
		switch (m.message.code) {
			case "move":
				smart_move(m.message.loc)
			case "incoming":
				smart_move(getPosition(m.name)).then(
					success => {
						change_target(get_player(m.name).target)
						let target = get_current_target();
						a = setInterval(rangerPVP(target), 220)
						if (target.rip || !target) clearInterval(a);
					},
					failure => {
						xmove(getPosition(m.name))
						change_target(get_player(m.name).target)
						let target = get_current_target();
						a = setInterval(rangerPVP(target), 220)
						if (target.rip || !target) clearInterval(a);
					}
				)

		}
	}
		
	}
)


function group_cm(my_code, my_loc) {
    let rangers = ["cannaMace", 'camelCase', 'couplaGrapes'];
    for (let ranger in rangers) {
		if (ranger == character.id) continue;
        send_cm(rangers[ranger], { code: my_code, loc: my_loc })
    }
}

character.on("incoming",function(data){
	if (data.damage> 50 && data.source != "mluck" && get_player(data.actor)){
		game_log("Incoming! "+data.damage+" from" + data.actor);
		savePosition();
		group_cm("incoming");
		change_target(get_player(data.actor));
		let target = get_current_target();
		let a = setInterval(rangerPVP(target), 220)
		if (!target || target.rip) clearInterval(a);		
	}
})

function rangerPVP(target) {
	if (!target || target.rip) return;
	if (is_in_range(target) && !is_on_cooldown("huntersmark") && character.mp>G.skills.huntersmark.mp) use_skill("huntersmark", target);
	if (is_in_range(data.actor) && !is_on_cooldown("supershot") && character.mp>G.skills.supershot.mp) use_skill("supershot", target);
	if (is_in_range(target)) attack(target)
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