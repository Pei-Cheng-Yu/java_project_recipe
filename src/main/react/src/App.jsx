import React, { useState, useEffect, useCallback } from 'react';
import LoginModal from './components/LoginModal';
import ChatContainer from './components/ChatContainer';
import PopupOverlay from './components/PopupOverlay';
import * as api from './api';

const escapeHtml = (text) => {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

function App() {
    const [messages, setMessages] = useState([]);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // { username: "ActualName" }
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [popupRecipeData, setPopupRecipeData] = useState(null);
    const [authError, setAuthError] = useState('');
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
            try {
                const userDetailsResponse = await api.fetchUserDetails(); // "Hello, <username> 👋"
                // Extract username. Example: "Hello, testuser 👋" -> "testuser"
                const match = userDetailsResponse.match(/Hello, (.*?) 👋/);
                const username = match && match[1] ? match[1] : "User";
                setCurrentUser({ username });
            } catch (error) {
                console.error("Failed to fetch user details, logging out:", error);
                localStorage.removeItem('authToken');
                setAuthToken(null);
                setCurrentUser(null);
            }
        }
        setIsLoadingUser(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);
    
    useEffect(() => {
        if (authToken) {
            localStorage.setItem('authToken', authToken);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [authToken]);

    const handleLogin = async (usernameInput, password) => {
        setAuthError('');
        try {
            const response = await api.loginUser({ username: usernameInput, password });
            if (response.token) {
                setAuthToken(response.token);
                // Fetch user details to get the canonical username
                const userDetailsResponse = await api.fetchUserDetails();
                const match = userDetailsResponse.match(/Hello, (.*?) 👋/);
                const actualUsername = match && match[1] ? match[1] : usernameInput;
                setCurrentUser({ username: actualUsername });
                return { success: true };
            }
        } catch (error) {
            setAuthError(error.message || 'Login failed. Please try again.');
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const handleRegister = async (username, password) => {
        setAuthError('');
        try {
            const message = await api.registerUser({ username, password }); // Expects plain text
            return { success: true, message: message || '註冊成功！請登入' };
        } catch (error) {
            setAuthError(error.message || 'Registration failed. Please try again.');
            return { success: false, message: error.message || 'Registration failed' };
        }
    };

    const handleLogout = () => {
        setAuthToken(null);
        setCurrentUser(null);
        setMessages([]);
    };

    const addMessageToList = (content, sender, recipeData = null, recipesId = null) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            content: escapeHtml(content),
            sender,
            timestamp: new Date(),
            recipeData, // This will be a single recipe object for the popup
            recipesId   // The ID of the set, if applicable
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };
    
    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || isAIResponding) return;
        addMessageToList(messageText, 'user');
        setIsAIResponding(true);

        try {
            addMessageToList("Let me check what I can cook for you...", 'ai'); // Intermediate AI message
            const recipesId = await api.runRecipeAgent(messageText); // recipesId is plain text

            if (!recipesId || recipesId.startsWith("Agent crashed") || recipesId.startsWith("No JSON object") || recipesId.startsWith("No recipes_id")) {
                 addMessageToList(`Sorry, I encountered an issue: ${recipesId}`, 'ai');
                 setIsAIResponding(false);
                 return;
            }

            const recipesArray = await api.getRecipesBySetId(recipesId);

            if (recipesArray && recipesArray.length > 0) {
                // For now, take the first recipe for the popup
                // And construct an AI message listing all found recipes.
                const firstRecipe = recipesArray[0];
                const aiMessageContent = `I found ${recipesArray.length} recipe(s) in set '${recipesId}':<br/><ul>${recipesArray.map(r => `<li class="recipe-title-link" data-recipe-index="0">${escapeHtml(r.title)}</li>`).join('')}</ul>Click on a title to see details, or I've pre-selected the first one for the popup.`;
                
                // Adapt firstRecipe to fit PopupOverlay's expected structure
                const recipeForPopup = {
                    title: firstRecipe.title,
                    ingredients: firstRecipe.ingredients,
                    instructions: firstRecipe.instructions,
                    // Map backend fields to frontend popup fields
                    prepTime: `${firstRecipe.estimatedTimeMinutes || '?'} min (total)`, // Or handle prep/cook separately if backend distinguishes
                    cookTime: `(see total)`,
                    servings: 'N/A', // Not available from backend entity Recipe.java
                    difficulty: firstRecipe.difficulty,
                    warnings: firstRecipe.warnings,
                    //TODO: 
                    image: "https://via.placeholder.com/600x400.png?text=Recipe+Image" // Placeholder as not in Recipe.java
                };
                
                addMessageToList(aiMessageContent, 'ai', recipeForPopup, recipesId);

            } else {
                addMessageToList(`I found a recipe set with ID '${recipesId}', but it seems to be empty or there was an issue fetching details.`, 'ai', null, recipesId);
            }

        } catch (error) {
            console.error("Error processing message:", error);
            addMessageToList(`Error: ${error.message || "Could not process your request."}`, 'ai');
        } finally {
            setIsAIResponding(false);
        }
    };
    
    const handleRecipeTitleClick = (clickedRecipeTitle, recipesId) => {
        // Find the message that contains this recipesId and the recipesArray
        // This is a bit complex if recipesArray isn't stored directly with the message.
        // For simplicity, we might need to refetch or assume the first recipe popup is okay.
        // A better approach would be to store the full recipesArray with the AI message that lists them.
        // Or, when a title is clicked, fetch that specific recipe using getRecipeDetailsByTitle.
        
        // Let's try fetching the specific recipe for now if a title is clicked.
        //TODO: 
        const foundMessage = messages.find(msg => msg.recipesId === recipesId && msg.sender === 'ai');
        if (foundMessage && foundMessage.recipeData && foundMessage.recipeData.title === clickedRecipeTitle) {
            handleShowRecipePopup(foundMessage.recipeData); // Show already loaded one
        } else {
            //TODO:
            // Placeholder: Ideally, fetch the specific recipe by title from the set
            console.warn("Dynamic recipe selection from list not fully implemented yet. Showing first recipe if available or fetching.");
            // Example: api.getRecipeDetailsByTitle(recipesId, clickedRecipeTitle).then(recipe => ... show popup with this recipe)
            // For now, if a general AI message has a recipe, it will be the first one.
            if(foundMessage && foundMessage.recipeData) {
                 handleShowRecipePopup(foundMessage.recipeData);
            }
        }
    };


    const handleShowRecipePopup = (recipe) => {
        setPopupRecipeData(recipe);
        setShowPopup(true);
        document.body.style.overflow = 'hidden';
    };

    const handleHidePopup = () => {
        setShowPopup(false);
        setPopupRecipeData(null);
        document.body.style.overflow = 'auto';
    };

    useEffect(() => {
        const handleEsc = (event) => {
           if (event.key === 'Escape') handleHidePopup();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (isLoadingUser) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!authToken || !currentUser) {
        return (
            <LoginModal
                onLogin={handleLogin}
                onRegister={handleRegister}
                isLoginMode={isLoginMode}
                setIsLoginMode={setIsLoginMode}
                authError={authError}
                setAuthError={setAuthError}
            />
        );
    }

    return (
        <>
            <ChatContainer
                currentUser={currentUser}
                onLogout={handleLogout}
                messages={messages}
                onSendMessage={handleSendMessage}
                isAIResponding={isAIResponding}
                onShowRecipe={handleShowRecipePopup} // This is for the direct popup from AI message
                onRecipeTitleClick={handleRecipeTitleClick} // For clicking titles in AI message
            />
            {showPopup && popupRecipeData && (
                <PopupOverlay recipeData={popupRecipeData} onClose={handleHidePopup} />
            )}
        </>
    );
}

export default App;