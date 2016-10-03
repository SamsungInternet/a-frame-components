---
layout: default
styles: ['css/style.css', 'css/highlight.css']
image: https://avatars0.githubusercontent.com/u/21077792?v=3
title: A-Frame Components
repo: https://github.com/SamsungInternet/a-frame-components
author: '<a href="https://twitter.com/sbrowserdevrel" style="color: white; text-decoration: none;">Samsung Internet</a>'
date: Monday May 16th 2016
description: Components used in A-Frame projects which can be reused.
---

### dist/snapshot.js

<p>Adds a button for taking snapshots of your A-Frame scene. ctrl-alt-p works too.</p>

<p>Or use it whenever with a bookmarklet: <a href="javascript:(function(){var script=document.createElement('script');script.src='https://Samsunginternet.github.io/a-frame-components/dist/snapshot.js';script.onload = (function () {document.querySelector('a-scene').setAttribute('snapshot', '');});document.body.appendChild(script);})();" class="bookmarklet lifted">A-Frame Snapshot</a>
</p>

```html
<script src="https://Samsunginternet.github.io/a-frame-components/dist/snapshot.js"></script>
```

```html
<a-scene snapshot>
</a-scene>
```

### dist/clone.js

Component for cloning another entitiy's object3D into this entity.

```html
<script src="https://Samsunginternet.github.io/a-frame-components/dist/clone.js"></script>
```

```html
<a-entity id="clone-me" geometry="primitive: cylinder; height: 0.5; radius: 1.3" rotation="-90 0 0" material="color: grey;"></a-entity>
<a-entity clone="clone-me" position="2 0 0"></a-entity> <!-- Duplicate object moved 2 units across -->
```

### dist/curve.js

Components and Primitives for defining and using curves

```html
<script src="https://Samsunginternet.github.io/a-frame-components/dist/curve.js"></script>
```

```html
	<!-- Points can be defined absolutely -->

	<a-curve id="track1" curve="CatmullRom">
		<a-curve-point position="-60 0 170"></a-curve-point>
		<a-curve-point position="-60 15 260"></a-curve-point>
		<a-curve-point position="0 10 280"></a-curve-point>
		<a-curve-point position="30 10 240"></a-curve-point>
	</a-curve>

	<!-- or they can be relative to the previous point -->
	<a-curve id="track2" curve="CatmullRom">
		<a-curve-point position="0 -4 0">
			<a-curve-point position="-30 8 10">
				<a-curve-point position="-30 -6 30">
					<a-curve-point position="0 8 40">
						<a-curve-point position="0 -2 40">
							<a-curve-point position="0 25 50">
							</a-curve-point>
						</a-curve-point>
					</a-curve-point>
				</a-curve-point>
			</a-curve-point>
		</a-curve-point>
	</a-curve>

	<!-- You can draw the curve (shader is included) -->
	<a-draw-curve curve="#track2" material="shader: line; color: blue;"></a-draw-curve>

	<!-- You can clone geometry along the curve -->
	<a-entity clone-along-curve="curve: #track1; spacing: 6; scale: 1.5 1 2; rotation: 0 0 0;" obj-model="obj: #race-track-obj; mtl: #race-track-mtl;"></a-entity>

```

It provides a javascript api for hooking into scripting.

```js
	// Tries to return the nearest point on the curve.
	// Curves which cross over themselves cause this to break down
	document.getElementById('track1').components.curve.closestPointInLocalSpace(new THREE.Vector3(1,2,3));
```

Events:

* curve-updated - Fired when a curve-point has been changed or added and the curve has been regenerated.

### dist/follow.js

One entity tries to follow another it is damped so if it is close it does not recover as much.

E.g. in this case the camera should point to and try to be behind the pink box

```html
<script src="https://Samsunginternet.github.io/a-frame-components/dist/follow.js"></script>
```

```html
<a-entity look-at="#ship" follow="target: #camera-target;">

		<!-- Disable the default wasd controls we are using those to control the box -->
		<a-camera position="0 2 0" wasd-controls="enabled: false;"></a-camera>
</a-entity>

<a-entity geometry material="color: pink;" wasd-controls>

	<!-- The camera target is an area 4 units behind the box -->
	<a-entity id="camera-target" position="0 0 -4"></a-entity>
</a-entity>
```

### dist/ocean-plane.js

Based on the new material options added to A-Frame which are available in a-frame master

```html
<script src="https://Samsunginternet.github.io/a-frame-components/dist/ocean-plane.js"></script>
```

```html
<a-assets>
	<img id="water-normal" src="https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg" crossorigin="anonymous" />
	<img id="skysphere" src="some-equirectangular-image.jpg" crossorigin="anonymous" />
</a-assets>

<a-sky src="#skysphere" position="0 -1 0" rotation="0 -90 0"></a-sky>

<a-ocean-plane material="normalMap: #water-normal; sphericalEnvMap: #skysphere;"></a-ocean-plane>
```


