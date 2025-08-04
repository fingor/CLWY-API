const weatherService = require("./weatherService");

class MCPTools {
  constructor() {
    this.tools = {
      get_weather: this.getWeather.bind(this),
      get_current_time: this.getCurrentTime.bind(this),
      calculate: this.calculate.bind(this),
    };
  }

  /**
   * 检查消息是否需要工具调用
   * @param {string} message - 用户消息
   * @returns {boolean} 是否需要工具调用
   */
  needsToolCall(message) {
    const weatherKeywords = [
      "天气",
      "weather",
      "温度",
      "下雨",
      "晴天",
      "阴天",
      "雪",
      "风",
    ];
    const timeKeywords = [
      "时间",
      "几点",
      "现在",
      "time",
      "日期",
      "几号",
      "星期",
      "日子",
    ];
    const calcKeywords = [
      "计算",
      "算",
      "等于",
      "加",
      "减",
      "乘",
      "除",
      "calculate",
    ];

    const lowerMessage = message.toLowerCase();

    return (
      weatherKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
      timeKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
      calcKeywords.some((keyword) => lowerMessage.includes(keyword))
    );
  }

  /**
   * 解析工具调用
   * @param {string} message - 用户消息
   * @returns {Object} 工具调用信息
   */
  parseToolCall(message) {
    const lowerMessage = message.toLowerCase();

    // 天气查询
    if (lowerMessage.includes("天气") || lowerMessage.includes("weather")) {
      // 改进城市名称提取逻辑
      let city = "珠海"; // 默认城市

      // 常见城市名称映射
      const cityKeywords = {
        北京: ["北京", "beijing"],
        上海: ["上海", "shanghai"],
        广州: ["广州", "guangzhou"],
        深圳: ["深圳", "shenzhen"],
        珠海: ["珠海", "zhuhai"],
        杭州: ["杭州", "hangzhou"],
        南京: ["南京", "nanjing"],
        武汉: ["武汉", "wuhan"],
        成都: ["成都", "chengdu"],
        西安: ["西安", "xian"],
        天津: ["天津", "tianjin"],
        重庆: ["重庆", "chongqing"],
        青岛: ["青岛", "qingdao"],
        大连: ["大连", "dalian"],
        厦门: ["厦门", "xiamen"],
        苏州: ["苏州", "suzhou"],
        无锡: ["无锡", "wuxi"],
        宁波: ["宁波", "ningbo"],
        长沙: ["长沙", "changsha"],
        郑州: ["郑州", "zhengzhou"],
      };

      // 尝试从消息中提取城市名称
      for (const [cityName, keywords] of Object.entries(cityKeywords)) {
        for (const keyword of keywords) {
          if (lowerMessage.includes(keyword)) {
            city = cityName;
            break;
          }
        }
        if (city !== "珠海") break;
      }

      console.log(`🔍 解析城市名称: "${message}" -> "${city}"`);

      return {
        tool: "get_weather",
        params: { location: city },
      };
    }

    // 时间查询
    if (
      lowerMessage.includes("时间") ||
      lowerMessage.includes("几点") ||
      lowerMessage.includes("现在") ||
      lowerMessage.includes("几号") ||
      lowerMessage.includes("日期") ||
      lowerMessage.includes("今天") ||
      lowerMessage.includes("星期") ||
      lowerMessage.includes("礼拜")
    ) {
      return {
        tool: "get_current_time",
        params: {},
      };
    }

    // 计算器
    if (
      lowerMessage.includes("计算") ||
      lowerMessage.includes("算") ||
      lowerMessage.includes("等于")
    ) {
      // 提取数学表达式
      const calcMatch = message.match(/(\d+[\+\-\*\/\s]+\d+)/);
      if (calcMatch) {
        return {
          tool: "calculate",
          params: { expression: calcMatch[1] },
        };
      }
    }

    return null;
  }

  /**
   * 执行工具调用
   * @param {string} toolName - 工具名称
   * @param {Object} params - 参数
   * @returns {Promise<string>} 工具执行结果
   */
  async executeTool(toolName, params) {
    if (this.tools[toolName]) {
      try {
        return await this.tools[toolName](params);
      } catch (error) {
        console.error(`工具执行错误 ${toolName}:`, error);
        return `抱歉，执行${toolName}时出现错误: ${error.message}`;
      }
    }
    return `未知工具: ${toolName}`;
  }

  /**
   * 获取天气信息
   * @param {Object} params - 参数 {location}
   * @returns {Promise<string>} 天气信息
   */
  async getWeather(params) {
    try {
      const weatherData = await weatherService.getCurrentWeather(
        params.location
      );
      return weatherService.formatWeatherInfo(weatherData);
    } catch (error) {
      return `获取${params.location}天气信息失败: ${error.message}`;
    }
  }

  /**
   * 获取当前时间
   * @param {Object} params - 参数
   * @returns {string} 当前时间
   */
  getCurrentTime(params) {
    const now = new Date();
    
    // 获取年、月、日、星期、时间
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // 获取星期
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    // 获取月份名称
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    const monthName = monthNames[month - 1];
    
    return `当前时间：${year}年${monthName}${date}日 ${weekday} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 计算器
   * @param {Object} params - 参数 {expression}
   * @returns {string} 计算结果
   */
  calculate(params) {
    try {
      const expression = params.expression.replace(/\s/g, "");
      // 安全计算，只允许基本运算
      if (!/^[\d\+\-\*\/\(\)\.]+$/.test(expression)) {
        return "计算表达式包含不安全的字符";
      }

      const result = eval(expression);
      return `计算结果：${expression} = ${result}`;
    } catch (error) {
      return `计算错误: ${error.message}`;
    }
  }
}

module.exports = new MCPTools();
