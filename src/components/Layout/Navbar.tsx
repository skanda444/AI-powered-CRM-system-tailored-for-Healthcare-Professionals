import React from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center lg:w-64">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-primary-600">Pharma<span className="text-secondary-600">CRM</span></span>
          </div>
        </div>
        
        <div className="hidden md:flex flex-1 mx-8">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search HCPs, interactions..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1 text-neutral-400 hover:text-neutral-500 focus:outline-none">
            <Bell className="h-6 w-6" />
          </button>
          <button className="p-1 text-neutral-400 hover:text-neutral-500 focus:outline-none">
            <Settings className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <button className="flex items-center focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-neutral-700 hidden lg:block">John Smith</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;