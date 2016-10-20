var MAX_DELTA = 0.2;

var vS = 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}';
var fS = '\nuniform samplerCube cubemapTexture;\nuniform vec2 resolution;\n\nvoid main( void )\n{\n	vec2 texCoord = gl_FragCoord.xy / resolution;\n	vec2 thetaphi = ((texCoord * 2.0) - vec2(1.0)) * vec2(3.1415926535897932384626433832795, 1.5707963267948966192313216916398);\n	vec3 rayDirection = vec3(cos(thetaphi.y) * cos(thetaphi.x), sin(thetaphi.y), cos(thetaphi.y) * sin(thetaphi.x));\n	gl_FragColor = textureCube(cubemapTexture, rayDirection);\n}\n	';

// Icon by Fabián Alexis
// https://commons.wikimedia.org/wiki/File:Antu_folder-camera.svg
var icon = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m401.94 543.64c-.422-.413-.932-.619-1.528-.619h-1.892l-.431-1.122c-.107-.27-.303-.502-.587-.697-.284-.195-.576-.293-.874-.293h-4.324c-.298 0-.59.098-.874.293-.284.195-.48.428-.587.697l-.431 1.122h-1.892c-.597 0-1.106.206-1.529.619-.422.413-.633.911-.633 1.494v7.395c0 .583.211 1.081.633 1.494.422.413.932.619 1.529.619h11.89c.597 0 1.106-.206 1.528-.619.422-.413.633-.911.633-1.494v-7.395c0-.583-.211-1.081-.633-1.494m-4.801 7.804c-.74.724-1.631 1.085-2.673 1.085-1.042 0-1.932-.362-2.673-1.085-.74-.724-1.111-1.594-1.111-2.612 0-1.018.37-1.889 1.111-2.612.74-.724 1.631-1.085 2.673-1.085 1.042 0 1.932.362 2.673 1.085.74.724 1.111 1.594 1.111 2.612 0 1.018-.37 1.889-1.111 2.612m-2.673-4.989c-.67 0-1.243.232-1.719.697-.476.465-.714 1.025-.714 1.68 0 .655.238 1.215.714 1.68.476.465 1.049.697 1.719.697.67 0 1.243-.232 1.719-.697.476-.465.714-1.025.714-1.68 0-.655-.238-1.215-.714-1.68-.476-.465-1.049-.697-1.719-.697" transform="matrix(.78637 0 0 .78395-302.25-421.36)" fill="#fff"/></svg>') + '")';

/**
 * WASD component to control entities using WASD keys.
 */
AFRAME.registerComponent('snapshot', {
	schema: {
		width: {default: 4096},
		height: {default: 2048}
	},

	init: function () {
		this.sceneEl = this.el.sceneEl || this.el;

		this.onKeyDown = (function (event) {
			if(event.altKey && event.ctrlKey && (event.code === 'keyP' || event.keyCode === 80)) {
				this.snapshot();
			}
		}.bind(this));
		this.attachKeyEventListeners();
	},

	tick: function () {
		if (!this.button) {
			var target = document.querySelector('.a-enter-vr');
			if (target) {
				this.button = document.createElement('button');
				this.button.classList.add('a-enter-vr-button');
				this.button.style.backgroundImage = icon;
				this.button.style.backgroundSize = '80%';
				this.button.addEventListener('click', this.snapshot.bind(this));
				target.appendChild(this.button);

				Array.from(target.getElementsByClassName('a-enter-vr-button')).forEach(function (el) {
					el.style.float = 'right';
					el.style.position = 'relative';
					el.style.marginLeft = '2px';
				})
			}
		}
	},

	update: function () {
		this.cubeCamera = new AFRAME.THREE.CubeCamera(0.01, 100000, this.data.height);

		// Get sceneEl
		this.material = new AFRAME.THREE.ShaderMaterial({

			uniforms: {
				cubemapTexture: this.cubeCamera.renderTarget.texture ,
				resolution: { value: new AFRAME.THREE.Vector2(this.data.width, -this.data.height) },
			},
			vertexShader: vS,
			fragmentShader: fS
		});
	},

	remove: function () {
		this.removeKeyEventListeners();
		if (this.button) {
			this.button.parentNode.removeChild(this.button);
		}
	},

	attachKeyEventListeners: function () {
		window.addEventListener('keydown', this.onKeyDown);
	},

	removeKeyEventListeners: function () {
		window.removeEventListener('keydown', this.onKeyDown);
	},

	snapshot: function () {
		var scene = this.sceneEl.object3D;
		var renderer = this.sceneEl.renderer;
		var camScale = 0.15;

		if (window.renderOrigin) {
			this.cubeCamera.position.copy(window.renderOrigin);
		} else {
			this.cubeCamera.position.copy(this.sceneEl.camera.getWorldPosition());
		}
		scene.add(this.cubeCamera);
		this.cubeCamera.updateCubeMap(renderer, scene);

		var orthoCamera = new AFRAME.THREE.OrthographicCamera(0.5 * camScale * this.data.width / -this.data.height, 0.5 * camScale * this.data.width / this.data.height, camScale * 0.5, camScale * -0.5, 0.1, 100);
		this.sceneEl.camera.add(orthoCamera);
		renderer.render(scene, orthoCamera);
		var plane = new AFRAME.THREE.Mesh(new AFRAME.THREE.PlaneGeometry(camScale * this.data.width / this.data.height, camScale * 1), this.material);
		orthoCamera.add(plane);
		plane.position.set(0, 0, -1);

		// hack to ensure material gets rendered
		var chromeMaterial = new AFRAME.THREE.MeshLambertMaterial({ color: 0xffffff, envMap: this.cubeCamera.renderTarget });
		plane.material = chromeMaterial;

		requestAnimationFrame(function () {

			plane.material = this.material;
			var old = renderer.getSize();

			renderer.setSize(this.data.width, this.data.height);
			renderer.render(scene, orthoCamera);
			window.open(renderer.domElement.toDataURL());
			renderer.setSize(old.width, old.height);

			this.sceneEl.camera.remove(orthoCamera);

		}.bind(this));
	}

});
