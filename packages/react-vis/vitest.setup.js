import 'regenerator-runtime/runtime';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

HTMLCanvasElement.prototype.getContext = () => ({
	arc() {},
	beginPath() {},
	clearRect() {},
	closePath() {},
	fill() {},
	lineTo() {},
	moveTo() {},
	rect() {},
	scale() {},
	setLineDash() {},
	stroke() {},
	fillStyle: '',
	lineWidth: 1,
	strokeStyle: ''
});
