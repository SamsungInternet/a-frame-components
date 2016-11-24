AFRAME.registerComponent('clapper', {
	schema: {
		debounce: {
			default: true
		},
		trigger: {
			default: 0.95
		}
	},
	Recording: function (cb) {
		var recorder = null;
		var recording = true;
		var audioInput = null;
		var volume = null;
		var audioContext = null;
		var callback = cb;
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia;

		if(navigator.getUserMedia){
			navigator.getUserMedia({audio:true}, function(e) {
				var AudioContext = window.AudioContext || window.webkitAudioContext;
				this.audioContext = new AudioContext();
				volume = this.audioContext.createGain(); // creates a gain node
				audioInput = this.audioContext.createMediaStreamSource(e); // creates an audio node from the mic stream
				recorder = this.audioContext.createScriptProcessor(2048, 1, 1);
				recorder.onaudioprocess = function(e){
					if(!recording) return;
					var left = e.inputBuffer.getChannelData(0);
					callback(new Float32Array(left));
				};
				audioInput.connect(volume);
				volume.connect(recorder);
				recorder.connect(this.audioContext.destination);
			}.bind(this), function(e){ //failure
				console.log(e);
			});
		} else {
			console.log('getUserMedia not supported in this browser.');
		}
	},
	detectClap: function detectClap(data){
		var t = (new Date()).getTime();
		if (t - this.lastClap < 100) return false;
		var zeroCrossings = 0, highAmp = 0;
		for(var i = 1; i < data.length; i++){
			if(Math.abs(data[i]) > this.data.trigger) highAmp++;
			if(
				data[i] > 0 && data[i-1] < 0 ||
				data[i] < 0 && data[i-1] > 0
			) {
				zeroCrossings++;
			}
		}
		if(highAmp > 20 && zeroCrossings > 30){
			this.lastClap = (new Date()).getTime();
			return true;
		}
		return false;
	},
	init: function () {

		this.lastClap = (new Date()).getTime();
		this.timeout = -1;

		this.Recording.prototype.destroy = function () {
			this.audioContext.destination.disconnect();
			this.audioContext = null;
		};

		var clap = (function clap() {
			this.el.emit('clap');
			this.timeout = -1;
		}).bind(this);

		var clapclap = (function clapclap() {
			this.el.emit('clapclap');
			this.timeout = -1;
		}).bind(this);

		this.rec = new this.Recording(function(data){
			if(this.detectClap(data)){
				clearTimeout(this.timeout);
				if (this.data.debounce) {
					if (this.timeout === -1) {
						this.timeout = setTimeout(clap, 500);
					} else {
						this.timeout = setTimeout(clapclap, 500);
					}
				} else {
					clap();
				}
			}
		}.bind(this));
	},
	remove: function () {
		this.rec.destroy();
		this.rec = null;
	}
});
