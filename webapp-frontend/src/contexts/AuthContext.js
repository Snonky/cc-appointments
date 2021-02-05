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
            return Promise.reject("Not authenticated");
        } else {
            return currentUser.getIdToken(true)
                .then((idToken) => {
                    const headers = {
                        "Authorization": "Bearer " + idToken,
                    }
                    if (method !== 'GET') {
                        headers["Content-type"] = "application/json";
                    }
                    return fetch(process.env.REACT_APP_API_DOMAIN + url, {
                        method: method,
                        mode: 'cors',
                        headers: headers,
                        body: JSON.stringify(body),
                    })
                        .then((response) => {
                            if (response.ok) {
                                if (method === 'GET') {
                                    return response.json();
                                } else {
                                    return response.statusText;
                                }
                            } else {
                                throw Error(response.statusText);
                            }
                        });
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