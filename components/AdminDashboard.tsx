
import React, { useState, useEffect } from 'react';
import { User, SubscriptionTier, TIER_LIMITS } from '../types';
import { adminService } from '../services/adminService';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, currentUserEmail }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Refresh users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = () => {
    const allUsers = adminService.getAllUsers();
    setUsers(allUsers);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      adminService.updateUser(editingUser);
      loadUsers(); // Refresh list
      setEditingUser(null); // Close edit mode
      
      // If we edited the current user (admin), we might need to alert them to refresh
      if (editingUser.email === currentUserEmail) {
        window.location.reload(); 
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#111] border border-gray-800 w-full max-w-7xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
             <div className="bg-red-900/30 text-albanian-red p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
             </div>
             <div>
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <p className="text-xs text-gray-500">User Management & Subscriptions</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar / List */}
            <div className={`flex-1 flex flex-col ${editingUser ? 'hidden lg:flex lg:w-3/4 border-r border-gray-800' : 'w-full'}`}>
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-800">
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-albanian-red focus:ring-1 focus:ring-albanian-red outline-none"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-900/30 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <div className="col-span-3">User</div>
                    <div className="col-span-2">Plan</div>
                    <div className="col-span-2">Usage</div>
                    <div className="col-span-2">Last Active</div>
                    <div className="col-span-2">Registered</div>
                    <div className="col-span-1 text-right">Edit</div>
                </div>

                {/* Users List */}
                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-gray-800 text-sm group">
                            <div className="col-span-3 overflow-hidden">
                                <div className="font-bold text-white truncate">{user.name}</div>
                                <div className="text-xs text-gray-500 truncate group-hover:text-gray-400 transition-colors">{user.email}</div>
                            </div>
                            <div className="col-span-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                    ${user.tier === SubscriptionTier.PREMIUM ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                                      user.tier === SubscriptionTier.STANDARD ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 
                                      'bg-gray-700 text-gray-300'}
                                `}>
                                    {user.tier}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-2 pr-4">
                                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${user.dailyUsage >= TIER_LIMITS[user.tier] ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(100, (user.dailyUsage / TIER_LIMITS[user.tier]) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">
                                        {user.dailyUsage}/{TIER_LIMITS[user.tier]}
                                    </span>
                                </div>
                            </div>
                            <div className="col-span-2 text-gray-400 text-xs font-mono">
                                {formatDate(user.lastLoginAt)}
                            </div>
                            <div className="col-span-2 text-gray-500 text-xs font-mono">
                                {formatDate(user.createdAt)}
                            </div>
                            <div className="col-span-1 text-right">
                                <button 
                                    onClick={() => setEditingUser(user)}
                                    className="text-xs bg-white/5 hover:bg-white/20 px-3 py-1.5 rounded transition-colors text-white border border-white/10"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                            <svg className="w-8 h-8 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            No users found matching "{searchTerm}".
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Panel (Right Side) */}
            {editingUser && (
                <div className="w-full lg:w-1/4 bg-gray-900/50 p-6 overflow-y-auto border-l border-gray-800 flex flex-col animate-slide-in-right">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Edit User</h3>
                        <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSaveUser} className="space-y-6">
                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-2 tracking-wider">USER IDENTITY</label>
                            <div className="p-4 bg-black border border-gray-800 rounded-lg">
                                <div className="font-bold text-white">{editingUser.name}</div>
                                <div className="text-sm text-gray-400 mb-2">{editingUser.email}</div>
                                <div className="text-[10px] text-gray-600 pt-2 border-t border-gray-800 space-y-1">
                                   <div className="flex justify-between">
                                        <span>Registered:</span>
                                        <span className="text-gray-500">{formatDate(editingUser.createdAt)}</span>
                                   </div>
                                   <div className="flex justify-between">
                                        <span>Last Active:</span>
                                        <span className="text-gray-500">{formatDate(editingUser.lastLoginAt)}</span>
                                   </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-2 tracking-wider">SUBSCRIPTION TIER</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[SubscriptionTier.FREE, SubscriptionTier.STANDARD, SubscriptionTier.PREMIUM].map(tier => (
                                    <label key={tier} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all group
                                        ${editingUser.tier === tier ? 'bg-albanian-red/10 border-albanian-red' : 'bg-black border-gray-800 hover:border-gray-600'}
                                    `}>
                                        <input 
                                            type="radio" 
                                            name="tier" 
                                            className="hidden" 
                                            checked={editingUser.tier === tier}
                                            onChange={() => setEditingUser({...editingUser, tier})}
                                        />
                                        <div className="flex-1">
                                            <div className={`text-sm font-bold ${editingUser.tier === tier ? 'text-albanian-red' : 'text-gray-300'}`}>{tier}</div>
                                            <div className="text-xs text-gray-500">{TIER_LIMITS[tier]} generations / day</div>
                                        </div>
                                        {editingUser.tier === tier && (
                                            <div className="w-2 h-2 rounded-full bg-albanian-red shadow-[0_0_8px_rgba(228,0,43,0.5)]"></div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-500 mb-2 tracking-wider">USAGE CREDITS</label>
                            <div className="bg-black border border-gray-800 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-300">Daily Usage Count</span>
                                    <span className={`font-mono font-bold text-xl ${editingUser.dailyUsage >= TIER_LIMITS[editingUser.tier] ? 'text-red-500' : 'text-white'}`}>
                                        {editingUser.dailyUsage}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingUser({...editingUser, dailyUsage: 0})}
                                        className="flex-1 bg-green-900/20 text-green-400 border border-green-900/50 hover:bg-green-900/40 py-2.5 rounded text-xs font-bold transition-colors"
                                    >
                                        Reset to 0
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setEditingUser({...editingUser, dailyUsage: Math.max(0, editingUser.dailyUsage - 5)})}
                                        className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded text-xs font-bold text-white transition-colors"
                                    >
                                        -5 Credits
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                             <button 
                                type="submit"
                                className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
                             >
                                Save Changes
                             </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
