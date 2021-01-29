import React, { useRef, useState, } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link, useHistory } from 'react-router-dom';
import GoogleLogin from './GoogleLogin'

const Signup = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmedPasswordRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== confirmedPasswordRef.current.value) {
            setError('Passwords do not match');
            return;
        }
        try {
            setError(null);
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value);
            history.push("/");
        } catch {
            setError('Failed to create an account');
        }
        setLoading(false);
    }

    return (
        <>
            <div class="grid place-items-center">
                <div class="w-11/12 p-12 bg-white sm:w-8/12 md:w-1/2 lg:w-5/12">
                    <h1 class="text-xl font-semibold">Please register to gain access. {error && <span class="font-normal text-red-600 text-sm">{error}</span>}</h1>
                    <form class="mt-6" onSubmit={handleSubmit} >
                        <label for="email" class="block mt-2 text-xs font-semibold text-gray-600 uppercase">E-mail</label>
                        <input ref={emailRef} id="email" type="email" name="email" autocomplete="email" class="block w-full p-3 mt-2 text-gray-700 bg-gray-200 appearance-none focus:outline-none focus:bg-gray-300 focus:shadow-inner" required />
                        <label for="password" class="block mt-2 text-xs font-semibold text-gray-600 uppercase">Password</label>
                        <input ref={passwordRef} id="password" type="password" name="password" placeholder="********" autocomplete="new-password" class="block w-full p-3 mt-2 text-gray-700 bg-gray-200 appearance-none focus:outline-none focus:bg-gray-300 focus:shadow-inner" required />
                        <label for="password-confirm" class="block mt-2 text-xs font-semibold text-gray-600 uppercase">Confirm password</label>
                        <input ref={confirmedPasswordRef} id="password-confirm" type="password" name="password-confirm" placeholder="********" autocomplete="new-password" class="block w-full p-3 mt-2 text-gray-700 bg-gray-200 appearance-none focus:outline-none focus:bg-gray-300 focus:shadow-inner" required />
                        <button disabled={loading}type="submit" class="w-full py-3 mt-6 font-medium tracking-widest text-white uppercase bg-black shadow-lg focus:outline-none hover:bg-gray-900 hover:shadow-none">
                            Sign up
                        </button>
                        <p class="flex justify-between inline-block mt-4 text-xs text-gray-500 cursor-pointer hover:text-black"><Link to="/login">Already registered?</Link></p>
                    </form>
                </div>
                <hr class="w-7/12 mb-4 border-0 border-t border-gray-300" />
                <h1 class="text-xl font-semibold text-center">OR</h1>
                <GoogleLogin setError={setError} loading={loading} setLoading={setLoading} />
            </div>
        </>
    );
}

export default Signup;