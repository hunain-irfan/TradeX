/** Default home after login for each role */
export function getAppHomePath(isAdmin) {
  return isAdmin ? '/admin' : '/dashboard'
}
