import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const verified = params.get("verified");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
                {verified ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                        <p className="text-gray-500 mb-6">Your account is now active. Welcome to CampusPrint!</p>
                        <Link to="/login" className="btn-primary w-full block text-center py-3">Go to Login →</Link>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="text-4xl">📧</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                        <p className="text-gray-500 mb-6">We've sent a verification link to your email address. Click it to activate your account.</p>
                        <p className="text-xs text-gray-400">Didn't get it? Check your spam folder.</p>
                    </>
                )}
            </div>
        </div>
    );
}