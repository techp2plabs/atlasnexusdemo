// Mirrors atlas-platform-core app.utils.rbac.can_verify_users.
export const ROLES_CAN_MANAGE_USERS_AND_INVITES = [
  'atlas_superadmin',
  'atlas_admin',
  'org_owner',
  'org_admin',
  'mcn_operator',
] as const

export const roleCanManageUsersAndInvites = (role: string | undefined): boolean => {
  if (!role) return false
  return ROLES_CAN_MANAGE_USERS_AND_INVITES.includes(
    role as (typeof ROLES_CAN_MANAGE_USERS_AND_INVITES)[number],
  )
}
