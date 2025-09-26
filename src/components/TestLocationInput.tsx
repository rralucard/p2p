import React, { useState } from 'react';
import { LocationInput } from './LocationInput';
import { Location } from '../types';

export const TestLocationInput: React.FC = () => {
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [selectedLocation1, setSelectedLocation1] = useState<Location | null>(null);
  const [selectedLocation2, setSelectedLocation2] = useState<Location | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">测试地点输入</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            地点1
          </label>
          <LocationInput
            placeholder="请输入第一个地点（如：沈阳）"
            value={location1}
            onChange={setLocation1}
            onLocationSelect={setSelectedLocation1}
          />
          {selectedLocation1 && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                已选择: {selectedLocation1.address}
              </p>
              <p className="text-xs text-green-600">
                坐标: {selectedLocation1.latitude.toFixed(4)}, {selectedLocation1.longitude.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            地点2
          </label>
          <LocationInput
            placeholder="请输入第二个地点（如：大连）"
            value={location2}
            onChange={setLocation2}
            onLocationSelect={setSelectedLocation2}
          />
          {selectedLocation2 && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                已选择: {selectedLocation2.address}
              </p>
              <p className="text-xs text-green-600">
                坐标: {selectedLocation2.latitude.toFixed(4)}, {selectedLocation2.longitude.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-medium text-blue-900 mb-2">调试信息</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>环境: {(import.meta as any).env?.DEV ? '开发环境（使用模拟数据）' : '生产环境'}</p>
          <p>输入值1: {location1 || '未输入'}</p>
          <p>输入值2: {location2 || '未输入'}</p>
          <p>已选择地点1: {selectedLocation1 ? '是' : '否'}</p>
          <p>已选择地点2: {selectedLocation2 ? '是' : '否'}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">使用说明</h3>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>1. 在输入框中输入"沈阳"或"大连"</p>
          <p>2. 等待自动补全建议出现（约0.5秒延迟）</p>
          <p>3. 点击建议项或使用键盘导航选择</p>
          <p>4. 选择后会显示绿色确认信息</p>
        </div>
      </div>
    </div>
  );
};

export default TestLocationInput;