// Component StatCard dùng chung để hiển thị các chỉ số thống kê
import React from 'react'

const StatCard = ({ title, value, icon, bgColor, textColor }) => (
  <div className="bg-white rounded-card shadow-card p-6 transition-all duration-200 hover:shadow-card-hover">
    <div className="flex items-center mb-3">
      <div className={`p-3 rounded-full ${bgColor} ${textColor} mr-3`}>
        {icon}
      </div>
      <h3 className="text-h3 font-heading text-textPrimary">{title}</h3>
    </div>
    <p className="text-h1 font-heading">{value}</p>
  </div>
)

export default StatCard 