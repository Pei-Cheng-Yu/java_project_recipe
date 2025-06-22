import React, { useEffect } from 'react';

function PopupOverlay({ recipeData, onClose }) {
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (event.target.classList.contains('popup-overlay')) {
                onClose();
            }
        };
        const popupContentElement = document.querySelector('.popup-content');
        const listener = (event) => {
            if (popupContentElement && popupContentElement.contains(event.target)) {
                return;
            }
            handleOutsideClick(event);
        }
        document.addEventListener('click', listener);
        return () => document.removeEventListener('click', listener);
    }, [onClose]);

    if (!recipeData) return null;

    //TODO: 
    const imageUrl = recipeData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"; // Default placeholder

    return (
        <div className="popup-overlay" style={{ display: 'flex' }}>
            <div className="popup-content">
                <div className="popup-header">
                    <div className="popup-title">
                        <div className="ai-icon">AI</div>
                        Recipe Details
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="popup-message">
                    <div className="recipe-container">
                        <img src={imageUrl} alt={recipeData.title} className="recipe-image" />
                        
                        <div className="recipe-title">{recipeData.title || "Untitled Recipe"}</div>
                        {recipeData.description && <div className="recipe-description">{recipeData.description}</div>}
                        
                        <div className="recipe-meta">
                            {/* Using estimatedTimeMinutes as prepTime for now */}
                            {recipeData.prepTime && <div className="recipe-meta-item">
                                <span>⏱️</span>
                                <span><strong>Time:</strong> {recipeData.prepTime}</span>
                            </div>}
                            {recipeData.difficulty && <div className="recipe-meta-item">
                                <span>📊</span>
                                <span><strong>Difficulty:</strong> {recipeData.difficulty}</span>
                            </div>}
                             {/* Servings not available from backend Recipe entity */}
                            {recipeData.servings && <div className="recipe-meta-item">
                                <span>👥</span>
                                <span><strong>Serves:</strong> {recipeData.servings}</span>
                            </div>}
                        </div>
                        
                        {recipeData.ingredients && recipeData.ingredients.length > 0 && (
                            <div className="recipe-section">
                                <h3>📋 Ingredients</h3>
                                <ul>
                                    {recipeData.ingredients.map((ingredient, index) => (
                                        <li key={`ing-${index}`}>{ingredient}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {recipeData.instructions && recipeData.instructions.length > 0 && (
                            <div className="recipe-section">
                                <h3>👨‍🍳 Instructions</h3>
                                <ul className="recipe-steps">
                                    {recipeData.instructions.map((step, index) => (
                                        <li key={`step-${index}`}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                         {recipeData.warnings && recipeData.warnings.length > 0 && (
                            <div className="recipe-section">
                                <h3>⚠️ Warnings</h3>
                                <ul>
                                    {recipeData.warnings.map((warning, index) => (
                                        <li key={`warn-${index}`}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PopupOverlay;