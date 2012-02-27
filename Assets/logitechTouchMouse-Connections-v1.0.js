function disconnect(){
//disables systems on manual disconnection
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
//sets IP address of the server and enables TCP and UDP systems
	CF.log("Connesso!")
	var ip = mouseServerInstances[/l1:(.+):d10/.exec(join)[1]].addresses[0]
	CF.setSystemProperties("mouseTCP", {
		enabled: true,
		address: ip})
	CF.setSystemProperties("mouseUDP", {
		enabled: true,
		address: ip})
}

var mouseServerInstances = [];	//array to store active servers

function performLookup(){
//looks for active servers
		mouseServerInstances.splice(0, mouseServerInstances.length);	//empties the array that stores the active servers
		CF.listInfo("l1", function(list, count) {
			for (var i = 0; i < count; i++) {
				CF.unwatch(CF.ObjectPressedEvent, "l1:" + i + ":d10") //stop watching list joins to avoid multiple triggers on server selection
				}
			CF.listRemove("l1")		//clears server list
			//start looking for active servers
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
			//stop looking for servers after 2 seconds
			setTimeout(function(){
				CF.stopLookup("_iTouch._tcp.", "")
				CF.log("Lookup halted")}, 2000)
		})
}

function onManualInput(theJoin, theString){
	//check if a valid IP address has been entered
	var regex = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/
	var validateIP = regex.exec(theString)
	
	//if valid, set the IP and enable TCP and UDP systems
	if (validateIP){
		CF.setSystemProperties("mouseTCP", {
			enabled: true,
			address: theString})
		CF.setSystemProperties("mouseUDP", {
			enabled: true,
			address: theString})
	}
	//if not valid, notify the user
	else CF.setJoins([
		{join: "s12", value: "Not a valid IP address."},
		{join: "d12", value: 1}])
}

function onConnectionChange(system, connected, remote) {
//handles pageflip and subpages
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