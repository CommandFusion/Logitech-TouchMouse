function onMouse(horizontalSpeed, verticalSpeed){
			
			//scales down iViewer gesture velocity
			var x = Math.min(Math.abs(horizontalSpeed/16), 255)	
			var y = Math.min(Math.abs(verticalSpeed/16), 255)
			
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

function onVerticalScroll(verticalSpeed){
			
			//scales down iViewer gesture velocity
			var y = Math.min(Math.abs(verticalSpeed/8), 255)
			
			//calculates mouse speed
			var ySpeed = (verticalSpeed >= 0) ? (Math.round(y)) : (255 - (Math.round(y)))
			
			//determine movement directions
			var yDirection = (verticalSpeed >= 0) ? "\x00\x00\x00" : "\xFF\xFF\xFF"
			
			//sends both axis movement message
			CF.send("mouseUDP",
				"\x00\x00\x00\x0a" + //vertical movement command
				yDirection +
				String.fromCharCode(ySpeed) + 
				"\x00\x00\x00\x00\x00\x00\x00\x00"
				)
}