import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  height?: string;
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
  autoAspectRatio?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  title, 
  visible, 
  onClose, 
  children, 
  footer, 
  width = '520px', 
  height,
  centered = false, 
  closable = true, 
  maskClosable = true, 
  className = '',
  autoAspectRatio = false
}) => {
  // 处理点击蒙层关闭
  const handleMaskClick = (e: React.MouseEvent) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理键盘Esc关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (visible && e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  // 如果不可见，不渲染内容
  if (!visible) return null;

  // 计算基于屏幕宽高比的尺寸
  const getModalStyle = () => {
    if (height) {
      return {
        height: height
      };
    }

    if (!autoAspectRatio) {
      return {}; // 不设置内联宽度，使用CSS类中的宽度
    }

    // 获取屏幕宽高比
    const screenRatio = window.innerWidth / window.innerHeight;
    // 设置最大宽度为屏幕宽度的80%
    const maxWidth = window.innerWidth * 0.8;
    // 计算合适的高度，保持与屏幕相似的宽高比
    const calculatedHeight = maxWidth / screenRatio;
    // 确保高度不超过屏幕高度的80%
    const maxHeight = window.innerHeight * 0.8;
    const finalHeight = Math.min(calculatedHeight, maxHeight);

    return {
      width: `${maxWidth}px`,
      height: `${finalHeight}px`,
      maxWidth: 'none',
      maxHeight: 'none'
    };
  };

  return (
    <div 
      className={`modal-mask ${className}`} 
      onClick={handleMaskClick}
    >
      <div 
        className={`modal ${centered ? 'modal-centered' : ''}`}
        style={{ width, ...getModalStyle() }}
      >
        {/* 模态框头部 */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {closable && (
            <button 
              className="modal-close-btn" 
              onClick={(e) => {
                e.preventDefault();
                // 移除 e.stopPropagation() 以避免阻止导航事件
                if (typeof onClose === 'function') {
                  onClose();
                } else {
                  console.error('Modal onClose is not a function');
                }
              }}
              title="关闭"
              style={{ position: 'relative', zIndex: 100 }}
            >
              ×
            </button>
          )}
        </div>

        {/* 模态框内容 */}
        <div className="modal-body">
          {children}
        </div>

        {/* 模态框底部 */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;