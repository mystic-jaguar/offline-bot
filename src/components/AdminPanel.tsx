import React, { useState } from 'react';
import { Shield, Upload, Users, Database, UserCog } from 'lucide-react';
import FileUpload from './FileUpload';
import UserManagement from './UserManagement';
import { KnowledgeBase } from '../types';

interface AdminPanelProps {
  onFileUpload: (knowledgeBase: KnowledgeBase) => void;
  knowledgeBase: KnowledgeBase | null;
  onRemoveFile: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onFileUpload, knowledgeBase, onRemoveFile }) => {
  const [activeTab, setActiveTab] = useState<'files' | 'users'>('files');

  const tabs = [
    {
      id: 'files' as const,
      label: 'Knowledge Base',
      icon: Database,
      description: 'Manage knowledge base files'
    },
    {
      id: 'users' as const,
      label: 'User Management',
      icon: UserCog,
      description: 'Add and manage users'
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin Control Panel</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage knowledge base and users</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-zinc-500 text-zinc-600 dark:text-zinc-300'
                    : 'border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">File Management</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Upload and manage the knowledge base that all users can access
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">User Access</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            All registered users can chat with the uploaded knowledge base
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Data Security</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            All data is stored locally and remains completely offline
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'files' && (
        <div>
          <FileUpload
            onFileUpload={onFileUpload}
            knowledgeBase={knowledgeBase}
            onRemoveFile={onRemoveFile}
          />

          {knowledgeBase && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Note:</strong> This knowledge base is now available to all users. They can ask questions and get precise answers based on the uploaded content.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && <UserManagement />}
    </div>
  );
};

export default AdminPanel;
