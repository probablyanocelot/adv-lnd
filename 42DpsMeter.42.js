
// ########### DPS METER ###########


let dpsInterval = 10000;
let damageSums = {};
let damageLog = [];

setInterval(function() {
  update_dpsmeter();
}, 100);
function init_dpsmeter() {

  let $ = parent.$;
  let brc = $('#bottomrightcorner');

  brc.find('#dpsmeter').remove();

  let dps_container = $('<div id="dpsmeter"></div>').css({
    fontSize: '28px',
    color: 'white',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px',
	width: "100%"
  });
	
  //vertical centering in css is fun
  let dpsmeter = $('<div id="dpsmetercontent"></div>')
    .css({
      //display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html("")
    .appendTo(dps_container);

  brc.children().first().after(dps_container);
}



function updateTimerList()
{
	let $ = parent.$;
	
	let listString = '<table style="border-style: solid;" border="5px" bgcolor="black" align="right" cellpadding="5"><tr align="center"><td colspan="2">Damage Meter</td></tr><tr align="center"><td>Name</td><td>DPS</td></tr>';
	
	if(parent.party_list != null && character.party != null)
	{
		for(id in parent.party_list)
		{
			let partyMember = parent.party_list[id];
			let dps = getDPS(partyMember);
			listString = listString + '<tr align="left"><td align="center">' + partyMember + '</td><td>' + dps + '</td></tr>';
		}
	}
	else
	{
		let dps = getDPS(character.name);
		listString = listString + '<tr align="left"><td align="center">' + character.name + '</td><td>' + dps + '</td></tr>';
	}
	
	if(parent.party_list != null && character.party != null)
	{
		let dps = getTotalDPS();
		listString = listString + '<tr align="left"><td>' + "Total" + '</td><td>' + dps + '</td></tr>';
	}
	
	$('#' + "dpsmetercontent").html(listString);
}


function update_dpsmeter() {
	updateTimerList();
}


init_dpsmeter(5)

function getDPS(partyMember)
{
	let entry = damageSums[partyMember];
	let dps = 0;
	
	if(entry != null)
	{
		let elapsed = new Date() - entry.startTime;

		dps = parseFloat(Math.round((entry.sumDamage/(elapsed/1000)) * 100) / 100).toFixed(2);
	}
	return dps;
}

function getTotalDPS()
{	
	let minStart;
	let sumDamage  = 0;
	let dps = 0;
	for(let id in damageSums)
	{
		let entry = damageSums[id];
		
		if(minStart == null || entry.startTime < minStart)
		{
			minStart = entry.startTime;
		}
		
		sumDamage += entry.sumDamage;
	}
	
	if(minStart != null)
	{
		let elapsed = new Date() - minStart;

		dps = parseFloat(Math.round((sumDamage/(elapsed/1000)) * 100) / 100).toFixed(2);
	}
	
	return dps;
}

//Clean out an pre-existing listeners
if (parent.prev_handlersdpsmeter) {
    for (let [event, handler] of parent.prev_handlersdpsmeter) {
      parent.socket.removeListener(event, handler);
    }
}

parent.prev_handlersdpsmeter = [];

//handler pattern shamelessly stolen from JourneyOver
function register_dpsmeterhandler(event, handler) 
{
    parent.prev_handlersdpsmeter.push([event, handler]);
    parent.socket.on(event, handler);
};

function dpsmeterHitHandler(event)
{
	if(parent != null)
	{
		let attacker = event.hid;
		let attacked = event.id;

		let attackerEntity = parent.entities[attacker];
		
		
		
		if(attacker == character.name)
		{
			attackerEntity = character;
		}
		
		if((attackerEntity.party != null || attacker == character.name) || attackerEntity.party == character.party)
		{
			if(event.damage != null)
			{
				let attackerEntry = damageSums[attacker];
				
				if(attackerEntry == null)
				{
					let entry = {};
					entry.startTime = new Date();
					entry.sumDamage = 0;
					damageSums[attacker] = entry;
					attackerEntry = entry;
				}
				
				attackerEntry.sumDamage += event.damage;
				
				damageSums[attacker] = attackerEntry;
			}
		}
	}
}


register_dpsmeterhandler("hit", dpsmeterHitHandler);
