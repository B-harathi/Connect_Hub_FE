import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCamera, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { generateAvatarUrl } from '../../utils/helpers';
import { validateName, validateBio } from '../../utils/validation';
import Button from '../common/Button';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }
    
    const bioValidation = validateBio(formData.bio);
    if (!bioValidation.isValid) {
      newErrors.bio = bioValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-soft-lg overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-purple">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <img
              src={user?.avatar || generateAvatarUrl(user?.name)}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors">
              <HiOutlineCamera className="w-4 h-4" />
            </button>
          </div>

          {/* Edit Button */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                icon={<HiOutlinePencil />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className={`input-field ${errors.bio ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.bio.length}/200 characters
                </p>
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.bio}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={<HiOutlineCheck />}
                  size="sm"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  icon={<HiOutlineX />}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            /* Profile Display */
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.bio || 'No bio added yet.'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Member Since
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;