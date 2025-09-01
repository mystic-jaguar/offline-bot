import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Calendar, Shield, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RegisteredUser } from '../types';

const UserManagement: React.FC = () => {
  const { addUser, getUsers, deleteUser, user: currentUser } = useAuth();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user' as 'admin' | 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.username || !formData.password || !formData.email) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await addUser(formData.username, formData.password, formData.email, formData.role);
    
    if (result.success) {
      setSuccess(result.message);
      setFormData({ username: '', password: '', email: '', role: 'user' });
      setShowAddForm(false);
      loadUsers();
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own account");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      const success = await deleteUser(userId);
      if (success) {
        setSuccess(`User "${username}" deleted successfully`);
        loadUsers();
      } else {
        setError('Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', email: '', role: 'user' });
    setError('');
    setSuccess('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">User Management</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Add and manage user accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {(error || success) && (
        <div className="mb-4">
          {error && (
            <div className="text-red-600 dark:text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-500/10 p-3 rounded-lg border border-green-200 dark:border-green-500/30">
              {success}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-200 dark:border-zinc-700 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Add New User</h3>
            <button
              onClick={resetForm}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors duration-300"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors duration-300"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors duration-300"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors duration-300"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700 disabled:bg-zinc-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Create User
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-500 dark:hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-zinc-900 dark:text-zinc-50 mb-3">
          Registered Users ({users.length})
        </h3>
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            No users found
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user.role === 'admin'
                      ? 'bg-red-100 dark:bg-red-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-700'
                  }`}>
                    {user.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {user.username}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {user.role}
                      </span>
                      {user.id === currentUser?.id && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="p-2 text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
