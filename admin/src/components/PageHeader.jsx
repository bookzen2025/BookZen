// Component PageHeader dùng chung cho các trang trong admin dashboard
import React from 'react'

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-h1 font-heading text-textPrimary">{title}</h1>
        {subtitle && <p className="text-body text-textSecondary">{subtitle}</p>}
      </div>
      
      {actions && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader 