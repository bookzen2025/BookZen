// Component StatCard dùng chung để hiển thị các chỉ số thống kê
import React from 'react'

const StatCard = ({ title, value, description, icon, colorClass = 'bg-secondary/10 text-secondary' }) => {
  return (
    <div className="p-6 bg-white rounded-card shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-gray-10 rounded-full"></div>
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-small text-textSecondary mb-2 transition-transform duration-200 group-hover:translate-x-1">{title}</h3>
          <p className="text-h2 font-heading font-medium mb-2 transition-transform duration-200 group-hover:-translate-y-1">{value}</p>
          {description && (
            <p className="text-small">{description}</p>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colorClass} transform transition-transform duration-300 group-hover:scale-110`}>
          {React.cloneElement(icon, { className: `text-xl ${icon.props.className || ''}` })}
        </div>
      </div>
      
      {/* Bottom Accent Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent w-0 group-hover:w-full transition-all duration-300"></div>
    </div>
  )
}

export default StatCard 