Number.prototype.overflow = function (max) {
	return this.valueOf() - max * parseInt(this.valueOf() / max);
};

Array.prototype.loop = function (name) {
	for (let i = 0; i < this.length; i++) this[i][name](i);
};

Array.prototype.popByIndex = function (index) {
	this.splice(index, 1);
};

const get = id => document.getElementById(id);
const show = id => get(id).classList.add("visible");
const setActive = (id, active=true) => get(id).classList.toggle("active", active);

const randomRange = function (min, max) {
	const value = Math.random() * (max - min) + min;
	return Math.round(value);
};