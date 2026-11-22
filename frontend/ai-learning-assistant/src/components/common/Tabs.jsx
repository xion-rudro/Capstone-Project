import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative pb-4 px-6 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.name
                  ? "text-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>

              {/* Active Tab Indicator */}
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div key={tab.name} className="w-full">
                {tab.content}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default Tabs;