import React from 'react'


const GlassCard = ({ children, className = '' }) => (
<div className={`rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md p-6 ${className}`}>
{children}
</div>
)


export default GlassCard