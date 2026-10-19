// Roles allowed to create (invite) a new user from the Users page.
// Narrower than ROLES_CAN_MANAGE_USERS_AND_INVITES (which also lets mcn_operator view/verify).
export const ROLES_CAN_CREATE_USERS = [
  'atlas_superadmin',
  'atlas_admin',
  'org_owner',
  'org_admin',
] as const

export const roleCanCreateUsers = (role: string | undefined): boolean => {
  if (!role) return false
  return ROLES_CAN_CREATE_USERS.includes(role as (typeof ROLES_CAN_CREATE_USERS)[number])
}
