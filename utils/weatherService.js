const axios = require('axios');

class WeatherService {
  constructor() {
    // 使用和风天气API，您需要注册获取API密钥
    this.apiKey = process.env.WEATHER_API_KEY || 'your_weather_api_key';
    // 使用和风天气API，根据您的控制台显示的API Host
    this.baseUrl = 'https://ny5ctugn4y.re.qweatherapi.com/v7';
  }

  /**
   * 获取实时天气信息
   * @param {string} location - 城市名称或坐标
   * @returns {Promise<Object>} 天气信息
   */
  async getCurrentWeather(location) {
    try {
      // 首先获取城市ID
      const cityId = await this.getCityId(location);
      if (!cityId) {
        throw new Error(`未找到城市: ${location}`);
      }

      // 获取实时天气
      const weatherUrl = `${this.baseUrl}/weather/now?location=${cityId}&key=${this.apiKey}`;
      const weatherResponse = await axios.get(weatherUrl);
      
      if (weatherResponse.data.code !== '200') {
        throw new Error(`天气API错误: ${weatherResponse.data.message}`);
      }

      const weatherData = weatherResponse.data.now;
      
      // 获取3天预报
      const forecastUrl = `${this.baseUrl}/weather/3d?location=${cityId}&key=${this.apiKey}`;
      const forecastResponse = await axios.get(forecastUrl);
      
      let forecast = [];
      if (forecastResponse.data.code === '200') {
        forecast = forecastResponse.data.daily;
      }

      const result = {
        location: location,
        current: {
          temperature: weatherData.temp,
          feelsLike: weatherData.feelsLike,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          windDir: weatherData.windDir,
          pressure: weatherData.pressure,
          visibility: weatherData.vis,
          cloudCover: weatherData.cloud,
          dewPoint: weatherData.dew,
          text: weatherData.text,
          icon: weatherData.icon
        },
        forecast: forecast,
        updateTime: weatherData.obsTime
      };
      
      return result;
    } catch (error) {
      console.error('获取天气信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取城市ID
   * @param {string} location - 城市名称
   * @returns {Promise<string>} 城市ID
   */
  async getCityId(location) {
    try {
      // 城市名称到ID的映射
      const cityMap = {
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
      
      // 尝试从映射中获取城市ID
      for (const [cityName, cityId] of Object.entries(cityMap)) {
        if (location.includes(cityName)) {
          return cityId;
        }
      }
      
      // 如果映射中没有，尝试API查询
      const url = `${this.baseUrl}/geo/lookup?location=${encodeURIComponent(location)}&key=${this.apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.code === '200' && response.data.location && response.data.location.length > 0) {
        return response.data.location[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('获取城市ID失败:', error);
      return null;
    }
  }

  /**
   * 格式化天气信息为自然语言
   * @param {Object} weatherData - 天气数据
   * @returns {string} 格式化的天气信息
   */
  formatWeatherInfo(weatherData) {
    const current = weatherData.current;
    const location = weatherData.location;
    
    let info = `${location}当前天气情况：\n`;
    info += `🌡️ 温度：${current.temperature}°C\n`;
    info += `🌡️ 体感温度：${current.feelsLike}°C\n`;
    info += `💧 湿度：${current.humidity}%\n`;
    info += `🌪️ 风向：${current.windDir}\n`;
    info += `💨 风速：${current.windSpeed}km/h\n`;
    info += `🌫️ 能见度：${current.visibility}km\n`;
    info += `☁️ 云量：${current.cloud}%\n`;
    info += `🌤️ 天气状况：${current.text}\n`;
    info += `📊 气压：${current.pressure}hPa\n`;
    info += `⏰ 更新时间：${current.updateTime}\n`;

    if (weatherData.forecast && weatherData.forecast.length > 0) {
      info += `\n未来3天天气预报：\n`;
      weatherData.forecast.forEach((day, index) => {
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
}

module.exports = new WeatherService(); 