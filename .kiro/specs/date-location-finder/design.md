# Design Document

## Overview

约会地点推荐应用是一个基于Web的单页应用，帮助用户找到两个地点之间的最佳约会场所。应用采用现代化的前端技术栈，通过Google Maps MCP Server获取地理数据和店铺信息，提供直观美观的用户界面。

## Architecture

### 系统架构
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   MCP Client     │    │  Google Maps    │
│   (React/Vue)   │◄──►│   Integration    │◄──►│   MCP Server    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   State Mgmt    │    │   API Services   │
│   (Zustand)     │    │   Layer          │
└─────────────────┘    └──────────────────┘
```

### 技术栈
- **前端框架**: React 18 with TypeScript
- **状态管理**: Zustand
- **UI组件库**: Tailwind CSS + Headless UI
- **地图组件**: React Google Maps API
- **MCP集成**: Google Maps MCP Server
- **构建工具**: Vite
- **包管理**: npm

## Components and Interfaces

### 核心组件结构

#### 1. App Component
主应用组件，管理整体布局和路由
```typescript
interface AppProps {
  children: React.ReactNode;
}
```

#### 2. LocationInput Component
地点输入组件，支持自动补全
```typescript
interface LocationInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
}

interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}
```

#### 3. VenueTypeSelector Component
店铺类型选择组件
```typescript
interface VenueTypeSelectorProps {
  selectedTypes: VenueType[];
  onTypesChange: (types: VenueType[]) => void;
}

enum VenueType {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  MOVIE_THEATER = 'movie_theater',
  SHOPPING_MALL = 'shopping_mall',
  BAR = 'bar',
  PARK = 'park'
}
```

#### 4. VenueList Component
店铺列表展示组件
```typescript
interface VenueListProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue) => void;
  loading: boolean;
}

interface Venue {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  openingHours: OpeningHours;
  distance: number;
  location: Location;
}
```

#### 5. VenueDetail Component
店铺详情组件
```typescript
interface VenueDetailProps {
  venue: Venue;
  userLocations: [Location, Location];
  onBack: () => void;
}
```

#### 6. MapView Component
地图展示组件
```typescript
interface MapViewProps {
  center: Location;
  userLocations: Location[];
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}
```

### MCP服务接口

#### LocationService
```typescript
class LocationService {
  async geocodeAddress(address: string): Promise<Location>;
  async searchPlaces(query: string, location?: Location): Promise<Place[]>;
  async getPlaceDetails(placeId: string): Promise<Venue>;
  async calculateMidpoint(location1: Location, location2: Location): Promise<Location>;
  async getDirections(origin: Location, destination: Location): Promise<DirectionsResult>;
}
```

## Data Models

### 核心数据模型

#### Location Model
```typescript
interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}
```

#### Venue Model
```typescript
interface Venue {
  placeId: string;
  name: string;
  address: string;
  location: Location;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number; // 1-4 scale
  photos: Photo[];
  openingHours: OpeningHours;
  phoneNumber?: string;
  website?: string;
  types: string[];
  distance: number; // distance from midpoint in meters
}

interface Photo {
  photoReference: string;
  width: number;
  height: number;
}

interface OpeningHours {
  openNow: boolean;
  periods: Period[];
  weekdayText: string[];
}

interface Period {
  open: TimeOfDay;
  close?: TimeOfDay;
}

interface TimeOfDay {
  day: number; // 0-6 (Sunday-Saturday)
  time: string; // HHMM format
}
```

#### Search State Model
```typescript
interface SearchState {
  location1: Location | null;
  location2: Location | null;
  midpoint: Location | null;
  selectedVenueTypes: VenueType[];
  venues: Venue[];
  selectedVenue: Venue | null;
  loading: boolean;
  error: string | null;
}
```

## Error Handling

### 错误类型定义
```typescript
enum ErrorType {
  GEOCODING_FAILED = 'GEOCODING_FAILED',
  PLACES_SEARCH_FAILED = 'PLACES_SEARCH_FAILED',
  PLACE_DETAILS_FAILED = 'PLACE_DETAILS_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_INPUT = 'INVALID_INPUT'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}
```

### 错误处理策略
1. **网络错误**: 显示重试按钮，允许用户重新发起请求
2. **地点解析失败**: 提示用户输入更具体的地址
3. **无搜索结果**: 建议用户尝试不同的店铺类型或扩大搜索范围
4. **API限制**: 显示友好提示，建议稍后重试

### 用户体验优化
- 使用Toast通知显示错误信息
- 提供具体的错误解决建议
- 保持应用状态，避免用户重新输入数据

## Testing Strategy

### 单元测试
- **组件测试**: 使用React Testing Library测试所有UI组件
- **服务测试**: 模拟MCP调用，测试LocationService的各个方法
- **状态管理测试**: 测试Zustand store的状态变更逻辑

### 集成测试
- **MCP集成测试**: 测试与Google Maps MCP Server的实际交互
- **端到端流程测试**: 测试完整的用户搜索流程

### 测试工具
- **单元测试**: Jest + React Testing Library
- **E2E测试**: Playwright
- **API测试**: MSW (Mock Service Worker)

### 测试覆盖率目标
- 组件测试覆盖率: >90%
- 服务层测试覆盖率: >95%
- 关键用户流程E2E测试覆盖率: 100%

## UI/UX Design Specifications

### 设计系统
- **颜色主题**: 现代化的渐变色彩，主色调为蓝色系
- **字体**: Inter字体系列，确保良好的可读性
- **间距**: 基于8px网格系统的一致间距
- **圆角**: 统一使用8px圆角，营造友好感

### 响应式设计
- **移动端**: 320px - 768px
- **平板端**: 768px - 1024px  
- **桌面端**: 1024px+

### 交互设计
- **加载状态**: 骨架屏 + 进度指示器
- **动画效果**: 平滑的页面过渡和元素动画
- **反馈机制**: 即时的视觉反馈和状态提示

### 可访问性
- 支持键盘导航
- 提供适当的ARIA标签
- 确保足够的颜色对比度
- 支持屏幕阅读器