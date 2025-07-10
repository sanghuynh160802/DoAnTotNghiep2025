// ngrokUrlFetcher.js
const axios = require('axios');

async function getNgrokPublicUrl() {
  try {
    const response = await axios.get("http://127.0.0.1:4040/api/tunnels");
    const httpsTunnel = response.data.tunnels.find(tunnel => tunnel.proto === "https");
    return httpsTunnel ? httpsTunnel.public_url : null;
  } catch (error) {
    console.error("❌ Failed to fetch ngrok URL:", error.message);
    return null;
  }
}

module.exports = getNgrokPublicUrl;
