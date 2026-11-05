'use client';

import React, { useState, useMemo } from 'react';
import { Shield, Trash2, Search, UserCheck, Users, Store, ShieldCheck } from 'lucide-react';
import {
  DataTable,
  Column,
  Input,
  Select,
  StatusBadge,
  StatCard,
  Pagination,
  Modal,
  ConfirmDialog,
  Button,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { RoleGuard } from '@/components/layout/RoleGuard/RoleGuard';
import { useUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { UserProfile, UserRole } from '@/types/user';
import { formatDate } from '@/lib/format';
import clsx from 'clsx';
import dashboardStyles from '../dashboard.module.css';
import styles from './customers.module.css';

type RoleTab = 'all' | 'customer' | 'seller' | 'admin';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer (Storefront shopper)' },
  { value: 'seller', label: 'Seller (Catalog & Inventory manager)' },
  { value: 'admin', label: 'Admin (Full system operator)' },
];

export function CustomersClientView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<RoleTab>('all');

  // Modal states
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const addToast = useToastStore((state) => state.addToast);

  const queryParams = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    role: activeTab !== 'all' ? (activeTab as UserRole) : undefined,
  };

  const { data, isLoading } = useUsersQuery(queryParams);
  const { data: allUsersData } = useUsersQuery({ limit: 100 });
  const updateRoleMutation = useUpdateUserRoleMutation();
  const deleteMutation = useDeleteUserMutation();

  const users = data?.users || [];
  const totalCount = data?.pagination?.totalResults || users.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const allUsers = allUsersData?.users || users;
  const metrics = useMemo(() => {
    let customers = 0;
    let sellers = 0;
    let admins = 0;
    allUsers.forEach((u) => {
      if (u.role === 'customer') customers += 1;
      else if (u.role === 'seller') sellers += 1;
      else if (u.role === 'admin') admins += 1;
    });
    return {
      total: allUsersData?.pagination?.totalResults || allUsers.length,
      customers,
      sellers,
      admins,
    };
  }, [allUsers, allUsersData?.pagination?.totalResults]);

  const handleOpenRoleModal = (u: UserProfile) => {
    setEditingUser(u);
    setNewRole(u.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: editingUser._id || editingUser.id || '',
        role: newRole,
      });
      addToast(`Updated role for ${editingUser.firstName} to ${newRole}`, 'success');
      setEditingUser(null);
    } catch {
      addToast('Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser._id || deletingUser.id || '');
      addToast(`User ${deletingUser.firstName} ${deletingUser.lastName} removed`, 'success');
      setDeletingUser(null);
    } catch {
      addToast('Failed to delete user', 'error');
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      key: 'name',
      header: 'User',
      width: '35%',
      render: (u) => {
        const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'U';
        const isSelf = Boolean(
          currentUser &&
          (u._id === currentUser._id || (currentUser.email && u.email === currentUser.email))
        );
        return (
          <div className={styles.userCell}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userMeta}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={styles.userName}>
                  {u.firstName} {u.lastName}
                </span>
                {isSelf && <span className={styles.youBadge}>You</span>}
              </div>
              <span className={styles.userEmail}>{u.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'System Role',
      width: '18%',
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      key: 'status',
      header: 'Account Status',
      width: '18%',
      render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      header: 'Joined Date',
      width: '15%',
      render: (u) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '14%',
      render: (u) => {
        const isSelf = Boolean(
          currentUser &&
          (u._id === currentUser._id || (currentUser.email && u.email === currentUser.email))
        );
        return (
          <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className={dashboardStyles.actionButton}
              onClick={() => handleOpenRoleModal(u)}
              title="Change role privileges"
              aria-label={`Change role for ${u.firstName}`}
            >
              <Shield size={15} />
            </button>

            <button
              type="button"
              className={clsx(dashboardStyles.actionButton, dashboardStyles.actionButtonDanger)}
              onClick={() => !isSelf && setDeletingUser(u)}
              disabled={isSelf}
              title={isSelf ? 'Cannot delete active administrator session' : 'Remove user'}
              aria-label={`Delete ${u.firstName}`}
              style={isSelf ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className={dashboardStyles.pageContainer}>
        {/* Header */}
        <PageHeader
          title="Users & Customers Directory"
          subtitle="Manage customer accounts, verified sellers, and administrator security privileges."
        />

        {/* 4 Metric Cards */}
        <div className={styles.kpiGrid}>
          <StatCard
            title="Total Accounts"
            value={metrics.total}
            isLoading={isLoading}
            icon={<Users size={20} />}
            description="Registered accounts in system"
          />
          <StatCard
            title="Customers"
            value={metrics.customers}
            isLoading={isLoading}
            icon={<UserCheck size={20} />}
            description="Active storefront shoppers"
          />
          <StatCard
            title="Verified Sellers"
            value={metrics.sellers}
            isLoading={isLoading}
            icon={<Store size={20} />}
            description="Catalog & inventory managers"
          />
          <StatCard
            title="Administrators"
            value={metrics.admins}
            isLoading={isLoading}
            icon={<ShieldCheck size={20} />}
            description="Privileged operations staff"
          />
        </div>

        {/* Filters */}
        <div className={dashboardStyles.controlsBar}>
          <div className={dashboardStyles.filterTabs} role="tablist">
            {(['all', 'customer', 'seller', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={clsx(
                  dashboardStyles.tabButton,
                  activeTab === tab && dashboardStyles.tabButtonActive
                )}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
              >
                {tab === 'all' ? 'All Accounts' : tab.charAt(0).toUpperCase() + tab.slice(1) + 's'}
              </button>
            ))}
          </div>

          <div className={styles.searchInput}>
            <Input
              id="userSearch"
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyTitle="No accounts found"
          emptyMessage="No users match your active search or role criteria."
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          itemsPerPage={10}
          itemLabel="users"
        />

        {/* Change Role Modal */}
        {editingUser && (
          <Modal
            isOpen={Boolean(editingUser)}
            onClose={() => setEditingUser(null)}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="var(--color-primary)" />
                <span>Change User Privileges</span>
              </div>
            }
            footer={
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  disabled={updateRoleMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveRole}
                  isLoading={updateRoleMutation.isPending}
                >
                  Save New Role
                </Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Select access level for{' '}
                <strong>
                  {editingUser.firstName} {editingUser.lastName}
                </strong>{' '}
                ({editingUser.email}):
              </p>

              <Select
                id="roleSelect"
                label="Assigned Role"
                options={ROLE_OPTIONS}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              />
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingUser)}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
          title="Delete User Account"
          description={`Are you sure you want to remove ${deletingUser?.firstName} ${deletingUser?.lastName}? All associated sessions will be revoked immediately.`}
          confirmLabel="Delete User"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </RoleGuard>
  );
}
export default CustomersClientView;
