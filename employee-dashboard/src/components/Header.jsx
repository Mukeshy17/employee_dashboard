import React from "react";
import { User, Settings } from "lucide-react";

const Header = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Employee Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Beautiful, minimal and data-friendly admin experience
        </p>
      </div>
    </div>
  );
};

export default Header;
