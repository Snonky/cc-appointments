import React, { useContext, useState, useEffect, } from 'react';
import { auth, googleAuth } from '../firebase'

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password);
    }

    function emailLogin(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function googleLogin() {
        return googleAuth();
    }

    function logout() {
        return auth.signOut();
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            console.log(user)
            setLoading(false);
        });
        return unsubscribe;
    }, []);


    const value = {
        currentUser,
        emailLogin,
        googleLogin,
        signup,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}