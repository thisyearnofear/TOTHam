# tipcast

This project demonstrates how to fetch cast information and related data using the Neynar Node.js SDK. It showcases two main functions:

fetchCastInfo(warpcastUrl): Fetches cast information from a provided Warpcast URL.
fetchAllCastsInThread(threadHash): Fetches all casts in a thread using the thread hash.

Setup

Clone the repository: git clone <repository-url>
Navigate to the project directory: cd <project-directory>
Install the necessary dependencies: npm install
Replace "API_KEY_HERE" with actual Neynar API key in the code.

Usage

The script runs an IIFE (Immediately Invoked Function Expression) to demonstrate fetching cast information and calculating the total amount and dollar value of $DEGEN from the fetched data. Modify the warpcastUrl variable in the script to the Warpcast URL you want to fetch cast information from.

To run the script, use the following command in terminal: node fetch_cast_info.js

Functions

fetchCastInfo(warpcastUrl)
Fetches cast information from the provided Warpcast URL.
Returns the fetched data as a JSON object.

fetchAllCastsInThread(threadHash)
Fetches all casts in a thread using the thread hash.
Returns the fetched data as a JSON object.

Error Handling
Both functions include error handling to catch and display any issues that occur during the fetch operations.

License
This project is licensed under the MIT License.
