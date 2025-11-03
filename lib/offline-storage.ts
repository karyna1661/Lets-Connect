// localStorage-based storage for offline demo mode
export const offlineStorage = {
  getProfile: (userId: string) => {
    const data = localStorage.getItem(`profile_${userId}`)
    return data ? JSON.parse(data) : null
  },

  saveProfile: (userId: string, profile: any) => {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile))
  },

  getConnections: (userId: string) => {
    const data = localStorage.getItem(`connections_${userId}`)
    return data ? JSON.parse(data) : []
  },

  addConnection: (userId: string, connection: any) => {
    const connections = offlineStorage.getConnections(userId)
    connections.push({ ...connection, id: `offline_${Date.now()}`, created_at: new Date().toISOString() })
    localStorage.setItem(`connections_${userId}`, JSON.stringify(connections))
  },

  deleteConnection: (userId: string, connectionId: string) => {
    const connections = offlineStorage.getConnections(userId)
    const filtered = connections.filter((c: any) => c.id !== connectionId)
    localStorage.setItem(`connections_${userId}`, JSON.stringify(filtered))
  },

  updateNotes: (userId: string, connectionId: string, notes: string) => {
    const connections = offlineStorage.getConnections(userId)
    const updated = connections.map((c: any) => (c.id === connectionId ? { ...c, notes } : c))
    localStorage.setItem(`connections_${userId}`, JSON.stringify(updated))
  },

  clear: () => {
    localStorage.clear()
  },
}
