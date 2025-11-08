import React from "react";

const Navigation = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="mb-6">
      <nav className="flex gap-3 overflow-x-auto py-4 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-white/90 text-slate-900 shadow-lg border border-slate-200"
                  : "text-slate-500 hover:bg-white/30"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  activeTab === tab.id ? "text-slate-800" : "text-slate-400"
                }`}
              />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;
