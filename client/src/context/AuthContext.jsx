import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../services/api";


const AuthContext = createContext(null);


// ======================================
// Authentication Provider
// ======================================
function AuthProvider({ children }) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  const clearSession =
    useCallback(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
    }, []);


  const setSession =
    useCallback((token, sessionUser) => {
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(sessionUser)
      );

      setUser(sessionUser);
    }, []);


  const validateSession =
    useCallback(async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        clearSession();
        setLoading(false);
        return;
      }


      try {
        const { data } =
          await API.get("/auth/me");

        if (
          data.success &&
          data.user
        ) {
          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );

          setUser(data.user);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }, [clearSession]);


  useEffect(() => {
    validateSession();
  }, [validateSession]);


  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated:
        Boolean(user),
      setSession,
      clearSession,
    }),
    [
      user,
      loading,
      setSession,
      clearSession,
    ]
  );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ======================================
// Authentication Hook
// ======================================
const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};


export {
  AuthProvider,
  useAuth,
};
