import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage'
import { authenticateTable as apiAuthenticateTable, setupInterceptors } from '../services/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'table_credentials'
const SESSION_CHECK_INTERVAL = 60000
const SESSION_REFRESH_BEFORE = 15 * 60 * 1000

const initialState = {
  isAuthenticated: false,
  isSetupComplete: false,
  isLoading: true,
  storeId: null,
  tableNumber: null,
  sessionId: null,
  expiresAt: null,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SETUP_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isSetupComplete: true,
        isLoading: false,
        storeId: action.payload.storeId,
        tableNumber: action.payload.tableNumber,
        sessionId: action.payload.sessionId,
        expiresAt: action.payload.expiresAt,
        error: null,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'SESSION_REFRESHED':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        expiresAt: action.payload.expiresAt,
      }
    case 'INIT_COMPLETE':
      return { ...state, isLoading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const intervalRef = useRef(null)

  const logout = useCallback(() => {
    safeRemoveItem(STORAGE_KEY)
    dispatch({ type: 'LOGOUT' })
  }, [])

  const setupTable = useCallback(async (storeId, tableNumber, password) => {
    dispatch({ type: 'SETUP_START' })
    const { data, error } = await apiAuthenticateTable(storeId, tableNumber, password)
    if (data) {
      safeSetItem(STORAGE_KEY, { storeId, tableNumber, password })
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          storeId,
          tableNumber,
          sessionId: data.session_id,
          expiresAt: data.expires_at,
        },
      })
      return { success: true }
    }
    dispatch({ type: 'LOGIN_FAILURE', payload: { error } })
    return { success: false, error }
  }, [])

  // 자동 로그인
  useEffect(() => {
    async function autoLogin() {
      const credentials = safeGetItem(STORAGE_KEY)
      if (!credentials) {
        dispatch({ type: 'INIT_COMPLETE' })
        return
      }
      const { storeId, tableNumber, password } = credentials
      const { data } = await apiAuthenticateTable(storeId, tableNumber, password)
      if (data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            storeId,
            tableNumber,
            sessionId: data.session_id,
            expiresAt: data.expires_at,
          },
        })
      } else {
        safeRemoveItem(STORAGE_KEY)
        dispatch({ type: 'INIT_COMPLETE' })
      }
    }
    autoLogin()
  }, [])

  // Axios 인터셉터 설정
  useEffect(() => {
    setupInterceptors({
      getCredentials: () => safeGetItem(STORAGE_KEY),
      updateSession: (sessionId, expiresAt) => {
        dispatch({ type: 'SESSION_REFRESHED', payload: { sessionId, expiresAt } })
      },
      triggerLogout: logout,
    })
  }, [logout])

  // 세션 만료 감지
  useEffect(() => {
    if (!state.isAuthenticated || !state.expiresAt) return

    function checkSession() {
      const now = Date.now()
      const expiresTime = new Date(state.expiresAt).getTime()
      const timeLeft = expiresTime - now

      if (timeLeft <= 0) {
        logout()
        return
      }

      if (timeLeft <= SESSION_REFRESH_BEFORE) {
        const credentials = safeGetItem(STORAGE_KEY)
        if (credentials) {
          apiAuthenticateTable(credentials.storeId, credentials.tableNumber, credentials.password)
            .then(({ data }) => {
              if (data) {
                dispatch({
                  type: 'SESSION_REFRESHED',
                  payload: { sessionId: data.session_id, expiresAt: data.expires_at },
                })
              } else {
                logout()
              }
            })
        }
      }
    }

    intervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [state.isAuthenticated, state.expiresAt, logout])

  const value = { ...state, setupTable, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
