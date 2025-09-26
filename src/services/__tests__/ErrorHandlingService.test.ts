import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandlingService, ErrorSeverity } from '../ErrorHandlingService';
import { ErrorType } from '../../types';

describe('ErrorHandlingService', () => {
  let errorService: ErrorHandlingService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a new instance for each test
    errorService = ErrorHandlingService.getInstance();
    
    // Clear any existing error reports
    errorService.clearResolvedErrors();
  });

  it('creates singleton instance', () => {
    const instance1 = ErrorHandlingService.getInstance();
    const instance2 = ErrorHandlingService.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('handles error and creates report', () => {
    const error = new Error('Test error');
    const context = {
      component: 'TestComponent',
      action: 'test_action',
    };

    const report = errorService.handleError(error, context);

    expect(report.message).toBe('Test error');
    expect(report.context.component).toBe('TestComponent');
    expect(report.context.action).toBe('test_action');
    expect(report.resolved).toBe(false);
    expect(report.retryCount).toBe(0);
  });

  it('determines error type correctly', () => {
    const networkError = new Error('Network connection failed');
    const geocodingError = new Error('Geocoding service unavailable');
    const validationError = new Error('Invalid input provided');

    const networkReport = errorService.handleError(networkError);
    const geocodingReport = errorService.handleError(geocodingError);
    const validationReport = errorService.handleError(validationError);

    expect(networkReport.type).toBe(ErrorType.NETWORK_ERROR);
    expect(geocodingReport.type).toBe(ErrorType.GEOCODING_FAILED);
    expect(validationReport.type).toBe(ErrorType.INVALID_INPUT);
  });

  it('executes operation with error handling', async () => {
    const successOperation = vi.fn().mockResolvedValue('success');
    
    const result = await errorService.executeWithErrorHandling(
      successOperation,
      { component: 'TestComponent' }
    );

    expect(result).toBe('success');
    expect(successOperation).toHaveBeenCalledTimes(1);
  });

  it('retries failed operations', async () => {
    const failingOperation = vi.fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success after retry');

    const result = await errorService.executeWithErrorHandling(
      failingOperation,
      { component: 'TestComponent' }
    );

    expect(result).toBe('success after retry');
    expect(failingOperation).toHaveBeenCalledTimes(2);
  });

  it('throws error after max retries', async () => {
    const alwaysFailingOperation = vi.fn()
      .mockRejectedValue(new Error('Persistent network error'));

    await expect(
      errorService.executeWithErrorHandling(
        alwaysFailingOperation,
        { component: 'TestComponent' }
      )
    ).rejects.toThrow('Persistent network error');
  });

  it('adds and removes error listeners', () => {
    const listener = vi.fn();
    
    errorService.addErrorListener(listener);
    
    const error = new Error('Test error');
    errorService.handleError(error);
    
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      })
    );

    errorService.removeErrorListener(listener);
    
    errorService.handleError(new Error('Another error'));
    
    // Listener should not be called again
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('gets error reports', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');
    
    const report1 = errorService.handleError(error1);
    const report2 = errorService.handleError(error2);
    
    expect(errorService.getErrorReport(report1.id)).toBe(report1);
    expect(errorService.getErrorReport(report2.id)).toBe(report2);
    
    const allReports = errorService.getAllErrorReports();
    expect(allReports).toContain(report1);
    expect(allReports).toContain(report2);
  });

  it('filters unresolved errors', () => {
    const error1 = new Error('Resolved error');
    const error2 = new Error('Unresolved error');
    
    const report1 = errorService.handleError(error1);
    const report2 = errorService.handleError(error2);
    
    // Mark first error as resolved
    report1.resolved = true;
    
    const unresolvedErrors = errorService.getUnresolvedErrors();
    expect(unresolvedErrors).toContain(report2);
    expect(unresolvedErrors).not.toContain(report1);
  });

  it('provides recovery actions', () => {
    const networkError = new Error('Network connection failed');
    const geocodingError = new Error('Geocoding service failed');
    
    const networkReport = errorService.handleError(networkError);
    const geocodingReport = errorService.handleError(geocodingError);
    
    const networkAction = errorService.getRecoveryAction(networkReport.id);
    const geocodingAction = errorService.getRecoveryAction(geocodingReport.id);
    
    expect(networkAction).toContain('网络连接');
    expect(geocodingAction).toContain('地址');
  });

  it('clears resolved errors', () => {
    const error1 = new Error('Resolved error');
    const error2 = new Error('Unresolved error');
    
    const report1 = errorService.handleError(error1);
    const report2 = errorService.handleError(error2);
    
    // Mark first error as resolved
    report1.resolved = true;
    
    errorService.clearResolvedErrors();
    
    expect(errorService.getErrorReport(report1.id)).toBeUndefined();
    expect(errorService.getErrorReport(report2.id)).toBeDefined();
  });
});