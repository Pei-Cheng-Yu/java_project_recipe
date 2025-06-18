import React from 'react';

function ChatHeader({ username, onLogout }) {
    return (
        <div className="chat-header">
            <div className="user-info">
                <span>👋 <span id="userDisplayName">{username}</span></span>
                <button className="logout-button" onClick={onLogout}>登出</button>
            </div>
            <h1>AI Master Chef</h1>
            <p>AI 廚神</p>
            <div className="status-dot"></div>
        </div>
    );
}

export default ChatHeader;