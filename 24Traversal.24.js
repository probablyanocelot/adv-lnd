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


function backToTheFarm() {
	if (!farmDefault[character.name].x == character.x && !farmDefault[character.name].y == character.y) {
		smart_move(farmDefault[character.name])
			.then(this.set_current_action('farming'))
	}
	log('BACK TO THE FARM!')
	return
}
