import '@testing-library/jest-dom';  // Import jest-dom for matchers like .toBeInTheDocument()

// Polyfill fetch and Response (if necessary)
global.fetch = require('node-fetch');
global.Response = require('node-fetch').Response; // Polyfill Response as well
