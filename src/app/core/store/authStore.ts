/**
 * Authentication Store (Zustand)
 * Central state management for user authentication and session
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AuthState, SignUpData } from '../../types'
import { authService } from '../services/authService'


export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (hash: string) => {
          set({ isLoading: true, error: null })
          try {
            const user = await authService.loginWithHash(hash)
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })
            return user
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed'
            set({ error: message, isLoading: false })
            throw new Error(message)
          }
        },

        signup: async (data: SignUpData) => {
          set({ isLoading: true, error: null })
          try {
            const user = await authService.signup(data)
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })
            return user
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Signup failed'
            set({ error: message, isLoading: false })
            throw new Error(message)
          }
        },

        logout: async () => {
          set({ isLoading: true, error: null })
          try {
            await authService.logout()
          } catch (err) {
            // ignore
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        },

        refreshSession: async () => {
          set({ isLoading: true })
          try {
            const user = await authService.getCurrentUser()
            if (user) {
              set({ user, isAuthenticated: true })
            } else {
              set({ user: null, isAuthenticated: false })
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Session refresh failed',
            })
          } finally {
            set({ isLoading: false })
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
)
