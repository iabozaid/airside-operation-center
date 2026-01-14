import React, { useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
    const [user, setUser] = useState("admin");
    const [pwd, setPwd] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.login(user, pwd);
            nav("/ops");
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes("401")) {
                setError("Invalid credentials.");
            } else if (err.message && err.message.includes("403")) {
                setError("Access denied.");
            } else {
                setError("Backend unavailable. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.panel}>

                {/* Branding Header */}
                <div className={styles.header}>
                    <div className={styles.logoBox}>Client Logo</div>
                    <div className={styles.logoBox}>ATSS Logo</div>
                </div>

                <h2 className={styles.title}>ATSS Matarat</h2>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div>
                        <label className={styles.label}>Username</label>
                        <input
                            value={user}
                            onChange={e => setUser(e.target.value)}
                            className={styles.input}
                            placeholder="username"
                            required
                            autoFocus
                            autoComplete="username"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Password</label>
                        <input
                            value={pwd}
                            onChange={e => setPwd(e.target.value)}
                            type="password"
                            className={styles.input}
                            placeholder="password"
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className={styles.footer}>
                    Demo Access: admin / admin
                </div>
            </div>
        </div>
    );
};
