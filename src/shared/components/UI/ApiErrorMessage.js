import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ApiErrorMessage({ apiUrl }) {
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [possibleSwappedCredentials, setPossibleSwappedCredentials] = useState(false);
  const [autoFixedCredentials, setAutoFixedCredentials] = useState(false);
  
  // Function to check if a string looks like a URL
  function looksLikeUrl(str) {
    return str && typeof str === 'string' && (str.startsWith('http') || str.includes('myshopify.com'));
  }
  
  // Function to check if a string looks like a token
  function looksLikeToken(str) {
    return str && typeof str === 'string' && str.length >= 20 && /^[a-zA-Z0-9]+$/.test(str);
  }
  
  useEffect(() => {
    // Try to detect if credentials might be swapped
    const originalApiUrl = process.env.NEXT_PUBLIC_SHOPIFY_API_URL;
    const originalAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;
    
    // Check for swapped credentials
    if (looksLikeToken(originalApiUrl) && looksLikeUrl(originalAccessToken)) {
      console.log("Detected swapped credentials in ApiErrorMessage");
      setPossibleSwappedCredentials(true);
      setAutoFixedCredentials(true);
    }
    
    // Additional check if API URL doesn't look like a URL
    if (apiUrl && !apiUrl.startsWith('http') && apiUrl.length >= 20 && /^[a-zA-Z0-9]+$/.test(apiUrl)) {
      setPossibleSwappedCredentials(true);
    }
    
    // Check if access token looks like a URL
    const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;
    if (accessToken && accessToken.includes('myshopify.com') && accessToken.includes('http')) {
      setPossibleSwappedCredentials(true);
    }
  }, [apiUrl]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] text-center px-4 py-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm max-w-xl w-full">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 text-left">
            <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Unable to connect to the Shopify API. This could be due to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Missing or invalid Shopify API credentials</li>
                <li>Network connectivity issues</li>
                <li>Shopify API service disruption</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {possibleSwappedCredentials && (
        <div className={`${autoFixedCredentials ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'} border-l-4 p-4 mb-6 rounded shadow-sm max-w-xl w-full`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {autoFixedCredentials ? (
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 text-left">
              <h3 className={`text-sm font-medium ${autoFixedCredentials ? 'text-blue-800' : 'text-orange-800'}`}>
                {autoFixedCredentials ? 'Swapped Credentials Auto-Fixed!' : 'Possible Swapped Credentials Detected!'}
              </h3>
              <div className={`mt-2 text-sm ${autoFixedCredentials ? 'text-blue-700' : 'text-orange-700'}`}>
                {autoFixedCredentials ? (
                  <>
                    <p>We detected that your API URL and Access Token were swapped and automatically fixed the issue!</p>
                    <p className="mt-2">The app should work correctly now. If you're still seeing this message, try refreshing the page.</p>
                  </>
                ) : (
                  <>
                    <p>It appears your API URL and Access Token might be swapped. Please check:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>NEXT_PUBLIC_SHOPIFY_API_URL</strong> should be the URL (starts with https://)</li>
                      <li><strong>NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN</strong> should be the token (alphanumeric string)</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-4">Shopify API Configuration Required</h2>
      <p className="text-gray-600 mb-6 max-w-lg">
        To connect this application to your Shopify store, you need to provide valid Shopify Storefront API credentials.
      </p>
      
      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 text-left max-w-xl w-full">
        <h3 className="text-md font-medium mb-2">Required Credentials:</h3>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex flex-col">
            <div className="flex items-center">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">NEXT_PUBLIC_SHOPIFY_API_URL</span>
              <div className="ml-2 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="mt-1">Your Shopify store's GraphQL endpoint URL following this pattern:</span>
            <code className="block mt-1 p-2 bg-gray-100 rounded text-xs sm:text-sm overflow-x-auto">
              https://your-store-name.myshopify.com/api/2023-07/graphql.json
            </code>
          </li>
          <li className="flex flex-col">
            <div className="flex items-center">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN</span>
              <div className="ml-2 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="mt-1">Your Shopify Storefront API access token (a long string of characters)</span>
          </li>
        </ul>
      </div>

      {apiUrl && !possibleSwappedCredentials && (
        <div className="max-w-xl w-full bg-yellow-50 p-4 rounded border border-yellow-200 mb-6 text-left">
          <h3 className="text-md font-medium mb-2 text-yellow-800">Current API URL Issue:</h3>
          <p className="text-sm text-yellow-700">
            The current API URL <code className="px-1 py-0.5 bg-yellow-100 rounded">{apiUrl}</code> appears to be invalid. Please check:
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700 space-y-1">
            <li>It starts with <code className="px-1 py-0.5 bg-yellow-100 rounded">https://</code></li>
            <li>Contains your store name: <code className="px-1 py-0.5 bg-yellow-100 rounded">your-store-name.myshopify.com</code></li>
            <li>Ends with <code className="px-1 py-0.5 bg-yellow-100 rounded">/api/2023-07/graphql.json</code> (or similar API version)</li>
          </ul>
        </div>
      )}
      
      <button 
        onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        {isHelpExpanded ? 'Hide detailed instructions' : 'Show how to get these credentials'}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`ml-1 h-5 w-5 transition-transform ${isHelpExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isHelpExpanded && (
        <div className="max-w-xl w-full bg-blue-50 p-4 rounded border border-blue-200 text-left mb-6">
          <h3 className="text-md font-medium mb-2 text-blue-800">How to get your Shopify API credentials:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-700">
            <li>Log in to your <strong>Shopify admin dashboard</strong></li>
            <li>Navigate to <strong>Apps &gt; App and sales channel settings</strong></li>
            <li>Scroll down and click <strong>Develop apps</strong></li>
            <li>Click <strong>Create an app</strong> (or use an existing one)</li>
            <li>Name your app (e.g., "Storefront App") and click <strong>Create app</strong></li>
            <li>In the app dashboard, click on <strong>Configure Storefront API scopes</strong></li>
            <li>Select the necessary access scopes (at minimum: <code>read_products</code>, <code>read_customers</code>, <code>read_orders</code>)</li>
            <li>Click <strong>Save</strong></li>
            <li>Go back to the app dashboard and select <strong>API credentials</strong></li>
            <li>Under <strong>Storefront API</strong>, click <strong>Install</strong></li>
            <li>Copy the <strong>Storefront API access token</strong> for <code>NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN</code></li>
            <li>For the <code>NEXT_PUBLIC_SHOPIFY_API_URL</code>, use:
              <code className="block mt-1 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
                https://[your-store-name].myshopify.com/api/2023-07/graphql.json
              </code>
              (Replace <code>[your-store-name]</code> with your actual store name)
            </li>
          </ol>
          
          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <h4 className="font-medium text-blue-800 text-sm">Troubleshooting Tips:</h4>
            <ul className="list-disc pl-5 mt-1 text-xs text-blue-700 space-y-1">
              <li>Ensure your Shopify store allows custom app development</li>
              <li>Verify the API version in the URL (2023-07 may need to be updated)</li>
              <li>Make sure you're using the Storefront API token (not Admin API)</li>
              <li>Check that the selected API scopes match your application's needs</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="max-w-xl w-full bg-green-50 p-4 rounded border border-green-200 text-left">
        <h3 className="text-md font-medium mb-2 text-green-800">Next Steps:</h3>
        <p className="text-sm text-green-700 mb-3">
          Once you've obtained your Shopify API credentials, provide them to connect this application to your store.
        </p>
        <p className="text-sm text-green-700">
          After setting up the correct credentials, the application will automatically load your store's products and collections.
        </p>
      </div>
    </div>
  );
}