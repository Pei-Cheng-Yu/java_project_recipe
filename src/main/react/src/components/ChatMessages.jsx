import React, { useEffect, useRef } from 'react';

function Message({ message, onShowRecipe, onRecipeTitleClick }) {
    const { content, sender, recipeData, recipesId } = message;
    const isUser = sender === 'user';
    const messageContentRef = useRef(null);

    const handleDirectRecipeClick = () => { // For the main message content if it's a recipe
        if (sender === 'ai' && recipeData) {
            onShowRecipe(recipeData);
        }
    };

    useEffect(() => {
        // Add event listeners for recipe title links if they exist in the content
        if (messageContentRef.current && sender === 'ai' && recipesId) {
            const links = messageContentRef.current.querySelectorAll('li.recipe-title-link');
            const handleClick = (event) => {
                const title = event.target.textContent;
                if (title && recipesId) {
                    //TODO:
                    // We need to fetch the specific recipe or have it pre-loaded.
                    // For now, App.jsx handles which recipe to show if it's the `recipeData` one.
                    // This demonstrates how to capture the click.
                    // The actual logic of showing the correct recipe for THIS clicked title
                    // would involve onRecipeTitleClick(title, recipesId) in App.jsx
                    // to find or fetch and then display.
                    // The App.jsx's handleRecipeTitleClick is a placeholder for this.
                    
                    // If the general message has recipeData (usually the first recipe)
                    // and the clicked title matches that, show it.
                    if (recipeData && recipeData.title === title) {
                        onShowRecipe(recipeData);
                    } else {
                        // Otherwise, tell App to handle this specific title click
                        // (App.jsx might then fetch it or find it if it has the full list)
                         onRecipeTitleClick(title, recipesId);
                         console.log(`Clicked on recipe title: ${title} from set: ${recipesId}. App should handle this.`);
                    }
                }
            };
            links.forEach(link => {
                link.style.cursor = 'pointer';
                link.style.textDecoration = 'underline';
                link.addEventListener('click', handleClick);
            });
            return () => {
                links.forEach(link => link.removeEventListener('click', handleClick));
            };
        }
    }, [content, sender, recipesId, recipeData, onShowRecipe, onRecipeTitleClick]);


    return (
        <div className={`message ${sender}`}>
            <div className="message-avatar">
                <span>{isUser ? (message.usernameShort || 'You') : 'AI'}</span>
            </div>
            <div
                ref={messageContentRef}
                className="message-content"
                data-has-recipe={sender === 'ai' && !!recipeData} // This is for the hover effect
                onClick={sender === 'ai' && recipeData ? handleDirectRecipeClick : undefined} // Main click for pre-selected recipe
                dangerouslySetInnerHTML={{ __html: content }} // Content can now contain HTML for recipe list
            >
            </div>
        </div>
    );
}


function ChatMessages({ messages, currentUser, isAIResponding, onShowRecipe, onRecipeTitleClick }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages, isAIResponding]);

    return (
        <div className="chat-messages">
            {messages.length === 0 && !isAIResponding && (
                <div className="empty-state">
                    <div className="empty-state-icon">🍳</div>
                    <p>
                        {currentUser ? `Welcome back, ${currentUser.username}!` : "Hello! I'm your AI Chef~"}
                        <br />
                        Tell me what ingredients you have, and I'll suggest recipes.
                    </p>
                </div>
            )}
            {messages.map((msg) => (
                <Message 
                    key={msg.id} 
                    message={{
                        ...msg, 
                        usernameShort: currentUser?.username?.charAt(0).toUpperCase() || 'U' 
                    }} 
                    onShowRecipe={onShowRecipe}
                    onRecipeTitleClick={onRecipeTitleClick} // Pass down
                />
            ))}
            {isAIResponding && !messages.find(m => m.content.includes("Let me check")) && ( // Don't show if already showing "Let me check"
                <div className="typing-indicator" style={{ display: 'flex' }}>
                    <div className="message-avatar">
                        <span>AI</span>
                    </div>
                    <div>
                        <span>AI is typing</span>
                        <div className="typing-dots">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default ChatMessages;