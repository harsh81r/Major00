import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye,
  EyeOff,
  Code,
  Settings
} from 'lucide-react';

const FileExplorer = ({ 
  files, 
  onFileSelect, 
  selectedFile, 
  onFileCreate, 
  onFileDelete, 
  username, 
  role,
  onRoleChange 
}) => {
  const [expandedFolders, setExpandedFolders] = useState(['frontend', 'backend']);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [targetUser, setTargetUser] = useState('');

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    );
  };

  const canEditFile = (filePath) => {
    const [directory] = filePath.split('/');
    switch (role) {
      case 'admin':
        return true;
      case 'frontend_dev':
        return directory === 'frontend';
      case 'backend_dev':
        return directory === 'backend';
      default:
        return false;
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'py':
        return <Code className="w-4 h-4 text-green-500" />;
      case 'html':
        return <File className="w-4 h-4 text-orange-500" />;
      case 'css':
        return <File className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <File className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleRoleChange = () => {
    if (targetUser && newRole && role === 'admin') {
      onRoleChange(targetUser, newRole);
      setTargetUser('');
      setNewRole('');
      setShowRoleManager(false);
    }
  };

  const renderFile = (filePath, fileName) => {
    const isSelected = selectedFile === filePath;
    const canEdit = canEditFile(filePath);
    
    return (
      <div
        key={filePath}
        className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-700 ${
          isSelected ? 'bg-blue-600' : ''
        } ${!canEdit ? 'opacity-50' : ''}`}
        onClick={() => canEdit && onFileSelect(filePath)}
      >
        {getFileIcon(fileName)}
        <span className="text-sm text-white truncate">{fileName}</span>
        {!canEdit && <EyeOff className="w-3 h-3 text-gray-400" />}
      </div>
    );
  };

  const renderFolder = (folderName, folderFiles) => {
    const isExpanded = expandedFolders.includes(folderName);
    const folderIcon = isExpanded ? FolderOpen : Folder;
    const folderColor = folderName === 'frontend' ? 'text-blue-400' : 'text-green-400';

    return (
      <div key={folderName} className="mb-2">
        <div
          className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-700"
          onClick={() => toggleFolder(folderName)}
        >
          <folderIcon className={`w-4 h-4 ${folderColor}`} />
          <span className="text-sm font-medium text-white">{folderName}</span>
        </div>
        {isExpanded && (
          <div className="ml-4 space-y-1">
            {Object.entries(folderFiles).map(([fileName, content]) => 
              renderFile(`${folderName}/${fileName}`, fileName)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="flex items-center justify-between p-3 bg-gray-700 border-b border-gray-600">
        <h3 className="font-semibold text-white">Files</h3>
        <div className="flex items-center space-x-2">
          {role === 'admin' && (
            <button
              onClick={() => setShowRoleManager(true)}
              className="p-1 text-gray-400 hover:text-white"
              title="Manage Roles"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onFileCreate()}
            className="p-1 text-gray-400 hover:text-white"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(files).map(([folderName, folderFiles]) => 
          renderFolder(folderName, folderFiles)
        )}
      </div>

      {showRoleManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Manage User Roles</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="frontend_dev">Frontend Developer</option>
                  <option value="backend_dev">Backend Developer</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowRoleManager(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={!targetUser || !newRole}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
