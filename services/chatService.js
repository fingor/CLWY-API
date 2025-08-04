const axios = require('axios');
const mcpTools = require('../utils/mcpTools');

class ChatService {
  constructor() {
    this.deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  }

  /**
   * 处理聊天消息
   * @param {Array} messages - 消息数组
   * @returns {Promise<Object>} 处理结果
   */
  async processChat(messages) {
    try {
      const lastMessage = messages[messages.length - 1];
      const userMessage = lastMessage.content;

      // 检查是否需要工具调用
      const toolResult = await this.handleToolCall(userMessage, messages);
      
      if (toolResult) {
        return {
          success: true,
          hasToolCall: true,
          messages: toolResult.enhancedMessages,
          toolResult: toolResult.toolResult
        };
      }

      // 如果没有工具调用，直接调用DeepSeek
      return {
        success: true,
        hasToolCall: false,
        messages: messages
      };

    } catch (error) {
      console.error('❌ 聊天处理失败:', error);
      throw error;
    }
  }

  /**
   * 处理工具调用
   * @param {string} userMessage - 用户消息
   * @param {Array} messages - 消息数组
   * @returns {Promise<Object|null>} 工具调用结果
   */
  async handleToolCall(userMessage, messages) {
    console.log('mcpTools.needsToolCall(userMessage)',mcpTools.needsToolCall(userMessage))
    if (!mcpTools.needsToolCall(userMessage)) {
      return null;
    }

    const toolCall = mcpTools.parseToolCall(userMessage);
    if (!toolCall) {
      return null;
    }
    
    try {
      const toolResult = await mcpTools.executeTool(toolCall.tool, toolCall.params);

      const enhancedMessages = this.buildEnhancedMessages(userMessage, toolResult, messages);
      
      return {
        enhancedMessages,
        toolResult
      };
    } catch (error) {
      console.error('工具执行失败:', error);
      return null;
    }
  }

  /**
   * 构建增强的消息数组
   * @param {string} userMessage - 用户消息
   * @param {string} toolResult - 工具执行结果
   * @param {Array} messages - 原始消息数组
   * @returns {Array} 增强的消息数组
   */
  buildEnhancedMessages(userMessage, toolResult, messages) {
    const systemMessage = {
      role: 'system',
      content: `你是一个智能助手，具有以下能力：
        1. 天气查询：可以获取实时天气信息
        2. 时间查询：可以获取当前时间
        3. 计算器：可以进行基本数学计算

        用户询问了关于"${userMessage}"的问题，我已经为你获取了相关信息：

        ${toolResult}

        请基于这些信息回答用户的问题，保持友好和专业的语气。`
    };

    return [systemMessage, ...messages];
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