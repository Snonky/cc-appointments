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

    function authenticatedRequest(method, url, body) {
        if (!currentUser) {
            return "Not authenticated";
        } else {
            return currentUser.getIdToken(true)
                .then((idToken) => {
                    console.log("Fetching");
                    return fetch("https://example.com" + url, {
                        method: method,
                        mode: 'cors',
                        headers: {
                            "Content-type": "application/json",
                            "Authorization": "Bearer " + idToken,
                        },
                        body: JSON.stringify(body),
                    })
                        .then((response) => {
                            if (response.ok) {
                                return response.json();
                            } else {
                                throw Error(response.statusText);
                            }
                        })
                        .then((json) => json);
                });
        }
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
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
        authenticatedRequest,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}