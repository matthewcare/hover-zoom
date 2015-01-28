var Hoverzoom = {
	elems: [],
	zoomArea: null,
	divCreated: null,

	loaded: function () {
		if (document.getElementsByClassName) {
			Hoverzoom.elems = document.getElementsByClassName('hoverzoom')
		} else {
			Hoverzoom.elems = document.querySelectorAll('.hoverzoom')
		};
		Hoverzoom.addListeners();
	},

	addListeners: function () {
		var elemsLength = Hoverzoom.elems.length,
			i = 0;
		if (elemsLength !== 0) {
			for (i; i < elemsLength; i++) {
				if (Hoverzoom.elems[i].addEventListener) {
					Hoverzoom.elems[i].addEventListener('mousemove', function (e) {
						if (!Hoverzoom.divCreated) {
							Hoverzoom.createZoomArea();
							Hoverzoom.divCreated = true;
						}
						Hoverzoom.getMousePosition(this, e);
					})
					Hoverzoom.elems[i].addEventListener('mouseout', function () {
						Hoverzoom.mouseOut();
					})
				} else {
					var elem = Hoverzoom.elems[i];
					Hoverzoom.elems[i].attachEvent('onmousemove', function (e) {
						if (!Hoverzoom.divCreated) {
							Hoverzoom.createZoomArea();
							Hoverzoom.divCreated = true;
						}
						Hoverzoom.getMousePosition(e.srcElement, e);
					})
					Hoverzoom.elems[i].attachEvent('onmouseout', function () {
						Hoverzoom.mouseOut();
					})
				}				
			}
		}
	},

	createZoomArea: function () {
		var div = document.createElement("div");
		div.id = 'zoomArea';
		div.style.width = "500px";
		div.style.height = "500px";
		div.style.position = 'absolute';
		div.style.zIndex = '99999';
		document.body.appendChild(div);
		Hoverzoom.zoomArea = document.getElementById('zoomArea');
	},

	getMousePosition: function (elem, e) {
		var check,
			bBox = elem.getBoundingClientRect(),
			mouseX = e.clientX - bBox.left,
			mouseY = e.clientY - bBox.top,
			naturalDimensions = Hoverzoom.getNaturalDimensions(elem),
			heightMultiplier = -(naturalDimensions.height / (bBox.bottom - bBox.top)),
			widthMultiplier = -(naturalDimensions.width / (bBox.right - bBox.left)),
			positionX = mouseX * widthMultiplier + ((Hoverzoom.zoomArea.getBoundingClientRect().right - Hoverzoom.zoomArea.getBoundingClientRect().left) / 2),
			positionY = mouseY * heightMultiplier + ((Hoverzoom.zoomArea.getBoundingClientRect().bottom - Hoverzoom.zoomArea.getBoundingClientRect().top) / 2);
		Hoverzoom.zoomArea.style.top = e.clientY + document.body.scrollTop + 10 + 'px';
		Hoverzoom.zoomArea.style.left = e.clientX + 10 + 'px';
		check = Hoverzoom.checkPosition(positionX, positionY, naturalDimensions.width, naturalDimensions.height);
		Hoverzoom.zoomArea.style.background = 'url(' + elem.src + ') ' + 'no-repeat';
		Hoverzoom.zoomArea.style.backgroundPosition =  check.X + ' ' + check.Y;		
	},

	getNaturalDimensions: function(DOMelement) {
		var img = new Image();
		img.src = DOMelement.src;
		return {width: img.width, height: img.height};
	},

	checkPosition: function (positionX, positionY, naturalWidth, naturalHeight) {
		var X, Y;
		console.log(-positionY)
		if ((positionY < 0) && (-positionY < (naturalHeight - (Hoverzoom.zoomArea.getBoundingClientRect().bottom - Hoverzoom.zoomArea.getBoundingClientRect().top)))) {
			Y = positionY + 'px';
		} else {
			Y = -positionY < 0 ? 'top' : 'bottom';
		}

		if ((positionX < 0) && (-positionX < (naturalWidth - (Hoverzoom.zoomArea.getBoundingClientRect().right - Hoverzoom.zoomArea.getBoundingClientRect().left)))) {
			X = positionX + 'px';
		} else {
			X = -positionX < 0 ? 'left ' : 'right ';
		}
		return {
				X: X,
				Y: Y
			}
	},

	mouseOut: function () {
		Hoverzoom.zoomArea.style.background = '';
		document.body.removeChild(Hoverzoom.zoomArea);
		Hoverzoom.divCreated = false;
	}
}

if (window.addEventListener) {
	window.addEventListener('load', function () {
		Hoverzoom.loaded()
	})
} else {
	window.attachEvent('onload', function () {
		Hoverzoom.loaded()
	})
}