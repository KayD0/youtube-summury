/**
 * チャンネル登録APIサービス
 * 
 * このサービスはYouTubeチャンネル登録に関するAPIリクエストを処理します。
 */

import { authenticatedFetch } from './auth-api-service.js';

/**
 * チャンネルを登録する
 * 
 * @param {string} channelId - YouTubeチャンネルID
 * @returns {Promise<Object>} - 登録結果
 */
export async function subscribeToChannel(channelId) {
  try {
    const response = await authenticatedFetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel_id: channelId })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('チャンネル登録エラー:', error);
    throw error;
  }
}

/**
 * チャンネル登録を解除する
 * 
 * @param {string} channelId - YouTubeチャンネルID
 * @returns {Promise<Object>} - 登録解除結果
 */
export async function unsubscribeFromChannel(channelId) {
  try {
    const response = await authenticatedFetch(`/api/subscriptions/${channelId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('チャンネル登録解除エラー:', error);
    throw error;
  }
}

/**
 * ユーザーのチャンネル登録一覧を取得する
 * 
 * @returns {Promise<Object>} - チャンネル登録一覧
 */
export async function getSubscriptions() {
  try {
    const response = await authenticatedFetch('/api/subscriptions');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('チャンネル登録一覧取得エラー:', error);
    throw error;
  }
}

/**
 * チャンネルが登録済みかチェックする
 * 
 * @param {string} channelId - YouTubeチャンネルID
 * @param {Array} subscriptions - チャンネル登録一覧
 * @returns {boolean} - 登録済みの場合はtrue
 */
export function isChannelSubscribed(channelId, subscriptions) {
  if (!subscriptions || !Array.isArray(subscriptions)) {
    return false;
  }
  
  return subscriptions.some(sub => sub.channel_id === channelId);
}

export default {
  subscribeToChannel,
  unsubscribeFromChannel,
  getSubscriptions,
  isChannelSubscribed
};
