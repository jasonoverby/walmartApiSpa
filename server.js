const hapi = require('hapi');
const getMatchingProducts = require('./lib/getMatchingProducts');

// Create a server with a host and port
const server = hapi.server({
  host: 'localhost',
  port: 8000,
});

server.route({
  method: 'GET',
  path: '/api/v1/{category}',
  handler: async (request) => {
    // guard against injection attacks
    const category = encodeURIComponent(request.params.category);
    const matchingProducts = await getMatchingProducts(category);
    return matchingProducts;
  },
});

// Start the server
const start = async function () {
  try {
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();
