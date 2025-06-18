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
    const [currentUser, setCurrentUser] = useState(null);
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
                const userDetailsResponse = await api.fetchUserDetails();
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
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setAuthError('');

        try {
            const response = await api.loginUser({ username: usernameInput, password });
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setAuthToken(response.token);

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
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setAuthError('');

        try {
            const message = await api.registerUser({ username, password });
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

    const addMessageToList = (content, sender, recipeData = null, recipesId = null, allRecipes = null) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            content: escapeHtml(content),
            sender,
            timestamp: new Date(),
            recipeData,
            recipesId,
            allRecipes
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || isAIResponding) return;
        addMessageToList(messageText, 'user');
        setIsAIResponding(true);

        try {
            addMessageToList("Let me check what I can cook for you...", 'ai');
            const result = await api.runRecipeAgent(messageText);

            const isLikelyRecipesId = /^[a-zA-Z0-9_-]{6,}$/.test(result);

            if (!isLikelyRecipesId) {
                addMessageToList(result, 'ai');
                return;
            }

            const recipesArray = await api.getRecipesBySetId(result);

            if (!Array.isArray(recipesArray) || recipesArray.length === 0) {
                addMessageToList(`😢 I found the recipe set but it’s empty. Try giving more or clearer ingredients!`, 'ai');
                return;
            }

            const firstRecipe = recipesArray[0];
            const recipeForPopup = {
                title: firstRecipe.title,
                ingredients: firstRecipe.ingredients,
                instructions: firstRecipe.instructions,
                prepTime: `${firstRecipe.estimatedTimeMinutes || '?'} min (total)`,
                cookTime: `(see total)`,
                servings: 'N/A',
                difficulty: firstRecipe.difficulty,
                warnings: firstRecipe.warnings
            };

            addMessageToList(`👩‍🍳 I found ${recipesArray.length} recipe(s) based on your ingredients!`, 'ai', null, result, recipesArray);
            recipesArray.forEach(recipe => {
            const individualRecipeData = {
                title: recipe.title,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                prepTime: `${recipe.estimatedTimeMinutes || '?'} min (total)`,
                cookTime: `(see total)`,
                servings: 'N/A',
                difficulty: recipe.difficulty,
                warnings: recipe.warnings
            };
            addMessageToList(`${recipe.title}`, 'ai', individualRecipeData, result, recipesArray);
        });
        } catch (error) {
            console.error("Error processing message:", error);
            addMessageToList(`Error: ${error.message || "Could not process your request."}`, 'ai');
        } finally {
            setIsAIResponding(false);
        }
    };

    const handleRecipeTitleClick = (clickedRecipeTitle, recipesId) => {
        const foundMessage = messages.find(msg => msg.recipesId === recipesId && msg.sender === 'ai');
        if (foundMessage && foundMessage.allRecipes) {
            const selectedRecipe = foundMessage.allRecipes.find(r => r.title === clickedRecipeTitle);
            if (selectedRecipe) {
                const recipeForPopup = {
                    title: selectedRecipe.title,
                    ingredients: selectedRecipe.ingredients,
                    instructions: selectedRecipe.instructions,
                    prepTime: `${selectedRecipe.estimatedTimeMinutes || '?'} min (total)`,
                    cookTime: `(see total)`,
                    servings: 'N/A',
                    difficulty: selectedRecipe.difficulty,
                    warnings: selectedRecipe.warnings
                };
                handleShowRecipePopup(recipeForPopup);
            } else {
                console.warn("Recipe title not found in set.");
            }
        } else {
            console.warn("Could not find recipe list for this message.");
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
        return <div>Loading...</div>;
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
                onShowRecipe={handleShowRecipePopup}
                onRecipeTitleClick={handleRecipeTitleClick}
            />
            {showPopup && popupRecipeData && (
                <PopupOverlay recipeData={popupRecipeData} onClose={handleHidePopup} />
            )}
        </>
    );
}

export default App;
