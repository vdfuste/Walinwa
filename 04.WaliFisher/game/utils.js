Number.prototype.overflow = function (max) {
	return this.valueOf() - max * parseInt(this.valueOf() / max);
};

Array.prototype.loop = function (name) {
	for (let i = 0; i < this.length; i++) this[i][name](i);
};

Array.prototype.popByIndex = function (index) {
	this.splice(index, 1);
};

const randomRange = function (min, max) {
	const value = Math.random() * (max - min) + min;
	return Math.round(value);
};