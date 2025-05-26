import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN_PATH = './backend/tokens.json';

let tokens = {
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN
};

export function loadTokens() {
  if (fs.existsSync(TOKEN_PATH)) {
    tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  }
  return tokens;
}

export function saveTokens(newTokens) {
  tokens = {
    ...tokens,
    ...newTokens
  };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

export async function getValidAccessToken() {
  try {
    await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    return tokens.access_token;
  } catch {
    const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }
    });
    saveTokens(res.data);
    return res.data.access_token;
  }
}

export async function getAllSubscribers() {
  const accessToken = await getValidAccessToken();

  // Obtener broadcaster_id
  const userRes = await axios.get('https://api.twitch.tv/helix/users?login=blackelespanolito', {
    headers: {
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const broadcasterId = userRes.data.data[0].id;
  let subs = [];
  let cursor = null;

  do {
    const res = await axios.get('https://api.twitch.tv/helix/subscriptions', {
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        broadcaster_id: broadcasterId,
        first: 100,
        after: cursor
      }
    });

    subs.push(...res.data.data);
    cursor = res.data.pagination?.cursor || null;
  } while (cursor);

  return subs.map(s => s.user_name);
}
