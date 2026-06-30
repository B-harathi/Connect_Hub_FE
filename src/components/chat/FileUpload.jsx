import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineCloudUpload, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import { formatFileSize, getFileIcon } from '../../utils/helpers';
import { FILE_UPLOAD } from '../../utils/constants';

const FilePreview = ({ file, onRemove, onPreview }) => {
  const isImage = file.type.startsWith('image/');
  const fileSize = formatFileSize(file.size);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
    >
      <div className="flex items-center space-x-3">
        {/* File preview */}
        <div className="flex-shrink-0">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-12 w-12 object-cover rounded-lg"
            />
          ) : (
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">{getFileIcon(file.type)}</span>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {fileSize}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isImage && (
            <button
              onClick={() => onPreview(file)}
              className="p-1 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              title="Preview"
            >
              <HiOutlineEye className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onRemove(file)}
            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remove"
          >
            <HiOutlineTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar (for upload progress) */}
      {file.uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{file.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
            <div
              className="bg-purple-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${file.progress || 0}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ImagePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-4xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors z-10"
        >
          <HiOutlineX className="h-6 w-6" />
        </button>
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm opacity-75">{formatFileSize(file.size)}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FileUpload = ({ onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            console.error(`File ${file.name} is too large`);
          } else if (error.code === 'file-invalid-type') {
            console.error(`File ${file.name} has invalid type`);
          }
        });
      });
    }

    // Add accepted files
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: FILE_UPLOAD.MAX_SIZE,
    maxFiles: FILE_UPLOAD.MAX_FILES,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // TODO: Implement actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      onUpload(files);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const isOverLimit = totalSize > FILE_UPLOAD.MAX_SIZE * FILE_UPLOAD.MAX_FILES;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Files
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <input {...getInputProps()} />
              <HiOutlineCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Choose files or drag and drop'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Images, videos, audio, documents up to {formatFileSize(FILE_UPLOAD.MAX_SIZE)} each
              </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <FilePreview
                        key={`${file.name}-${index}`}
                        file={file}
                        onRemove={removeFile}
                        onPreview={setPreviewFile}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Size warning */}
                {isOverLimit && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Total file size exceeds the limit. Please remove some files.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {files.length > 0 && (
                <span>
                  {files.length} file{files.length > 1 ? 's' : ''} • {formatFileSize(totalSize)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isOverLimit || isUploading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isUploading ? 'Uploading...' : `Send ${files.length} file${files.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <ImagePreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FileUpload;