const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
let productsUpdatedLastAt;
const msPerDay = 86400000;
const updateInterval = msPerDay;
const productsCachePath = path.join(__dirname, '../data/products.json');

const delay = ms => (
  new Promise(resolve => setTimeout(resolve, ms))
);

const getIds = async () => {
  const response = await axios.get('https://gist.github.com/daniyalzade/f7e0d469be9b8a132f9b');
  // parses Github page to retrieve ids within table
  const lines = response.data.split('<tbody>')[1].split('</tbody>')[0].split('\n');

  // ids are 8 digit chars
  return lines.filter(line => /\d{8}/.test(line))
    .map(line => line.match(/\d{8}/)[0]);
};

const getProductData = async (id) => {
  const walmartUrl = 'http://api.walmartlabs.com/v1/items';
  // default apiKey will be used unless PATH variable is set for WALMART_API_KEY
  const apiKey = process.env.WALMART_API_KEY || 'kjybrqfdgp3u4yv2qzcnjndj';
  // returns promise that can be awaited elsewhere
  return axios.get(`${walmartUrl}/${id}?format=json&apiKey=${apiKey}`);
};

const productDataIsCurrent = () => (
  // updateInterval set to one day
  Date.now() - productsUpdatedLastAt < updateInterval);

const getProductsFromCache = async () => {
  if (productDataIsCurrent()) {
    const productsJson = await readFile(productsCachePath, 'utf8');
    return JSON.parse(productsJson);
  }

  return [];
};

const getProducts = async () => {
  // scrape Github page to retrieve ids
  const ids = await getIds();
  const cachedProducts = await getProductsFromCache();

  // retrieve products from server
  if (cachedProducts.length === 0) {
    const products = [];

    // set new timestamp since products are being updated
    productsUpdatedLastAt = Date.now();

    const pushProductToProducts = async (id) => {
      const productDataResponse = await getProductData(id);
      // if data is returned, operation was successful
      if (productDataResponse.data) {
        products.push(productDataResponse.data);
      }
    };

    // add each product to array of products
    // must be done serially to minimize throttling
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      try {
        await pushProductToProducts(id);
      } catch (err) {
        // if req is throttled, waits 300ms and tries again
        await delay(300);
        await pushProductToProducts(id);
      }
    }

    const productsJSON = JSON.stringify(products, null, 2);
    // update products cache
    await writeFile(productsCachePath, productsJSON);
    return products;
  }

  return cachedProducts;
};

// return products that match the category from the path params
const getMatchingProducts = async (category) => {
  const products = await getProducts();

  if (category !== 'all') {
    const matchingProducts = products.filter((product) => {
      const { longDescription, shortDescription } = product;
      // some products do not have a shortDescription property
      // & others do not have a longDescription property
      const description = `${longDescription} ${shortDescription}`;
      // to allow for partial matches
      const regex = new RegExp(category.toLowerCase());
      return description.toLowerCase().match(regex);
    });

    return matchingProducts;
  }

  return products;
};

module.exports = getMatchingProducts;
