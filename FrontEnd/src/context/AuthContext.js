import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {

            const token = localStorage.getItem("token")
            if(token) {

                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    console.error("Error fetching user", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (userData) => {
        const loggedInUser = await authService.login(userData);
        setUser(loggedInUser);
        localStorage.setItem("token", loggedInUser);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value = {{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
   
};

export const useAuth = () => {
    return useContext(AuthContext);
}