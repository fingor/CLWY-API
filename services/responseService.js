class ResponseService {
  /**
   * 设置流式响应头
   * @param {Object} res - Express响应对象
   */
  setStreamHeaders(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  }

  /**
   * 处理流式响应
   * @param {Object} response - DeepSeek API响应
   * @param {Object} res - Express响应对象
   */
  handleStreamResponse(response, res) {
    // 将DeepSeek的流直接转发给前端
    response.data.pipe(res);
    
    response.data.on('error', (err) => {
      console.error('Stream Error:', err);
      res.end();
    });
  }

  /**
   * 发送错误响应
   * @param {Object} res - Express响应对象
   * @param {string} error - 错误信息
   * @param {string} detail - 详细错误信息
   */
  sendErrorResponse(res, error, detail) {
    console.error('API Error:', detail);
    
    // 设置正确的响应头
    this.setStreamHeaders(res);
    
    res.write(`event: error\ndata: ${
      JSON.stringify({
        error: error,
        detail: detail
      })
    }\n\n`);
    
    res.end();
  }

  /**
   * 验证请求参数
   * @param {Object} req - Express请求对象
   * @returns {Object} 验证结果
   */
  validateRequest(req) {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        valid: false,
        error: '请求参数无效',
        detail: 'messages参数必须是非空数组'
      };
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      return {
        valid: false,
        error: '请求参数无效',
        detail: '最后一条消息必须包含content字段'
      };
    }

    return {
      valid: true,
      messages: messages
    };
  }
}

module.exports = new ResponseService(); 