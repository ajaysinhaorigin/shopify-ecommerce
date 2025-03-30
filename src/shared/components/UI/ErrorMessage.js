export default function ErrorMessage({ message, action, actionText }) {
  // Check if the error message is related to API configuration
  const isApiError = message?.toLowerCase().includes('api') || 
                      message?.toLowerCase().includes('shopify') ||
                      message?.toLowerCase().includes('network');
  
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="text-red-500 mb-4 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">An error occurred</h3>
          <p className="text-gray-600 max-w-md mx-auto">{message}</p>
        </div>
        
        {isApiError && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-sm text-amber-700">
                <h4 className="font-medium text-amber-800">API Connection Issue</h4>
                <div className="mt-2">
                  <p>This appears to be related to the Shopify API configuration. Please check:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Your Shopify store is active and online</li>
                    <li>The API credentials are correct and up-to-date</li>
                    <li>The API URL format follows: <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">https://your-store.myshopify.com/api/2023-07/graphql.json</code></li>
                    <li>You've granted the necessary API access scopes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {action && actionText && (
            <button
              type="button"
              onClick={action}
              className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto justify-center"
            >
              {actionText}
            </button>
          )}
          
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto justify-center"
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}
