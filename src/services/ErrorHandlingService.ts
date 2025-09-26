import { ErrorType } from '../types';

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 错误上下文接口
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  additionalData?: Record<string, any>;
}

/**
 * 错误报告接口
 */
export interface ErrorReport {
  id: string;
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  stack?: string;
  resolved: boolean;
  retryCount: number;
  maxRetries: number;
}

/**
 * 错误处理策略接口
 */
export interface ErrorHandlingStrategy {
  shouldRetry: (error: Error, context: ErrorContext) => boolean;
  getRetryDelay: (retryCount: number) => number;
  getMaxRetries: (errorType: ErrorType) => number;
  getSeverity: (error: Error, context: ErrorContext) => ErrorSeverity;
  getRecoveryAction: (error: Error, context: ErrorContext) => string | null;
}

/**
 * 默认错误处理策略
 */
class DefaultErrorHandlingStrategy implements ErrorHandlingStrategy {
  shouldRetry(error: Error, context: ErrorContext): boolean {
    // 网络错误通常可以重试
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return true;
    }

    // API限制错误可以重试
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return true;
    }

    // 超时错误可以重试
    if (error.message.includes('timeout')) {
      return true;
    }

    // 语法错误或类型错误不应重试
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return false;
    }

    return false;
  }

  getRetryDelay(retryCount: number): number {
    // 指数退避策略：1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, retryCount), 30000);
  }

  getMaxRetries(errorType: ErrorType): number {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return 3;
      case ErrorType.GEOCODING_FAILED:
      case ErrorType.PLACES_SEARCH_FAILED:
      case ErrorType.PLACE_DETAILS_FAILED:
        return 2;
      case ErrorType.INVALID_INPUT:
        return 0; // 不重试用户输入错误
      default:
        return 1;
    }
  }

  getSeverity(error: Error, context: ErrorContext): ErrorSeverity {
    // 根据错误类型和上下文确定严重程度
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return ErrorSeverity.CRITICAL;
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ErrorSeverity.MEDIUM;
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  getRecoveryAction(error: Error, context: ErrorContext): string | null {
    if (error.message.includes('network')) {
      return '请检查网络连接后重试';
    }

    if (error.message.includes('geocoding')) {
      return '请尝试输入更具体的地址';
    }

    if (error.message.includes('places')) {
      return '请尝试选择不同的店铺类型或扩大搜索范围';
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return '服务暂时不可用，请稍后重试';
    }

    return '请刷新页面重试，如问题持续请联系技术支持';
  }
}

/**
 * 错误处理服务
 */
export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private strategy: ErrorHandlingStrategy;
  private errorReports: Map<string, ErrorReport> = new Map();
  private errorListeners: Array<(report: ErrorReport) => void> = [];

  private constructor(strategy?: ErrorHandlingStrategy) {
    this.strategy = strategy || new DefaultErrorHandlingStrategy();
    this.setupGlobalErrorHandlers();
  }

  /**
   * 获取单例实例
   */
  static getInstance(strategy?: ErrorHandlingStrategy): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService(strategy);
    }
    return ErrorHandlingService.instance;
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 处理未捕获的JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'global',
        action: 'unhandled_error',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        component: 'global',
        action: 'unhandled_promise_rejection',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });
  }

  /**
   * 处理错误
   */
  handleError(error: Error, context: Partial<ErrorContext> = {}): ErrorReport {
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };

    const errorType = this.determineErrorType(error);
    const severity = this.strategy.getSeverity(error, fullContext);
    const maxRetries = this.strategy.getMaxRetries(errorType);

    const report: ErrorReport = {
      id: this.generateErrorId(),
      type: errorType,
      message: error.message,
      severity,
      context: fullContext,
      stack: error.stack,
      resolved: false,
      retryCount: 0,
      maxRetries,
    };

    this.errorReports.set(report.id, report);
    this.notifyErrorListeners(report);

    // 记录错误到控制台
    console.error('Error handled by ErrorHandlingService:', {
      report,
      error,
    });

    return report;
  }

  /**
   * 执行带错误处理的操作
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorReport = this.handleError(error as Error, context);
      
      // 如果可以重试，尝试重试
      if (this.strategy.shouldRetry(error as Error, errorReport.context)) {
        return this.retryOperation(operation, errorReport);
      }

      throw error;
    }
  }

  /**
   * 重试操作
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    errorReport: ErrorReport
  ): Promise<T> {
    while (errorReport.retryCount < errorReport.maxRetries) {
      try {
        errorReport.retryCount++;
        
        // 等待重试延迟
        const delay = this.strategy.getRetryDelay(errorReport.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        const result = await operation();
        
        // 标记错误已解决
        errorReport.resolved = true;
        this.notifyErrorListeners(errorReport);
        
        return result;
      } catch (error) {
        // 更新错误信息
        errorReport.message = (error as Error).message;
        errorReport.stack = (error as Error).stack;
        
        // 如果是最后一次重试，抛出错误
        if (errorReport.retryCount >= errorReport.maxRetries) {
          this.notifyErrorListeners(errorReport);
          throw error;
        }
      }
    }

    throw new Error('Maximum retries exceeded');
  }

  /**
   * 确定错误类型
   */
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorType.NETWORK_ERROR;
    }

    if (message.includes('geocod')) {
      return ErrorType.GEOCODING_FAILED;
    }

    if (message.includes('places') || message.includes('search')) {
      return ErrorType.PLACES_SEARCH_FAILED;
    }

    if (message.includes('details')) {
      return ErrorType.PLACE_DETAILS_FAILED;
    }

    if (message.includes('invalid') || message.includes('validation')) {
      return ErrorType.INVALID_INPUT;
    }

    return ErrorType.NETWORK_ERROR; // 默认类型
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 通知错误监听器
   */
  private notifyErrorListeners(report: ErrorReport): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(report);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }

  /**
   * 添加错误监听器
   */
  addErrorListener(listener: (report: ErrorReport) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * 移除错误监听器
   */
  removeErrorListener(listener: (report: ErrorReport) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * 获取错误报告
   */
  getErrorReport(id: string): ErrorReport | undefined {
    return this.errorReports.get(id);
  }

  /**
   * 获取所有错误报告
   */
  getAllErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values());
  }

  /**
   * 获取未解决的错误报告
   */
  getUnresolvedErrors(): ErrorReport[] {
    return this.getAllErrorReports().filter(report => !report.resolved);
  }

  /**
   * 清除已解决的错误报告
   */
  clearResolvedErrors(): void {
    for (const [id, report] of this.errorReports.entries()) {
      if (report.resolved) {
        this.errorReports.delete(id);
      }
    }
  }

  /**
   * 获取恢复建议
   */
  getRecoveryAction(errorId: string): string | null {
    const report = this.errorReports.get(errorId);
    if (!report) return null;

    return this.strategy.getRecoveryAction(
      new Error(report.message),
      report.context
    );
  }
}

// 导出单例实例
export const errorHandlingService = ErrorHandlingService.getInstance();

export default ErrorHandlingService;