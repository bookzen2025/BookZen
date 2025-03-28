// Component Card dùng chung cho các phần hiển thị dữ liệu
import React from 'react'

const Card = ({ 
  children, 
  title, 
  subtitle, 
  action, 
  icon, 
  className = '',
  gradient = false,
  hover = true
}) => {
  const baseClasses = "bg-white rounded-card shadow-sm p-6 transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-md" : "";
  const gradientClasses = gradient ? "bg-gradient-to-br from-white to-gray-5" : "";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {icon && (
              <div className="mr-2 text-secondary">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-body font-heading font-medium">{title}</h3>
              {subtitle && <p className="text-small text-textSecondary mt-1">{subtitle}</p>}
            </div>
          </div>
          {action && (
            <div>
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