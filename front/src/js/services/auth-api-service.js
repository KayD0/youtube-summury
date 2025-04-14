/**
 * 認証APIサービス
 * 
 * このサービスはAPIリクエスト用の認証トークン管理を処理します。
 * Firebase認証と連携してIDトークンを取得し、APIリクエストに含めます。
 */

import { getAuth } from 'firebase/auth';
import { getCurrentUser } from './firebase';

// 環境変数からAPIベースURLを取得
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * 現在のユーザーのIDトークンを取得
 * 
 * @returns {Promise<string|null>} IDトークン、または認証されていない場合はnull
 */
export async function getIdToken() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    console.warn('現在サインインしているユーザーはいません');
    return null;
  }
  
  try {
    // 新しいトークンを取得（デフォルトではforce refresh = false）
    const token = await currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error('IDトークン取得エラー:', error);
    return null;
  }
}

/**
 * 認証されたAPIリクエストを行う
 * 
 * @param {string} endpoint - APIエンドポイント（ベースURLなし）
 * @param {Object} options - Fetchオプション
 * @returns {Promise<Response>} - Fetchレスポンス
 */
export async function authenticatedFetch(endpoint, options = {}) {
  // IDトークンを取得
  const token = await getIdToken();
  
  if (!token) {
    throw new Error('認証が必要です');
  }
  
  // トークンをAuthorizationヘッダーに追加
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  // トークン付きでリクエストを行う
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
}

/**
 * バックエンドで認証トークンを検証
 * 
 * @returns {Promise<Object>} - 検証されたトークンからのユーザー情報
 */
export async function verifyAuth() {
  try {
    const response = await authenticatedFetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('認証検証エラー:', error);
    throw error;
  }
}

/**
 * YouTubeビデオを検索（認証バージョン）
 * 
 * @param {Object} params - 検索パラメータ
 * @param {string} params.q - 検索クエリ
 * @param {string} params.published_after - この日付以降に公開されたビデオでフィルタリング（ISO 8601形式）
 * @param {number} params.max_results - 返す結果の最大数
 * @param {string} params.channel_id - チャンネルIDでフィルタリング（オプション）
 * @returns {Promise<Object>} - 検索結果
 */
export async function searchVideos(params) {
  try {
    const response = await authenticatedFetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ビデオ検索エラー:', error);
    throw error;
  }
}

/**
 * YouTubeビデオの要約を生成（認証バージョン）
 * 
 * @param {string} videoId - YouTubeビデオID
 * @param {string} formatType - 要約のフォーマット（"json"または"markdown"）
 * @returns {Promise<Object>} - 要約データ
 */
export async function generateVideoSummary(videoId, formatType = 'json') {
  try {
    const response = await authenticatedFetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        video_id: videoId,
        format_type: formatType
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ビデオ要約生成エラー:', error);
    throw error;
  }
}

export default {
  getIdToken,
  authenticatedFetch,
  verifyAuth,
  searchVideos,
  generateVideoSummary
};
