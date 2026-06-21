import React, { useState } from "react";
import { useApp } from "../AppContext";
import { 
  Leaf, 
  LayoutDashboard, 
  MessageSquareCode, 
  Calculator, 
  FileInput, 
  ScanBarcode, 
  FileSpreadsheet, 
  Trophy, 
  UserRound, 
  LogOut, 
  Menu, 
  X,
  Flame
} from "lucide-react";

export default function Sidebar() {
  const { profile, activePage, setActivePage, signOutSession, guestMode, signIn } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tracker", label: "AI Tracker", icon: FileInput },
    { id: "calculator", label: "Calculator", icon: Calculator },
    { id: "coach", label: "AI Coach", icon: MessageSquareCode },
    { id: "receipt", label: "Receipt Scanner", icon: ScanBarcode },
    { id: "insights", label: "Insights Reports", icon: FileSpreadsheet },
    { id: "challenges", label: "Challenges", icon: Trophy },
    { id: "profile", label: "User Profile", icon: UserRound },
  ];

  return (
    <>
      {/* Mobile top navigation rail */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-emerald-100 p-4 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Leaf aria-hidden="true" size={22} className="animate-pulse" />
          </div>
          <span className="font-semibold text-charcoal-900 text-lg tracking-tight">CarbonWise AI</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </div>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-emerald-50 flex flex-col justify-between 
        transition-transform duration-300 transform md:translate-x-0 md:static md:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-emerald-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500 rounded-xl text-white">
                <Leaf aria-hidden="true" size={18} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 tracking-tight leading-tight">CarbonWise AI</h1>
                <p className="text-[10px] text-emerald-600 font-medium tracking-wider uppercase">AI Eco Platform</p>
              </div>
            </div>
          </div>

          {/* Quick Active Badge Profile */}
          {profile && (
            <div className="px-5 py-4 border-b border-emerald-50/50 bg-emerald-50/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold select-none text-sm shrink-0 overflow-hidden">
                  {profile.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt={profile.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{profile.name[0]?.toUpperCase() || "E"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{profile.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      Lv.{profile.level}
                    </span>
                    {profile.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                        <Flame aria-hidden="true" size={12} className="fill-amber-500 stroke-amber-600" /> {profile.streak}d
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  aria-label={`Navigate to ${item.label}`}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive 
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10" 
                      : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/75"}
                  `}
                >
                  <IconComponent aria-hidden="true" size={18} className={isActive ? "text-white" : "text-gray-400"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility buttons (Sign Out, guest metadata) */}
        <div className="p-4 border-t border-emerald-50">
          {guestMode && (
            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-center space-y-2">
              <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                Using Guest Sandbox mode.
              </p>
              <button
                onClick={() => {
                  signIn();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-white text-gray-700 font-bold text-[10px] py-2 px-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google Sign-In</span>
              </button>
            </div>
          )}
          <button
            onClick={() => {
              signOutSession();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-hidden"
          >
            <LogOut aria-hidden="true" size={16} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
