const axios = require('axios');
const mcpService = require('./mcpService');

class ChatService {
  constructor() {
    this.deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  }

  /**
   * 处理聊天消息
   * @param {Array} messages - 消息数组
   * @returns {Promise<Array>} 处理后的消息数组
   */
  async processChat(messages) {
    try {
      // 使用MCP服务处理消息
      return await mcpService.processChat(messages);
    } catch (error) {
      console.error('聊天处理失败:', error);
      throw error;
    }
  }

  /**
   * 调用DeepSeek API
   * @param {Array} messages - 消息数组
   * @returns {Promise<Object>} API响应
   */
  async callDeepSeekAPI(messages) {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }
    
    const response = await axios.post(
      this.deepseekApiUrl,
      {
        model: 'deepseek-chat',
        messages: messages,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    return response;
  }

  /**
   * 验证配置
   * @returns {boolean} 配置是否有效
   */
  validateConfig() {
    return !!this.deepseekApiKey;
  }
}

module.exports = new ChatService(); 