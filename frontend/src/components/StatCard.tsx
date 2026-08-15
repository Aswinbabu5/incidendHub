// import React from 'react'

interface StatCard {
    title: string
    value: number
}

const StatCard = ({ title, value }: StatCard) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <h3>{value}</h3>
    </div>
  )
}

export default StatCard
