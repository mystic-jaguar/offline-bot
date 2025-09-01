import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { KnowledgeBase } from '../types';

interface FileUploadProps {
  onFileUpload: (knowledgeBase: KnowledgeBase) => void;
  knowledgeBase: KnowledgeBase | null;
  onRemoveFile: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, knowledgeBase, onRemoveFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      alert('Please upload a .txt file');
      return;
    }

    try {
      const content = await file.text();
      const newKnowledgeBase: KnowledgeBase = {
        filename: file.name,
        content,
        uploadDate: new Date(),
        chunks: []
      };
      
      onFileUpload(newKnowledgeBase);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (knowledgeBase) {
    return (
      <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4 mb-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">{knowledgeBase.filename}</p>
              <p className="text-sm text-green-600 dark:text-green-300">
                Uploaded on {knowledgeBase.uploadDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onRemoveFile}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-2">
          Knowledge base loaded successfully! You can now ask questions about the content.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center mb-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-300">
      <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">Upload Your Text Data</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        Upload a .txt file containing the information you want to chat about
      </p>
      <button
        onClick={handleUploadClick}
        className="bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Choose File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Only .txt files are supported</p>
    </div>
  );
};

export default FileUpload;
