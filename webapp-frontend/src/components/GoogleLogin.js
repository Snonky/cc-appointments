import React from 'react';
import { useAuth } from '../contexts/AuthContext'
import { useHistory } from 'react-router-dom';

export default function GoogleLogin({ setError, loading, setLoading }) {
    const { googleLogin } = useAuth();
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError(null);
            setLoading(true);
            await googleLogin();
            history.push("/");
        } catch {
            setError('Failed to log in with Google Account');
        }
    }

    return (
        <>
        <div class="w-11/12 p-12 bg-white sm:w-8/12 md:w-1/2 lg:w-5/12">
            <form class="mt-6" onSubmit={handleSubmit} >
                <button disabled={loading} type="submit" class="w-full py-3 mt-6 font-medium tracking-widest text-white uppercase bg-red-700 shadow-lg focus:outline-none hover:bg-red-600 hover:shadow-none">
                    Log in with <span className="font-semibold">Google</span>
                </button>
            </form>
        </div>
        </>
    );
}