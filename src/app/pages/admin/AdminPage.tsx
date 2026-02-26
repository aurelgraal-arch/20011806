/**
 * Admin Panel Page
 * Dashboard for platform administrators
 */

import React from 'react'
import { Card, StatCard, Badge, Table, Button } from '../../components/ui'
import { UserRole } from '../../types'

export const AdminPage: React.FC = () => {

  // Mock data
  const platformStats = {
    total_users: 1234,
    active_users_24h: 456,
    total_missions_completed: 8900,
    total_tokens_distributed: 123456,
    total_reputation_issued: 567890,
    average_user_level: 2.4,
  }

  const recentUsers = [
    {
      id: '1',
      username: 'user1',
      email: 'user1@example.com',
      role: UserRole.USER,
      reputation: 245,
      status: 'active',
    },
    {
      id: '2',
      username: 'user2',
      email: 'user2@example.com',
      role: UserRole.USER,
      reputation: 180,
      status: 'active',
    },
  ]

  const adminLogs = [
    {
      id: '1',
      action: 'User Frozen',
      target: 'malicious_user_123',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      reason: 'Spam activity',
    },
    {
      id: '2',
      action: 'Mission Created',
      target: 'Weekly Challenge #42',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      reason: 'New governance mission',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-slate-400">Platform management and monitoring</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={platformStats.total_users}
          icon="👥"
          trend="up"
          trendValue="156 new"
        />
        <StatCard
          label="Active (24h)"
          value={platformStats.active_users_24h}
          icon="🟢"
          trend="up"
          trendValue="37%"
        />
        <StatCard
          label="Missions Completed"
          value={platformStats.total_missions_completed}
          icon="✅"
          trend="up"
          trendValue="324 today"
        />
        <StatCard
          label="Tokens Distributed"
          value={platformStats.total_tokens_distributed}
          icon="💰"
          trend="up"
          trendValue="45k this week"
        />
        <StatCard
          label="Reputation Issued"
          value={platformStats.total_reputation_issued}
          icon="⭐"
          trend="up"
          trendValue="78k this week"
        />
        <StatCard
          label="Avg User Level"
          value={platformStats.average_user_level.toFixed(1)}
          icon="📊"
          trend="up"
          trendValue="+0.2"
        />
      </div>

      {/* User Management */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Users</h2>
          <Button variant="primary" size="sm">
            + Add User
          </Button>
        </div>

        <Table
          columns={[
            { key: 'username', label: 'Username' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'reputation', label: 'Reputation' },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <Badge
                  label={value}
                  variant={value === 'active' ? 'success' : 'warning'}
                />
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: () => (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="danger" size="sm">
                    Freeze
                  </Button>
                </div>
              ),
            },
          ]}
          data={recentUsers}
        />
      </Card>

      {/* Admin Logs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Admin Logs</h2>

        <div className="space-y-3">
          {adminLogs.map((log) => (
            <div
              key={log.id}
              className="flex justify-between items-start p-3 bg-slate-800 rounded-lg"
            >
              <div>
                <p className="font-medium text-white">{log.action}</p>
                <p className="text-sm text-slate-400">{log.target}</p>
                <p className="text-xs text-slate-500 mt-1">Reason: {log.reason}</p>
              </div>
              <p className="text-xs text-slate-500 whitespace-nowrap ml-4">
                {new Date(log.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Token Circulation */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Token Circulation</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">In Circulation</p>
            <p className="text-2xl font-bold text-blue-400">2,450,000</p>
            <p className="text-xs text-slate-500 mt-2">Total active tokens</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Staked</p>
            <p className="text-2xl font-bold text-purple-400">156,000</p>
            <p className="text-xs text-slate-500 mt-2">In staking contracts</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Reserved</p>
            <p className="text-2xl font-bold text-green-400">100,000</p>
            <p className="text-xs text-slate-500 mt-2">For future distribution</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminPage
