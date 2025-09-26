import React, { useState } from 'react';
import { VenueTypeSelector } from '../VenueTypeSelector';
import { VenueType } from '../../types';

/**
 * Demo component to showcase VenueTypeSelector functionality
 * This is not a test file but a demonstration of how to use the component
 */
export const VenueTypeSelectorDemo: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<VenueType[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = () => {
    setShowValidation(true);
    if (selectedTypes.length > 0) {
      alert(`选择的类型: ${selectedTypes.join(', ')}`);
    }
  };

  const error = showValidation && selectedTypes.length === 0 
    ? '请至少选择一种约会场所类型' 
    : undefined;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          VenueTypeSelector 组件演示
        </h1>
        
        <VenueTypeSelector
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          error={error}
        />
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            提交选择
          </button>
          
          <button
            onClick={() => {
              setSelectedTypes([]);
              setShowValidation(false);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            重置
          </button>
        </div>
        
        {/* 显示当前状态 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">当前状态:</h3>
          <pre className="text-sm text-gray-700">
            {JSON.stringify({
              selectedTypes,
              count: selectedTypes.length,
              hasError: !!error,
              showValidation
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default VenueTypeSelectorDemo;