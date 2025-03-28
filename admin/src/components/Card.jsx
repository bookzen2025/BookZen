// Component Card dùng chung cho các phần hiển thị dữ liệu
import React from 'react'

const Card = ({ children, title, action, className = "" }) => {
  return (
    <div className={`bg-white rounded-card shadow-card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h3 className="text-h3 font-heading">{title}</h3>}
          {action && (
            <div className="flex items-center">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card 