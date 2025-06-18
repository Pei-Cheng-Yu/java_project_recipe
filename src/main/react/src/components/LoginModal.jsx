import React, { useState } from 'react';

function LoginModal({ onLogin, onRegister, isLoginMode, setIsLoginMode }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim() || !password.trim()) {
            setError('請填寫所有欄位');
            return;
        }

        let result;
        if (isLoginMode) {
            result = await onLogin(username, password);
        } else {
            result = await onRegister(username, password);
        }

        if (result.success) {
            if (!isLoginMode) { // If registered successfully
                setSuccess(result.message || '註冊成功！請登入');
                setIsLoginMode(true); // Switch to login mode
                setUsername(''); // Clear form for login
                setPassword('');
            }
            // Login success is handled by App.jsx by setting currentUser
        } else {
            setError(result.message || (isLoginMode ? '登入失敗' : '註冊失敗'));
        }
    };

    const switchMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setSuccess('');
        setUsername('');
        setPassword('');
    };

    return (
        <div className="login-modal">
            <div className="login-form-container">
                <h2>{isLoginMode ? '登入' : '註冊'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">用戶名稱</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">密碼</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        {isLoginMode ? '登入' : '註冊'}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <a href="#" className="switch-mode" onClick={switchMode}>
                        {isLoginMode ? '還沒有帳號？註冊' : '已有帳號？登入'}
                    </a>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;