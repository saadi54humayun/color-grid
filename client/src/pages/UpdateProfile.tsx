import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UpdateProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: '',
    confirmPassword: '',
    profile_picture_url: user?.profile_picture_url || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.password && formData.password !== formData.confirmPassword) 
    {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const updateData: any = {};
      if (formData.username && formData.username !== user?.username) {
        updateData.username = formData.username;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }
      if (formData.profile_picture_url && formData.profile_picture_url !== user?.profile_picture_url) {
        updateData.profile_picture_url = formData.profile_picture_url;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setSuccess(true);

        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      } else {
        setError('No changes to update');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-profile-container">
      <h1>Update Profile</h1>

      {success && (
        <div className="success-message">Profile updated successfully!</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter new username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password (leave blank to keep current)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="profile_picture_url">Profile Picture URL</label>
          <input
            type="text"
            id="profile_picture_url"
            name="profile_picture_url"
            value={formData.profile_picture_url}
            onChange={handleChange}
            placeholder="Enter profile picture URL"
          />
        </div>

        {formData.profile_picture_url && (
          <div className="profile-preview">
            <img
              src={formData.profile_picture_url}
              alt="Profile Preview"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
              }}
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/home')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
