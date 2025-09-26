import { AppError, ErrorType } from '../types';

/**
 * MCP客户端 - 处理与MCP服务器的通信
 */
export class MCPClient {
  private static instance: MCPClient;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  /**
   * 初始化MCP连接
   */
  async initialize(): Promise<void> {
    try {
      // 检查MCP环境是否可用
      if (typeof window !== 'undefined' && (window as any).mcpClient) {
        this.isConnected = true;
        return;
      }

      // 在开发环境中，我们可能需要模拟MCP调用
      if (process.env.NODE_ENV === 'development') {
        console.warn('MCP client not available, using mock responses in development');
        this.isConnected = true;
        return;
      }

      throw new Error('MCP client not available');
    } catch (error) {
      throw this.createError(ErrorType.MCP_CONNECTION_ERROR, `MCP初始化失败: ${error.message}`);
    }
  }

  /**
   * 调用MCP工具
   * @param toolName 工具名称
   * @param params 参数
   * @returns Promise<any> 工具调用结果
   */
  async callTool(toolName: string, params: any): Promise<any> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // 检查是否有真实的MCP客户端
      if (typeof window !== 'undefined' && (window as any).mcpClient) {
        const mcpClient = (window as any).mcpClient;
        return await mcpClient.callTool('google-maps', toolName, params);
      }

      // 开发环境模拟响应
      if (process.env.NODE_ENV === 'development') {
        return this.getMockResponse(toolName, params);
      }

      throw new Error('MCP client not available');
    } catch (error) {
      throw this.createError(ErrorType.MCP_CONNECTION_ERROR, `MCP工具调用失败: ${error.message}`);
    }
  }

  /**
   * 开发环境的模拟响应
   */
  private getMockResponse(toolName: string, params: any): any {
    console.log(`Mock MCP call: ${toolName}`, params);

    switch (toolName) {
      case 'geocode':
        if (params.address) {
          return {
            results: [{
              formatted_address: params.address,
              geometry: {
                location: {
                  lat: 39.9042 + Math.random() * 0.1,
                  lng: 116.4074 + Math.random() * 0.1
                }
              },
              place_id: `mock_place_id_${Date.now()}`
            }]
          };
        } else if (params.latlng) {
          return {
            results: [{
              formatted_address: `模拟地址 ${params.latlng}`,
              geometry: {
                location: {
                  lat: parseFloat(params.latlng.split(',')[0]),
                  lng: parseFloat(params.latlng.split(',')[1])
                }
              },
              place_id: `mock_place_id_${Date.now()}`
            }]
          };
        }
        break;

      case 'search_places':
        return {
          results: [
            {
              place_id: `mock_place_${Date.now()}_1`,
              name: `模拟${params.query || params.type}店铺1`,
              formatted_address: '模拟地址1',
              geometry: {
                location: {
                  lat: 39.9042 + Math.random() * 0.01,
                  lng: 116.4074 + Math.random() * 0.01
                }
              },
              rating: 4.0 + Math.random(),
              types: [params.type || 'restaurant']
            },
            {
              place_id: `mock_place_${Date.now()}_2`,
              name: `模拟${params.query || params.type}店铺2`,
              formatted_address: '模拟地址2',
              geometry: {
                location: {
                  lat: 39.9042 + Math.random() * 0.01,
                  lng: 116.4074 + Math.random() * 0.01
                }
              },
              rating: 4.0 + Math.random(),
              types: [params.type || 'restaurant']
            }
          ]
        };

      case 'get_place_details':
        return {
          result: {
            place_id: params.place_id,
            name: '模拟店铺详情',
            formatted_address: '模拟详细地址',
            geometry: {
              location: {
                lat: 39.9042 + Math.random() * 0.01,
                lng: 116.4074 + Math.random() * 0.01
              }
            },
            rating: 4.0 + Math.random(),
            user_ratings_total: Math.floor(Math.random() * 1000) + 100,
            price_level: Math.floor(Math.random() * 4) + 1,
            photos: [
              {
                photo_reference: 'mock_photo_ref_1',
                width: 400,
                height: 300
              }
            ],
            opening_hours: {
              open_now: Math.random() > 0.5,
              periods: [],
              weekday_text: ['周一: 09:00–21:00', '周二: 09:00–21:00']
            },
            formatted_phone_number: '+86 138-0013-8000',
            website: 'https://example.com',
            types: ['restaurant', 'food', 'establishment']
          }
        };

      case 'get_directions':
        return {
          routes: [{
            legs: [{
              distance: {
                text: '2.5 公里',
                value: 2500
              },
              duration: {
                text: '8 分钟',
                value: 480
              }
            }]
          }]
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * 创建标准化错误对象
   */
  private createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    };
  }
}

// 导出单例实例
export const mcpClient = MCPClient.getInstance();