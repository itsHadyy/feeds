import React, { useState } from 'react';
import { MessageSquare, Shapes, Lock, Unlock } from 'lucide-react';



interface MappingFieldHeaderProps {
  isLocked: boolean;
  onCommentClick: () => void;
  onABTestClick: () => void;
  onToggleLock: () => void;
}

export const MappingFieldHeader: React.FC<MappingFieldHeaderProps> = ({
  isLocked,
  onCommentClick,
  onABTestClick,
  onToggleLock,
}) => {
  const [comment, setComment] = useState<string>(''); // State for comment input
  const [abTest, setABTest] = useState<string>(''); // State for A/B test input

  return (
    <div className="flex items-center justify-between mb-6 border-b pb-4">
      <div className="flex items-center gap-4">
        {/* Comment Button */}
        <button
          onClick={onCommentClick}
          disabled={isLocked}
          className={`btn-sm flex items-center gap-2 ${
            isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
        </button>

        {/* A/B Test Button */}
        <button
          onClick={onABTestClick}
          disabled={isLocked}
          className={`btn-sm flex items-center gap-2 ${
            isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Shapes className="h-4 w-4" />
          <span>A/B Tests</span>
        </button>
      </div>

      {/* Lock/Unlock Button */}
      <button
        onClick={onToggleLock}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isLocked
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }`}
      >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4" />
            <span>Unlock</span>
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            <span>Lock</span>
          </>
        )}
      </button>
    </div>
  );
};