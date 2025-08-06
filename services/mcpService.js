const axios = require('axios');

class MCPService {
  constructor() {
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.weatherBaseUrl = 'https://ny5ctugn4y.re.qweatherapi.com/v7';
    
    // 城市ID映射
    this.cityMap = {
      '北京': '101010100',
      '上海': '101020100',
      '广州': '101280101',
      '深圳': '101280601',
      '珠海': '101280701',
      '杭州': '101210101',
      '南京': '101190101',
      '武汉': '101200101',
      '成都': '101270101',
      '西安': '101110101',
      '天津': '101030100',
      '重庆': '101040100',
      '青岛': '101120201',
      '大连': '101070201',
      '厦门': '101230201',
      '苏州': '101190401',
      '无锡': '101190201',
      '宁波': '101210401',
      '长沙': '101250101',
      '郑州': '101180101'
    };
  }

  /**
   * 检测是否需要工具调用
   */
  needsToolCall(message) {
    const lowerMessage = message.toLowerCase();
    
    const weatherKeywords = ['天气', 'weather', '温度', '下雨', '晴天', '阴天', '雪', '风'];
    const timeKeywords = ['时间', '几点', '现在', 'time', '日期', '几号', '今天', '星期', '礼拜'];
    const calcKeywords = ['计算', '算', '等于', '加', '减', '乘', '除', 'calculate'];
    
    return weatherKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           timeKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           calcKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * 解析工具调用
   */
  parseToolCall(message) {
    const lowerMessage = message.toLowerCase();
    
    // 天气查询
    if (lowerMessage.includes('天气') || lowerMessage.includes('weather')) {
      const city = this.extractCity(message);
      return {
        tool: 'get_weather',
        params: { location: city }
      };
    }
    
    // 时间查询
    if (lowerMessage.includes('时间') || lowerMessage.includes('几点') || 
        lowerMessage.includes('现在') || lowerMessage.includes('几号') || 
        lowerMessage.includes('日期') || lowerMessage.includes('今天') || 
        lowerMessage.includes('星期') || lowerMessage.includes('礼拜')) {
      return {
        tool: 'get_current_time',
        params: {}
      };
    }
    
    // 计算器
    if (lowerMessage.includes('计算') || lowerMessage.includes('算') || lowerMessage.includes('等于')) {
      const calcMatch = message.match(/(\d+[\+\-\*\/\s]+\d+)/);
      if (calcMatch) {
        return {
          tool: 'calculate',
          params: { expression: calcMatch[1] }
        };
      }
    }
    
    return null;
  }

  /**
   * 提取城市名称
   */
  extractCity(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [cityName, keywords] of Object.entries(this.cityMap)) {
      if (lowerMessage.includes(cityName.toLowerCase())) {
        return cityName;
      }
    }
    
    return '珠海'; // 默认城市
  }

  /**
   * 执行工具调用
   */
  async executeTool(toolName, params) {
    try {
      switch (toolName) {
        case 'get_weather':
          return await this.getWeather(params.location);
        case 'get_current_time':
          return this.getCurrentTime();
        case 'calculate':
          return this.calculate(params.expression);
        default:
          return `未知工具: ${toolName}`;
      }
    } catch (error) {
      console.error(`工具执行错误 ${toolName}:`, error);
      return `抱歉，执行${toolName}时出现错误: ${error.message}`;
    }
  }

  /**
   * 获取天气信息
   */
  async getWeather(location) {
    try {
      const cityId = this.cityMap[location];
      if (!cityId) {
        throw new Error(`未找到城市: ${location}`);
      }

      // 获取实时天气
      const weatherUrl = `${this.weatherBaseUrl}/weather/now?location=${cityId}&key=${this.weatherApiKey}`;
      const weatherResponse = await axios.get(weatherUrl);
      
      if (weatherResponse.data.code !== '200') {
        throw new Error(`天气API错误: ${weatherResponse.data.message}`);
      }

      const weatherData = weatherResponse.data.now;
      
      // 获取3天预报
      const forecastUrl = `${this.weatherBaseUrl}/weather/3d?location=${cityId}&key=${this.weatherApiKey}`;
      const forecastResponse = await axios.get(forecastUrl);
      
      let forecast = [];
      if (forecastResponse.data.code === '200') {
        forecast = forecastResponse.data.daily;
      }

      return this.formatWeatherInfo(location, weatherData, forecast);
      
    } catch (error) {
      throw new Error(`获取${location}天气信息失败: ${error.message}`);
    }
  }

  /**
   * 格式化天气信息
   */
  formatWeatherInfo(location, current, forecast) {
    let info = `${location}当前天气情况：\n`;
    info += `🌡️ 温度：${current.temp}°C\n`;
    info += `🌡️ 体感温度：${current.feelsLike}°C\n`;
    info += `💧 湿度：${current.humidity}%\n`;
    info += `🌪️ 风向：${current.windDir}\n`;
    info += `💨 风速：${current.windSpeed}km/h\n`;
    info += `🌫️ 能见度：${current.vis}km\n`;
    info += `☁️ 云量：${current.cloud}%\n`;
    info += `🌤️ 天气状况：${current.text}\n`;
    info += `📊 气压：${current.pressure}hPa\n`;
    info += `⏰ 更新时间：${current.obsTime}\n`;

    if (forecast && forecast.length > 0) {
      info += `\n未来3天天气预报：\n`;
      forecast.forEach((day, index) => {
        const date = new Date(day.fxDate);
        const dayName = ['今天', '明天', '后天'][index];
        info += `${dayName}（${date.getMonth() + 1}月${date.getDate()}日）：\n`;
        info += `  🌅 最高温：${day.tempMax}°C\n`;
        info += `  🌇 最低温：${day.tempMin}°C\n`;
        info += `  🌤️ 白天：${day.textDay}\n`;
        info += `  🌙 夜间：${day.textNight}\n`;
        info += `  💨 风向：${day.windDirDay}\n`;
        info += `  💨 风速：${day.windScaleDay}级\n`;
      });
    }

    return info;
  }

  /**
   * 获取当前时间
   */
  getCurrentTime() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    const monthName = monthNames[month - 1];
    
    return `当前时间：${year}年${monthName}${date}日 ${weekday} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 计算器
   */
  calculate(expression) {
    try {
      const cleanExpression = expression.replace(/\s/g, '');
      if (!/^[\d\+\-\*\/\(\)\.]+$/.test(cleanExpression)) {
        return '计算表达式包含不安全的字符';
      }
      
      const result = eval(cleanExpression);
      return `计算结果：${expression} = ${result}`;
    } catch (error) {
      return `计算错误: ${error.message}`;
    }
  }

  /**
   * 处理聊天消息
   */
  async processChat(messages) {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;

    // 检查是否需要工具调用
    if (this.needsToolCall(userMessage)) {
      const toolCall = this.parseToolCall(userMessage);
      
      if (toolCall) {
        const toolResult = await this.executeTool(toolCall.tool, toolCall.params);
        
        // 构建增强消息
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
    }

    return messages;
  }
}

module.exports = new MCPService(); 