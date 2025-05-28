import React, { useState } from 'react';
import { 
  BarChart, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ClipboardList, 
  Home, 
  MessageSquare, 
  User, 
  Users 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          isActive 
            ? 'bg-primary-100 text-primary-700' 
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

interface NavGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ label, icon, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-md transition-colors duration-200"
      >
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="pl-10 pr-2 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r border-neutral-200 bg-white overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-center py-4">
          <span className="text-2xl font-bold text-primary-600">Pharma<span className="text-secondary-600">CRM</span></span>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavItem icon={<Home className="h-5 w-5" />} label="Dashboard" to="/" />
        
        <NavGroup icon={<Users className="h-5 w-5" />} label="HCP Management">
          <NavItem icon={<User className="h-5 w-5" />} label="HCP Directory" to="/hcps" />
          <NavItem icon={<MessageSquare className="h-5 w-5" />} label="Interactions" to="/interactions" />
        </NavGroup>
        
        <NavItem icon={<Calendar className="h-5 w-5" />} label="Calendar" to="/calendar" />
        <NavItem icon={<ClipboardList className="h-5 w-5" />} label="Tasks" to="/tasks" />
        <NavItem icon={<BarChart className="h-5 w-5" />} label="Reports" to="/reports" />
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-900">John Smith</p>
            <p className="text-xs text-neutral-500">Sales Representative</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;