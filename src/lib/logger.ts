// Enhanced logging utility for production debugging
class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      return `${baseMessage}\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  info(message: string, data?: any) {
    const formattedMessage = this.formatMessage('info', message, data);
    console.log(formattedMessage);
    
    // In production, you might want to send to a logging service
    if (this.isProduction) {
      this.sendToLoggingService('info', message, data);
    }
  }

  warn(message: string, data?: any) {
    const formattedMessage = this.formatMessage('warn', message, data);
    console.warn(formattedMessage);
    
    if (this.isProduction) {
      this.sendToLoggingService('warn', message, data);
    }
  }

  error(message: string, error?: any, data?: any) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };
    
    const formattedMessage = this.formatMessage('error', message, errorData);
    console.error(formattedMessage);
    
    if (this.isProduction) {
      this.sendToLoggingService('error', message, errorData);
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage('debug', message, data);
      console.debug(formattedMessage);
    }
  }

  // Placeholder for production logging service
  private sendToLoggingService(level: string, message: string, data?: any) {
    // In a real application, you would send logs to a service like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint
    
    // For now, we'll just store in localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store log:', e);
    }
  }

  // Method to retrieve logs for debugging
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch (e) {
      console.error('Failed to retrieve logs:', e);
      return [];
    }
  }

  // Clear stored logs
  clearLogs() {
    localStorage.removeItem('app_logs');
  }
}

export const logger = new Logger();

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Global JavaScript Error', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    message: event.message
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', event.reason, {
    type: 'unhandledrejection'
  });
});