// Test tool for the N8N callback endpoint
// Save this file as test_callback.js in a tools or scripts directory
// Run with: node test_callback.js

const axios = require("axios");

// Configuration - modify as needed
const config = {
	baseUrl: "https://nexiosdigital.com", // Use your actual domain
	callbackPath: "/api/n8n-callback", // Callback endpoint
	testPath: "/api/test-callback", // Test endpoint
	token: "dasdaksmda", // Token value from your N8N_API_TOKEN env variable
	useToken: true, // Whether to include the Authorization header
	useTestEndpoint: false, // Set to true to use test endpoint instead of actual callback
};

async function testCallback() {
	// Determine which endpoint to use
	const url =
		config.baseUrl +
		(config.useTestEndpoint ? config.testPath : config.callbackPath);

	// Create test data matching the expected format
	const testData = {
		conversation_id: "test-conversation-" + Date.now(),
		original_message: "This is a test message from the callback testing tool",
		processed_response:
			"This is a simulated response from the N8N workflow. The system is working correctly if you see this message.",
		timestamp: new Date().toISOString(),
		metadata: {
			source: "manual-test",
			test_id: Date.now().toString(),
			environment: "development",
		},
	};

	// Setup request headers
	const headers = {
		"Content-Type": "application/json",
	};

	// Add authorization header if configured
	if (config.useToken) {
		headers["Authorization"] = `Bearer ${config.token}`;
	}

	console.log(`\n=== N8N CALLBACK TEST ===`);
	console.log(`URL: ${url}`);
	console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
	console.log(`Payload: ${JSON.stringify(testData, null, 2)}`);
	console.log(`\nSending request...`);

	try {
		// Send the request
		const startTime = Date.now();
		const response = await axios.post(url, testData, { headers });
		const endTime = Date.now();

		console.log(`\n=== RESPONSE RECEIVED (${endTime - startTime}ms) ===`);
		console.log(`Status: ${response.status}`);
		console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
		console.log(`Body: ${JSON.stringify(response.data, null, 2)}`);

		// Success message
		console.log(`\n✅ TEST COMPLETED SUCCESSFULLY`);
	} catch (error) {
		console.error(`\n❌ ERROR OCCURRED`);

		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			console.error(`Status: ${error.response.status}`);
			console.error(
				`Headers: ${JSON.stringify(error.response.headers, null, 2)}`
			);
			console.error(
				`Response data: ${JSON.stringify(error.response.data, null, 2)}`
			);
		} else if (error.request) {
			// The request was made but no response was received
			console.error(`No response received from server.`);
			console.error(`Request details: ${error.request}`);
		} else {
			// Something happened in setting up the request that triggered an Error
			console.error(`Error setting up request: ${error.message}`);
		}

		// Additional error information
		if (error.config) {
			console.error(`\nRequest Configuration:`);
			console.error(`URL: ${error.config.url}`);
			console.error(`Method: ${error.config.method.toUpperCase()}`);
			console.error(
				`Headers: ${JSON.stringify(error.config.headers, null, 2)}`
			);
			console.error(`Timeout: ${error.config.timeout}ms`);
		}
	}
}

// Execute the test
testCallback();
