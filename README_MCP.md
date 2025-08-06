# DeepSeek MCP 天气功能

## 项目结构

```
clwy-api/
├── services/                    # 服务层
│   ├── mcpService.js           # 统一的MCP服务（天气、时间、计算器）
│   ├── chatService.js          # 聊天服务
│   └── responseService.js      # 响应处理服务
├── routes/ai/                  # 路由层
│   └── chat.js                # 聊天路由
└── WEATHER_MCP_SETUP.md       # 详细配置指南
```

## 功能特性

- 🌤️ **实时天气查询**：支持查询任意城市的实时天气
- 📅 **天气预报**：提供未来3天的天气预报
- 🕐 **时间查询**：获取当前时间
- 🧮 **计算器**：支持基本数学计算
- 🔄 **流式响应**：保持原有的流式聊天体验

## 架构设计

### 1. 统一MCP服务 (mcpService.js)
- **工具检测**：自动检测用户意图
- **工具执行**：调用天气API、时间查询、计算器
- **数据格式化**：将工具结果格式化为自然语言
- **消息增强**：将工具结果注入到AI对话中

### 2. 聊天服务 (chatService.js)
- **消息处理**：调用MCP服务处理消息
- **API调用**：调用DeepSeek API
- **配置验证**：验证API密钥

### 3. 响应服务 (responseService.js)
- **流式响应**：处理Server-Sent Events
- **错误处理**：统一的错误响应格式
- **参数验证**：验证请求参数

## 工作流程

1. **用户发送消息** → 聊天路由
2. **参数验证** → 验证请求格式
3. **MCP处理** → 检测工具调用需求
4. **工具执行** → 调用天气API等
5. **消息增强** → 将结果注入对话
6. **AI调用** → 调用DeepSeek API
7. **流式响应** → 返回给前端

## 使用方法

### 天气查询
- "今天北京天气怎么样？"
- "珠海现在天气如何？"
- "上海明天会下雨吗？"

### 时间查询
- "今天是几号？"
- "现在几点了？"
- "今天是星期几？"

### 计算器
- "计算 15 + 25"
- "算一下 100 * 3"

## 配置要求

在 `.env` 文件中配置：
```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
WEATHER_API_KEY=your_weather_api_key
```

## 优势

- **代码精简**：从多个文件整合为统一服务
- **易于维护**：清晰的职责分离
- **易于扩展**：在mcpService.js中添加新工具
- **性能优化**：减少文件依赖和调用层级
- **错误处理**：统一的错误处理机制

## 添加新工具

在 `services/mcpService.js` 中：

1. **添加关键词检测**：
```javascript
const newKeywords = ['新工具关键词'];
```

2. **添加工具解析**：
```javascript
if (lowerMessage.includes('新工具关键词')) {
  return {
    tool: 'new_tool',
    params: { /* 参数 */ }
  };
}
```

3. **添加工具执行**：
```javascript
case 'new_tool':
  return await this.newTool(params);
```

4. **实现工具方法**：
```javascript
async newTool(params) {
  // 工具实现
  return result;
}
``` 