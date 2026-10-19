// Mirrors atlas-platform-core app.utils.rbac.assignable_roles_for_actor / ROLE_RANK.
// Keep this rank table in sync with rbac.py if new roles are added.
export const ROLE_RANK: Record<string, number> = {
  atlas_superadmin: 100,
  atlas_admin: 90,
  org_owner: 80,
  org_admin: 70,
  mcn_operator: 60,
  creator: 50,
}

const ALL_ROLES = Object.keys(ROLE_RANK)

export interface RoleOption {
  value: string
  label: string
}

export const ROLE_LABELS: Record<string, string> = {
  atlas_superadmin: 'Atlas Superadmin',
  atlas_admin: 'Atlas Admin',
  org_owner: 'Org Owner',
  org_admin: 'Org Admin',
  mcn_operator: 'MCN Operator',
  creator: 'Creator',
}

/** Global roles the actor may grant to another user. Mirrors rbac.assignable_roles_for_actor. */
export const assignableRolesForActor = (actorRole: string | undefined): string[] => {
  if (!actorRole) return []
  if (actorRole === 'atlas_superadmin') return [...ALL_ROLES]
  if (actorRole === 'atlas_admin') return ALL_ROLES.filter((r) => r !== 'atlas_superadmin')
  const actorRank = ROLE_RANK[actorRole] ?? 0
  return ALL_ROLES.filter((r) => ROLE_RANK[r] < actorRank)
}

export const assignableRoleOptionsForActor = (actorRole: string | undefined): RoleOption[] => {
  return assignableRolesForActor(actorRole).map((value) => ({
    value,
    label: ROLE_LABELS[value] || value,
  }))
}
