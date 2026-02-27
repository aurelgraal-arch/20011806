import { create } from 'zustand'

export interface Mission {
  id: string
  title: string
  description: string
  xpReward: number
  coinReward: number
  completed: boolean
}

interface MissionState {
  missions: Mission[]
  addMission: (m: Mission) => void
  completeMission: (id: string) => void
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  addMission: (m) => set((s) => ({ missions: [...s.missions, m] })),
  completeMission: (id) =>
    set((s) => ({
      missions: s.missions.map((m) => (m.id === id ? { ...m, completed: true } : m)),
    })),
}))
