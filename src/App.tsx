import { useEffect, useState } from 'react';
import { 
  LocationInput, 
  VenueTypeSelector, 
  VenueList,
  NotificationToast
} from './components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';

import { ThemeToggle } from './components/ThemeToggle';
import { AnimatedContainer } from './components/AnimatedContainer';
import { PageTransition } from './components/PageTransition';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { AccessibilityMenu } from './components/AccessibilityMenu';
import { PWAPrompt } from './components/PWAPrompt';
import { LazyMapViewWrapper, LazyVenueDetailWrapper, LazySearchHistoryWrapper } from './components/LazyComponents';
import { useSearchStore, useSearchSelectors } from './stores/searchStore';
import { useUIStore, useUISelectors, initializeUIStore } from './stores/uiStore';
import { searchFlowService, SearchFlowResult } from './services/SearchFlowService';
import { errorHandlingService } from './services/ErrorHandlingService';

import { Location, VenueType, Venue, ErrorType, SearchHistoryItem, SearchParams } from './types';

/**
 * 主应用组件
 * 整合所有子组件，管理应用状态和数据流
 */
function App() {
  // 搜索状态管理
  const {
    location1,
    location2,
    midpoint,
    selectedVenueTypes,
    venues,
    selectedVenue,
    loading,
    error,
    setLocation1,
    setLocation2,
    setMidpoint,
    setSelectedVenueTypes,
    setVenues,
    setSelectedVenue,
    setLoading,
    setError,
    clearError,
    addToHistory,
  } = useSearchStore();

  // UI状态管理
  const {
    isMapViewActive,
    isMobileView,
    setMapViewActive,
    addNotification,
    clearAllLoadingStates,
  } = useUIStore();

  // 计算属性
  const { canStartSearch, hasResults } = useSearchSelectors();
  const { hasAnyLoading } = useUISelectors();

  // 本地状态
  const [inputValues, setInputValues] = useState({
    location1: '',
    location2: '',
  });
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchStats, setSearchStats] = useState<{
    fromCache: boolean;
    searchTime: number;
  } | null>(null);

  // 初始化UI Store
  useEffect(() => {
    const cleanup = initializeUIStore();
    return cleanup;
  }, []);

  // 处理地点选择
  const handleLocation1Select = async (location: Location) => {
    setLocation1(location);
    setInputValues(prev => ({ ...prev, location1: location.address }));
    clearError();
    
    // 如果两个地点都已选择，计算中心点
    if (location2) {
      await calculateMidpoint(location, location2);
    }
  };

  const handleLocation2Select = async (location: Location) => {
    setLocation2(location);
    setInputValues(prev => ({ ...prev, location2: location.address }));
    clearError();
    
    // 如果两个地点都已选择，计算中心点
    if (location1) {
      await calculateMidpoint(location1, location);
    }
  };

  // 计算中心点
  const calculateMidpoint = async (loc1: Location, loc2: Location) => {
    try {
      setLoading(true);
      const midpointLocation = await searchFlowService.locationService.calculateMidpoint(loc1, loc2);
      setMidpoint(midpointLocation);
      
      addNotification({
        type: 'success',
        title: '中心点计算完成',
        message: `中心位置: ${midpointLocation.address}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '计算中心点失败';
      setError({
        type: ErrorType.GEOCODING_FAILED,
        message: errorMessage,
      });
      
      addNotification({
        type: 'error',
        title: '计算失败',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理店铺类型选择
  const handleVenueTypesChange = (types: VenueType[]) => {
    setSelectedVenueTypes(types);
    clearError();
  };

  // 开始搜索
  const handleStartSearch = async () => {
    if (!canStartSearch || !location1 || !location2) {
      addNotification({
        type: 'warning',
        title: '搜索条件不完整',
        message: '请确保已选择两个地点和至少一种店铺类型',
      });
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      // 构建搜索参数
      const searchParams: SearchParams = {
        location1,
        location2,
        venueTypes: selectedVenueTypes,
        radius: 5000 // 5km radius
      };
      
      // 执行完整的搜索流程
      const result: SearchFlowResult = await searchFlowService.executeSearchFlow(searchParams);
      
      // 更新状态
      setMidpoint(result.midpoint);
      setVenues(result.venues);
      setSearchStats({
        fromCache: result.fromCache,
        searchTime: result.searchTime
      });
      
      // 添加到搜索历史
      addToHistory(searchParams, result.totalResults);
      
      // 显示通知
      const cacheMessage = result.fromCache ? ' (来自缓存)' : '';
      addNotification({
        type: 'success',
        title: '搜索完成',
        message: `找到 ${result.totalResults} 个推荐地点${cacheMessage}`,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '搜索失败';
      setError({
        type: ErrorType.PLACES_SEARCH_FAILED,
        message: errorMessage,
      });
      
      addNotification({
        type: 'error',
        title: '搜索失败',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理店铺选择
  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  // 返回列表视图
  const handleBackToList = () => {
    setSelectedVenue(null);
  };

  // 切换地图视图
  const handleToggleMapView = () => {
    setMapViewActive(!isMapViewActive);
  };

  // 清除所有数据
  const handleClearAll = () => {
    setLocation1(null);
    setLocation2(null);
    setMidpoint(null);
    setVenues([]);
    setSelectedVenue(null);
    setSelectedVenueTypes([]);
    setInputValues({ location1: '', location2: '' });
    setSearchStats(null);
    clearError();
    clearAllLoadingStates();
    
    addNotification({
      type: 'info',
      title: '已清除',
      message: '所有数据已清除',
    });
  };

  // 处理历史记录选择
  const handleHistorySelect = (historyItem: SearchHistoryItem) => {
    setLocation1(historyItem.location1);
    setLocation2(historyItem.location2);
    setSelectedVenueTypes(historyItem.venueTypes);
    setInputValues({
      location1: historyItem.location1.address,
      location2: historyItem.location2.address,
    });
    clearError();
    
    addNotification({
      type: 'info',
      title: '已加载历史搜索',
      message: '历史搜索条件已应用，可以直接开始搜索',
    });
  };



  // 渲染主要内容区域
  const renderMainContent = () => {
    // 如果选择了具体店铺，显示详情页
    if (selectedVenue) {
      return location1 && location2 ? (
        <LazyVenueDetailWrapper
          venue={selectedVenue}
          userLocations={[location1, location2]}
          onBack={handleBackToList}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">需要两个地点信息才能显示详情</p>
          <button
            onClick={handleBackToList}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回列表
          </button>
        </div>
      );
    }

    // 如果有搜索结果，显示列表或地图
    if (hasResults) {
      return (
        <AnimatedContainer animation="fade-in" className="space-y-8">
          {/* 视图切换按钮 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-soft">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="heading-responsive font-bold text-gray-800 dark:text-gray-200">
                推荐地点 ({venues.length})
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleToggleMapView}
                className={`btn group ${
                  isMapViewActive
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMapViewActive ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  )}
                </svg>
                {isMapViewActive ? '列表视图' : '地图视图'}
              </button>
              
              <button
                onClick={handleClearAll}
                className="btn btn-ghost text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新搜索
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <PageTransition isVisible={true} type={isMapViewActive ? 'scale' : 'fade'}>
            {isMapViewActive ? (
              <div className="h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-large">
                <LazyMapViewWrapper
                  center={midpoint!}
                  userLocations={location1 && location2 ? [location1, location2] : []}
                  venues={venues}
                  onVenueClick={handleVenueSelect}
                />
              </div>
            ) : (
              <VenueList
                venues={venues}
                onVenueSelect={handleVenueSelect}
                loading={loading}
              />
            )}
          </PageTransition>
        </AnimatedContainer>
      );
    }

    // 默认显示搜索表单
    return (
      <div className="space-y-8">
        {/* 地点输入区域 */}
        <AnimatedContainer animation="slide-up" triggerOnScroll className="card card-spacious">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="heading-responsive font-bold text-gray-800 dark:text-gray-200">输入两个地点</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedContainer animation="slide-in-left" delay={100}>
              <LocationInput
                label="第一个地点"
                placeholder="请输入第一个地点"
                value={inputValues.location1}
                onChange={(value) => setInputValues(prev => ({ ...prev, location1: value }))}
                onLocationSelect={handleLocation1Select}
                required
              />
            </AnimatedContainer>

            <AnimatedContainer animation="slide-in-right" delay={200}>
              <LocationInput
                label="第二个地点"
                placeholder="请输入第二个地点"
                value={inputValues.location2}
                onChange={(value) => setInputValues(prev => ({ ...prev, location2: value }))}
                onLocationSelect={handleLocation2Select}
                required
              />
            </AnimatedContainer>
          </div>

          {/* 中心点显示 */}
          {midpoint && (
            <AnimatedContainer animation="scale-in" delay={300} className="mt-8">
              <div className="p-6 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border border-success-200 dark:border-success-800 rounded-xl shadow-soft">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-success-800 dark:text-success-200">计算的中心位置</h3>
                </div>
                <p className="text-success-700 dark:text-success-300 ml-9">{midpoint.address}</p>
              </div>
            </AnimatedContainer>
          )}
        </AnimatedContainer>

        {/* 店铺类型选择区域 */}
        {location1 && location2 && (
          <AnimatedContainer animation="slide-up" delay={400} triggerOnScroll className="card card-spacious">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="heading-responsive font-bold text-gray-800 dark:text-gray-200">选择店铺类型</h2>
            </div>
            
            <VenueTypeSelector
              selectedTypes={selectedVenueTypes}
              onTypesChange={handleVenueTypesChange}
            />
            
            {/* 搜索按钮 */}
            <AnimatedContainer animation="bounce-gentle" delay={500} className="mt-8 flex justify-center">
              <button
                onClick={handleStartSearch}
                disabled={!canStartSearch || loading}
                className={`btn btn-primary btn-lg group ${
                  canStartSearch && !loading
                    ? 'shadow-glow hover:shadow-glow-lg'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? '搜索中...' : '开始搜索'}
              </button>
            </AnimatedContainer>
          </AnimatedContainer>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <ErrorBoundary
        onError={(error, errorInfo) => {
          errorHandlingService.handleError(error, {
            component: 'App',
            action: 'render',
            additionalData: { errorInfo },
          });
        }}
      >
        <NetworkStatusIndicator />
        
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="skip-link focus:top-6"
        >
          跳转到主要内容
        </a>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
          <div className="container mx-auto px-4 py-8">
            

            {/* 头部 */}
            <AnimatedContainer animation="fade-in" className="text-center mb-12">
              <header>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1" />
                  <div className="flex-1 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-fade-in">
                      约会地点推荐
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 animate-slide-up">
                      找到两个地点之间的完美约会场所
                    </p>
                  </div>
                  <div className="flex-1 flex justify-end space-x-2">
                    <AccessibilityMenu />
                    <ThemeToggle />
                  </div>
                </div>
                
                {/* 工具栏 */}
                <AnimatedContainer animation="slide-up" delay={200} className="flex flex-wrap justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setShowSearchHistory(!showSearchHistory)}
                    className="btn btn-secondary group"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>搜索历史</span>
                  </button>
                  
                  {searchStats && (
                    <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-soft">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>搜索耗时: {searchStats.searchTime}ms</span>
                      </div>
                      {searchStats.fromCache && (
                        <span className="badge badge-success animate-bounce-gentle">
                          缓存
                        </span>
                      )}
                    </div>
                  )}
                </AnimatedContainer>
              </header>
            </AnimatedContainer>

            {/* 错误提示 */}
            {error && (
              <AnimatedContainer animation="slide-down" className="max-w-4xl mx-auto mb-8">
                <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4 shadow-soft">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-error-100 dark:bg-error-900/50 flex items-center justify-center">
                        <svg className="h-5 w-5 text-error-600 dark:text-error-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-semibold text-error-800 dark:text-error-200">
                        操作失败
                      </h3>
                      <p className="text-sm text-error-700 dark:text-error-300 mt-1">
                        {error.message}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={clearError}
                        className="btn btn-ghost text-error-600 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-900/50 p-2"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            )}

            {/* 搜索历史模态框 */}
            {showSearchHistory && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <AnimatedContainer animation="scale-in" className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
                  <LazySearchHistoryWrapper
                    onHistorySelect={handleHistorySelect}
                    onClose={() => setShowSearchHistory(false)}
                  />
                </AnimatedContainer>
              </div>
            )}

            {/* 主要内容区域 */}
            <main 
              id="main-content"
              className={`max-w-6xl mx-auto ${isMobileView ? 'px-2' : 'px-4'}`}
              role="main"
              aria-label="主要内容区域"
            >
              <PageTransition isVisible={true} type="fade">
                {renderMainContent()}
              </PageTransition>
            </main>

            {/* 加载指示器 */}
            {(loading || hasAnyLoading) && (
              <LoadingIndicator
                type="spinner"
                size="lg"
                text={loading ? '处理中...' : '加载中...'}
                overlay={true}
              />
            )}

            {/* 通知Toast */}
            <NotificationToast />
            
            {/* PWA Prompt */}
            <PWAPrompt />
          </div>
        </div>
      </ErrorBoundary>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
