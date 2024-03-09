module.exports = {
	globDirectory: 'www/',
	globPatterns: [
		'**/*.{js,txt,ttf,svg,png,html,json,css}'
	],
    globIgnores: ['service-worker.js'],
    swSrc: 'www/service-worker.js',
	swDest: 'www/service-worker.js',
};
