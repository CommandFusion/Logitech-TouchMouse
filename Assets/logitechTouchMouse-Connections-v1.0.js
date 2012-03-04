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

function onServerSelection(listIndex){
	//sets IP address of the server and enables TCP and UDP systems
	var ipAddress = mouseServerInstances[listIndex].addresses[0]
	CF.setSystemProperties("mouseTCP", {
		enabled: true,
		address: ipAddress})
	CF.setSystemProperties("mouseUDP", {
		enabled: true,
		address: ipAddress})
	connectionTimeout = setTimeout(onTimeout, 5000)
}

var mouseServerInstances = [];	//array to store active servers
var connectionTimeout			//setTimout ID container

function performLookup(){
	//looks for active servers
		mouseServerInstances.splice(0, mouseServerInstances.length);	//empties the array that stores the active servers
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
}

function onTimeout(ip){
	//if the host is not reachable, message the user
	CF.setJoins([{join: "s12", value: "Timeout while trying to connect to the server."}, {join: "d12", value: 1}])
	CF.setSystemProperties("mouseTCP", {
				enabled: false,
				address: "0.0.0.0"})
			CF.setSystemProperties("mouseUDP", {
				enabled: false,
				address: "0.0.0.0"})
}

function onManualInput(theJoin, theString){
	//check if a valid IP address has been entered
	var validateIP = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/
		
	//if valid, set the IP and enable TCP and UDP systems
	if (validateIP.test(theString)){
		CF.setSystemProperties("mouseTCP", {
			enabled: true,
			address: theString})
		CF.setSystemProperties("mouseUDP", {
			enabled: true,
			address: theString})
		connectionTimeout = setTimeout(onTimeout, 5000)
	}
	//if not valid, message the user
	else CF.setJoins([
		{join: "s12", value: "Not a valid IP address."},
		{join: "d12", value: 1}])
}

function onConnectionChange(system, connected, remote) {
	//handles pageflip and subpages
	if (connected) {
		clearTimeout(connectionTimeout)
		CF.log("Connected to " + CF.systems["mouseTCP"].address)
		CF.flipToPage("Touchpad")
		CF.setJoins([
		{join: "s12", value: "Connecting..."},
		{join: "d12", value: 1}])
		setTimeout(function(){CF.setJoin("d12", 0)}, 1000)
		}
		else {
			CF.log("Disconnected from " + CF.systems["mouseTCP"].address)
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
	//set up event watch and perform the initial server lookup
	CF.watch(CF.ConnectionStatusChangeEvent, "mouseTCP", onConnectionChange)
	CF.watch(CF.KeyboardDownEvent, onManualInput)
	performLookup()
	};	