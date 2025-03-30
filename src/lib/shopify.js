import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';

// Create a new Apollo Client instance for Shopify Storefront API
console.log('Creating Apollo client with:');

// Auto-detect and correct swapped credentials
let originalApiUrl = process.env.NEXT_PUBLIC_SHOPIFY_API_URL;
let originalAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;
let apiUrl = originalApiUrl;
let accessToken = originalAccessToken;
let credentialsSwapped = false;

// Function to check if a string looks like a URL
function looksLikeUrl(str) {
  return str && typeof str === 'string' && (str.startsWith('http') || str.includes('myshopify.com'));
}

// Function to check if a string looks like a token
function looksLikeToken(str) {
  return str && typeof str === 'string' && str.length >= 20 && /^[a-zA-Z0-9]+$/.test(str);
}

// Check if credentials appear to be swapped
if (looksLikeToken(originalApiUrl) && looksLikeUrl(originalAccessToken)) {
  console.warn('DETECTED SWAPPED CREDENTIALS! Auto-correcting...');
  console.warn('API URL and Access Token appear to be swapped. Swapping them back automatically.');
  
  // Swap them back
  apiUrl = originalAccessToken;
  accessToken = originalApiUrl;
  credentialsSwapped = true;
  
  console.log('After swap correction:');
  console.log('Using API URL:', apiUrl);
  console.log('Using Access Token:', accessToken ? 'AVAILABLE (value hidden)' : 'MISSING');
}

// Validate the API URL, whether original or swapped
let isValidUrl = false;
let safeApiUrl = null;

try {
  // Check if API URL is valid
  if (apiUrl && typeof apiUrl === 'string' && apiUrl.startsWith('http')) {
    const url = new URL(apiUrl);
    isValidUrl = url.protocol === 'https:' && url.hostname.includes('myshopify.com');
    
    if (!isValidUrl) {
      console.error('API URL is not a valid Shopify URL:', apiUrl);
      console.error('URL should follow the pattern: https://your-store.myshopify.com/api/2023-07/graphql.json');
    } else {
      console.log('API URL is valid');
      safeApiUrl = apiUrl; // Only set the safe URL if it's valid
    }
  } else {
    console.error('API URL is not defined or has invalid format in environment variables');
  }
} catch (e) {
  console.error('Error parsing API URL:', e.message);
  console.error('Your current API URL may not be a valid URL. Please check the format.');
  isValidUrl = false;
}

// Set a fallback URL that won't cause a client-side error but will fail gracefully
// This prevents the app from crashing when trying to initialize Apollo
if (!safeApiUrl) {
  safeApiUrl = 'https://example.com/invalid-placeholder-url';
  console.warn('Using a placeholder API URL. API requests will fail until proper credentials are provided.');
}

// Check Access Token
let safeAccessToken = '';
if (!accessToken) {
  console.error('Access token is not defined in environment variables');
} else {
  console.log('Access Token available:', true);
  
  // Check if the token looks valid (basic check)
  if (accessToken.length < 20) {
    console.warn('Access token looks unusually short. Shopify tokens are typically longer.');
  } else if (looksLikeUrl(accessToken)) {
    console.warn('Access token looks like a URL. Credentials might be swapped.');
  }
  safeAccessToken = accessToken; // Use the provided token, even if it might be invalid
}

// Create the Apollo client with safe values that won't crash the app
const client = new ApolloClient({
  link: new HttpLink({
    uri: safeApiUrl,
    headers: {
      'X-Shopify-Storefront-Access-Token': safeAccessToken,
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

// Get all collections
export async function getCollections() {
  try {
    console.log('Fetching collections with API URL:', process.env.NEXT_PUBLIC_SHOPIFY_API_URL);
    const { data } = await client.query({
      query: gql`
        query GetCollections {
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      `,
    });
    
    console.log('Collections data received:', data);
    return data.collections.edges.map(({ node }) => node);
  } catch (error) {
    console.error('Error fetching collections:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }
}

// Get a single collection by handle with its products
export async function getCollectionByHandle(handle, filters = {}, first = 20) {
  if (!handle) {
    console.error('Collection handle is required');
    return null;
  }
  
  console.log(`Fetching collection with handle: ${handle}`);
  // Default to COLLECTION_DEFAULT for sorting if not specified
  const { priceMin, priceMax, sortKey = 'COLLECTION_DEFAULT', reverse = false } = filters;
  
  let priceFilter = '';
  if (priceMin && priceMax) {
    priceFilter = `price:>=${priceMin} price:<=${priceMax}`;
  }
  
  try {
    // Simplified query that should work with most Shopify stores
    const { data } = await client.query({
      query: gql`
        query GetCollectionByHandle($handle: String!, $first: Int!) {
          collection(handle: $handle) {
            id
            title
            description
            image {
              url
              altText
            }
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  availableForSale
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                        availableForSale
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        handle,
        first
      },
    });

    if (!data || !data.collection) {
      console.error(`No collection found with handle: ${handle}`);
      return null;
    }

    console.log(`Collection data received for ${handle}:`, {
      id: data.collection.id,
      title: data.collection.title,
      productsCount: data.collection.products.edges.length
    });

    return {
      ...data.collection,
      products: data.collection.products.edges.map(({ node }) => node),
    };
  } catch (error) {
    console.error(`Error fetching collection with handle ${handle}:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}

// Get featured products
export async function getFeaturedProducts(first = 4) {
  try {
    console.log('Fetching featured products...');
    const { data } = await client.query({
      query: gql`
        query GetFeaturedProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                description
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      title
                      priceV2 {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        first,
      },
    });
    
    console.log('Featured products data received:', data);
    return data.products.edges.map(({ node }) => node);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }
}

// Search products
export async function searchProducts(query, first = 20) {
  try {
    const { data } = await client.query({
      query: gql`
        query SearchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      title
                      priceV2 {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        query,
        first,
      },
    });

    return data.products.edges.map(({ node }) => node);
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error);
    return [];
  }
}

// Create a checkout
export async function createCheckout(lineItems) {
  try {
    const { data } = await client.mutate({
      mutation: gql`
        mutation CreateCheckout($lineItems: [CheckoutLineItemInput!]!) {
          checkoutCreate(input: { lineItems: $lineItems }) {
            checkout {
              id
              webUrl
            }
            checkoutUserErrors {
              code
              field
              message
            }
          }
        }
      `,
      variables: {
        lineItems,
      },
    });

    if (data.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
    }

    return data.checkoutCreate.checkout;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

// Get available filters for a collection
export async function getCollectionFilters(handle) {
  try {
    // In a real implementation, you would fetch the available filters from the API
    // For this demo, we'll return some example filters
    
    // For a production app, you'd fetch these dynamically from the Shopify API
    return [
      {
        id: 'size',
        label: 'Size',
        values: ['S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        id: 'color',
        label: 'Color',
        values: ['Black', 'White', 'Red', 'Blue', 'Green'],
      },
    ];
  } catch (error) {
    console.error(`Error fetching filters for collection ${handle}:`, error);
    return [];
  }
}

// Get a single product by handle
export async function getProductByHandle(handle) {
  try {
    console.log(`Fetching product with handle: ${handle}`);
    const { data } = await client.query({
      query: gql`
        query GetProductByHandle($handle: String!) {
          product(handle: $handle) {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            productType
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  priceV2 {
                    amount
                    currencyCode
                  }
                  compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            options {
              id
              name
              values
            }
          }
        }
      `,
      variables: {
        handle,
      },
    });

    if (!data.product) {
      console.error(`No product found with handle: ${handle}`);
      return null;
    }

    // Format the product data
    const product = data.product;
    return {
      ...product,
      images: product.images.edges.map(({ node }) => node),
      variants: product.variants.edges.map(({ node }) => node),
    };
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}
