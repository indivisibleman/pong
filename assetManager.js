function AssetManager() {
	this.successCount = 0;
	this.errorCount = 0;
	this.cache = {};
	this.imageQueue = [];
}

AssetManager.prototype.queueImage = function(path) {
	this.imageQueue.push(path);
}

AssetManager.prototype.downloadAll = function(downloadCallback) {
	if(this.imageQueue.length === 0) {
		downloadCallback();
	}
	
	for(var i = 0; i < this.imageQueue.length; i++) {
		var path = this.imageQueue[i];
		var img = new Image();
		var that = this;
		
		img.addEventListener("load", function() {
			console.log(this.src + ' is loaded');
			that.successCount += 1;
			
			if(that.isDone()) {
				downloadCallback();
			}
		}, false);
		
		img.addEventListener("error", function() {
			that.errorCount += 1;
			
			if (that.isDone()) {
				downloadCallback();
			}
		}, false);
		
		img.src = path;
		this.cache[path] = img;
	}
}

AssetManager.prototype.getAsset = function(path) {
	return this.cache[path];
}

AssetManager.prototype.isDone = function() {
	return (this.imageQueue.length == this.successCount + this.errorCount);
}