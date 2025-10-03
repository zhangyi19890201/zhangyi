import React from 'react';
import './TaskButtonGroup.css';

interface TaskButtonGroupProps {
  taskType: 'initiated' | 'pending' | 'completed';
  onRefresh: () => void;
  onViewMore: () => void;
}

const TaskButtonGroup: React.FC<TaskButtonGroupProps> = ({ taskType: _taskType, onRefresh, onViewMore }) => {
  return (
    <div className="task-button-group">
      <button 
        className="task-button-group__refresh-btn" 
        onClick={onRefresh} 
        title="刷新"
      >
        🔄
      </button>
      <button 
        className="task-button-group__more-btn" 
        onClick={onViewMore}
      >
        更多
      </button>
    </div>
  );
};

export default TaskButtonGroup;