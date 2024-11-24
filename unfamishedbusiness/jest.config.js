module.exports = {
	testEnvironment: 'jsdom',
	transformIgnorePatterns: [
		'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|@react-navigation|@rneui)|axios/)',
	],
	moduleNameMapper: {
		'\\.(css|less)$': '<rootDir>/src/styleMock.js',
	},
	//setupFiles: ['<rootDir>/src/jest.setup.js'],
};
