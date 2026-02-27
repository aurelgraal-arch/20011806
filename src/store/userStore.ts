import { create } from 'zustand'

interface UserState {
  level: number
  xp: number
  walletBalance: number
  incrementXP: (n: number) => void
  addCoins: (n: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  level: 1,
  xp: 0,
  walletBalance: 0,
  incrementXP: (n) =>
    set((s) => {
      const xp = s.xp + n
      const lvl = Math.floor(xp / 100) + 1
      return { xp, level: lvl }
    }),
  addCoins: (n) => set((s) => ({ walletBalance: s.walletBalance + n })),
}))
