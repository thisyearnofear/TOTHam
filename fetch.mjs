// fetch_cast_info.js

// Import necessary modules from the Neynar Node.js SDK
import { NeynarAPIClient, CastParamType } from "@neynar/nodejs-sdk";
import fetch from "node-fetch";

// Initialize Neynar API client with your API key
const client = new NeynarAPIClient("API_KEY_HERE");

// Function to fetch cast information from a Warpcast URL
async function fetchCastInfo(warpcastUrl) {
  try {
    // Fetch the cast information from the Warpcast URL
    return await client.lookUpCastByHashOrWarpcastUrl(
      warpcastUrl,
      CastParamType.Url
    );
  } catch (error) {
    // Handle any errors
    console.error("Error fetching cast information:", error);
    throw error;
  }
}

// Modified function to fetch all casts in a thread using thread hash
async function fetchAllCastsInThread(threadHash) {
  const apiKey = "0FCC00B9-8780-4E14-BE03-CE040CF62FCD"; // Use your actual API key
  const url = `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${threadHash}&api_key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Include other headers as required by the API
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching all casts in thread: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all casts in thread:", error);
    throw error;
  }
}

(async () => {
  // Warpcast URL to fetch cast information from
  const warpcastUrl = "https://warpcast.com/superlouis.eth/0x781f1d38";

  try {
    // Fetch cast information from the provided Warpcast URL
    const castInfo = await fetchCastInfo(warpcastUrl);

    // Fetch all casts in the thread using the thread hash
    const allCastsInThread = await fetchAllCastsInThread(
      castInfo.cast.thread_hash
    );

    // Filter and process casts that mention an amount of $DEGEN
    const degenCasts = allCastsInThread.result.casts
      .filter(
        (cast) => /(\d+)\s*\$degen/i.test(cast.text) // Regular expression to match the pattern
      )
      .map((cast) => {
        const match = cast.text.match(/(\d+)\s*\$degen/i); // Extract the amount
        return {
          username: cast.author.username, // Extract the username
          amount: parseInt(match[1], 10), // Extract the matched amount and convert to integer
        };
      });

    // Calculate the total amount of $DEGEN
    const totalAmount = degenCasts.reduce((acc, cast) => acc + cast.amount, 0);

    // Assuming $0.045 per $DEGEN unit
    const unitPrice = 0.045;
    const dollarValue = totalAmount * unitPrice;

    // Print the total amount and its dollar value
    console.log(`Total $DEGEN amount: ${totalAmount}`);
    console.log(`Dollar value today: $${dollarValue.toFixed(2)}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
