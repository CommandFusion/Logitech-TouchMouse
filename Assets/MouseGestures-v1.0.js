function onMouse(horizontalSpeed, verticalSpeed){
			
			//scales down iViewer gesture velocity
			var x = Math.abs(horizontalSpeed/16)	
			var y = Math.abs(verticalSpeed/16)
			
			//calculates mouse speed
			var xSpeed = (horizontalSpeed >= 0) ? (Math.round(x - (32 * Math.sin(x)*(Math.PI/128)))) : (255 - (Math.round(x - (32 * Math.sin(x)*(Math.PI/128)))))
			var ySpeed = (verticalSpeed >= 0) ? (Math.round(y - (32 * Math.sin(y)*(Math.PI/128)))) : (255 - (Math.round(y - (32 * Math.sin(y)*(Math.PI/128)))))
			
			//determine movement directions
			var xDirection = (horizontalSpeed >= 0) ? "\x00\x00\x00" : "\xFF\xFF\xFF"
			var yDirection = (verticalSpeed >= 0) ? "\x00\x00\x00" : "\xFF\xFF\xFF"
			
			//sends both axis movement message
			CF.send("mouseUDP",
				"\x00\x00\x00\x06" + //horizontal movement command
				xDirection +
				String.fromCharCode(xSpeed) + 
				"\x00\x00\x00\x00\x00\x00\x00\x00"
				)
			CF.send("mouseUDP",
				"\x00\x00\x00\x07" + //vertical movement command
				yDirection +
				String.fromCharCode(ySpeed) + 
				"\x00\x00\x00\x00\x00\x00\x00\x00"
				)
}

function disconnect(){
	CF.runMacro("HideAll")
	CF.runMacro("ReleaseModifiers")
	CF.setSystemProperties("mouseTCP", {
			enabled: false,
			address: "0.0.0.0"})
		CF.setSystemProperties("mouseUDP", {
			enabled: false,
			address: "0.0.0.0"})
			}


function onServerSelection(join, value, token){
	var ip = mouseServerInstances[/l1:(.+):d10/.exec(join)[1]].addresses[0]
	CF.setSystemProperties("mouseTCP", {
		enabled: true,
		address: ip})
	CF.setSystemProperties("mouseUDP", {
		enabled: true,
		address: ip})
}

var mouseServerInstances = [];

function performLookup(){
		mouseServerInstances.splice(0, mouseServerInstances.length);
		CF.listRemove("l1")
		CF.startLookup("_iTouch._tcp.", "", function(addedServices, removedServices, error) {
		CF.log("Lookup started")
		try {
			// add services
	        addedServices.forEach(function(service) {
		 		CF.log("New Server instance [" + mouseServerInstances.length + "]: " + service.name);
				mouseServerInstances.push(service);
				CF.listAdd("l1", [{"s10": service.name}])
				var listIndex = "l1:" + (mouseServerInstances.length - 1) + ":d10"
				CF.watch(CF.ObjectPressedEvent, listIndex, onServerSelection)
		 	});
		}
		catch (e) {
			CF.log("Exception in Server services processing: " + e);
		}
		
    });
	setTimeout(function(){
			CF.stopLookup("_iTouch._tcp.", "")
			CF.log("Lookup halted")}, 2000)
}

function onManualInput(theJoin, theString){
	var regex = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/
	var validateIP = regex.exec(theString)
	
	if (validateIP){
		CF.setSystemProperties("mouseTCP", {
			enabled: true,
			address: theString})
		CF.setSystemProperties("mouseUDP", {
			enabled: true,
			address: theString})
	}
	else CF.setJoins([
		{join: "s12", value: "Not a valid IP address."},
		{join: "d12", value: 1}])
}

function onConnectionChange(system, connected, remote) {
	if (connected) {
		CF.flipToPage("Touchpad")
		CF.setJoins([
		{join: "s12", value: "Connecting..."},
		{join: "d12", value: 1}])
		setTimeout(function(){CF.setJoin("d12", 0)}, 1000)
		}
		else {
			CF.runMacro("HideAll")
			CF.runMacro("ReleaseModifiers")
			CF.setSystemProperties("mouseTCP", {
				enabled: false,
				address: "0.0.0.0"})
			CF.setSystemProperties("mouseUDP", {
				enabled: false,
				address: "0.0.0.0"})
			CF.flipToPage("ServerSelection")
			CF.setJoins([
				{join: "s11", value: ""},
				{join: "s12", value: "Disconnecting..."},
				{join: "d12", value: 1}])
			setTimeout(function(){CF.setJoin("d12", 0)}, 1000)
			performLookup()
			}
}

CF.userMain = function () {
	CF.watch(CF.ConnectionStatusChangeEvent, "mouseTCP", onConnectionChange)
	CF.watch(CF.KeyboardDownEvent, onManualInput)
	performLookup()
	};	