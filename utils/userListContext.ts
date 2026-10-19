const USER_LIST_QUERY_KEYS = ['role', 'status', 'organization_id', 'mcn_id', 'page', 'searchBy', 'searchValue'] as const

export function userListContext(query: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of USER_LIST_QUERY_KEYS) {
    if (typeof query[key] === 'string') result[key] = query[key] as string
  }
  return result
}
