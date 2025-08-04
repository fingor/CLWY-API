const express = require("express");
const router = express.Router();
const chatService = require("../../services/chatService");
const responseService = require("../../services/responseService");

// POST /chat
router.post("/", async (req, res) => {
  try {
    // 验证请求参数
    const validation = responseService.validateRequest(req);
    if (!validation.valid) {
      return responseService.sendErrorResponse(res, validation.error, validation.detail);
    }

    // 验证配置
    if (!chatService.validateConfig()) {
      return responseService.sendErrorResponse(res, '配置错误', 'DeepSeek API配置无效');
    }

    // 处理聊天消息
    const chatResult = await chatService.processChat(validation.messages);
    
    if (!chatResult.success) {
      return responseService.sendErrorResponse(res, '处理失败', '聊天消息处理失败');
    }

    // 调用DeepSeek API
    const response = await chatService.callDeepSeekAPI(chatResult.messages);

    // 设置响应头并处理流式响应
    responseService.setStreamHeaders(res);
    responseService.handleStreamResponse(response, res);

  } catch (error) {
    responseService.sendErrorResponse(
      res, 
      'AI服务异常', 
      error.response?.data || error.message
    );
  }
});

module.exports = router;
