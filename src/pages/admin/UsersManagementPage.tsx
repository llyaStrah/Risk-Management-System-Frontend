import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, User } from '../../api/usersApi'
import { Trash2, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UsersManagementPage() {
  const [page, setPage] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrentUser,
  })

  // Check if user is admin
  useEffect(() => {
    if (currentUser && !currentUser.roles.includes('ROLE_ADMIN')) {
      navigate('/')
    }
  }, [currentUser, navigate])

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => usersApi.getAllUsers(page, 10),
    enabled: currentUser?.roles.includes('ROLE_ADMIN'),
  })

  const updateRolesMutation = useMutation({
    mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
      usersApi.updateUserRoles(userId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setSelectedUser(null)
      alert('User roles updated successfully!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      alert('User deleted successfully!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete user')
    },
  })

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleUpdateRoles = () => {
    if (selectedUser) {
      updateRolesMutation.mutate({ userId: selectedUser.id, roles: selectedRoles })
    }
  }

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?\n\nThis will delete all their portfolios, assets, risks, and simulations!`)) {
      deleteMutation.mutate(user.id)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management</h1>

      {!currentUser?.roles.includes('ROLE_ADMIN') ? (
        <div className="card text-center py-12">
          <p className="text-red-600 font-semibold">Access Denied: Admin privileges required</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="card">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Username</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Roles</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.content?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4 font-semibold">{user.username}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.roles.map((role) => (
                        <span key={role} className="badge badge-primary mr-1">
                          {role.replace('ROLE_', '')}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setSelectedRoles(user.roles)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Manage roles"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete user"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page + 1} of {users?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (users?.totalPages || 1) - 1}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              Manage Roles: {selectedUser.username}
            </h2>
            <div className="space-y-3 mb-6">
              {['ROLE_USER', 'ROLE_ANALYST', 'ROLE_ADMIN'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="mr-3"
                  />
                  <span>{role.replace('ROLE_', '')}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleUpdateRoles}
                className="btn btn-primary flex-1"
                disabled={updateRolesMutation.isPending}
              >
                Save
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
