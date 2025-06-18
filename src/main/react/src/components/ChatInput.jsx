import React, { useState, useRef, useEffect } from 'react';

function ChatInput({ onSendMessage, isAIResponding }) {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef(null);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    useEffect(autoResizeTextarea, [inputValue]);

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="chat-input-container">
            <div className="chat-input-wrapper">
                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder="Type your message here..."
                    rows="1"
                    maxLength="1000"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isAIResponding}
                />
                <button
                    className="send-button"
                    onClick={handleSubmit}
                    disabled={isAIResponding || !inputValue.trim()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ChatInput;