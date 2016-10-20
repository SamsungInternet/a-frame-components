AFRAME.registerComponent('fire-item', {
	schema: {
		el: {type: 'selector'},
		on: {default: 'click'},
	},
	init: function() {
		this.events = [];
		this.fire = this.fire.bind(this);
	},
	update: function (el) {
		this.removeEventListeners();
		this.addEventListeners();
		this.data.el.setAttribute('visible', false);
	},
	addEventListeners: function () {
		this.events.push(this.data.on);
		this.el.addEventListener(this.data.on, this.fire);
	},
	removeEventListeners: function () {
		window.removeEventListener(this.events.pop(), this.fire);
	},
	fire: function () {
		var newEl = this.data.el.cloneNode(true);
		var camera = document.querySelector('a-camera').object3D;
		var velocity = new THREE.Vector3(0, 0, -8);
		var se = this.el.sceneEl;
		velocity.applyEuler(camera.rotation);
		newEl.setAttribute('velocity',
						   velocity.x + ' ' +
						   (velocity.y + 2) + ' ' +
						   velocity.z
						  );
		newEl.setAttribute('position',
						   camera.position.x + ' ' +
						   (camera.position.y - 0.5) + ' ' +
						   camera.position.z
						   );
		se.appendChild(newEl);
		setTimeout(function () {
			se.removeChild(newEl);
		}, 10000);
	}
});