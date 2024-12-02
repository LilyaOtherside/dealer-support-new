import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onClose: () => void;
  onSave: (userData: { name: string; email: string; avatar?: string }) => void;
  onUploadAvatar?: (file: File) => Promise<string>;
}

export function ProfileSettings({ user, onClose, onSave, onUploadAvatar }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      try {
        setIsUploading(true);
        const newAvatarUrl = await onUploadAvatar(file);
        setAvatar(newAvatarUrl);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({ name, email, avatar });
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {isUploading ? (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <>
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-24 h-24 rounded-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center group-hover:opacity-75 transition-opacity">
                      <span className="text-white text-2xl font-medium">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100">
                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to upload new photo
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}