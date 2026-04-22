import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, UpdateProfileRequest } from '../../api/usersApi'
import { Save } from 'lucide-react'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<UpdateProfileRequest>({})
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrentUser,
  })

  const updateMutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      alert('Profile updated successfully!')
      setFormData({})
      setShowPasswordFields(false)
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">Username:</span>
            <span className="ml-2 font-semibold">{user?.username}</span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-semibold">{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Roles:</span>
            <span className="ml-2">
              {user?.roles.map(role => (
                <span key={role} className="badge badge-primary mr-2">
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Member since:</span>
            <span className="ml-2">{new Date(user?.createdAt || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input"
              placeholder={user?.username}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder={user?.email}
            />
          </div>

          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-primary-600 hover:text-primary-800 font-semibold"
            >
              {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>

          {showPasswordFields && (
            <>
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword || ''}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="input"
                  required={showPasswordFields}
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword || ''}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="input"
                  required={showPasswordFields}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={updateMutation.isPending}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
