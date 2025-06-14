// src/api.js
const API_BASE_URL = 'http://localhost:3000'; // Backend URL. Adjust if different.
                                            // If using a proxy in package.json (for CRA), set to ''

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            // Try to parse error as JSON first (common for Spring Boot errors)
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch (e) {
            // If not JSON, try as text
            try {
                const errorText = await response.text();
                if (errorText) errorMessage = errorText;
            } catch (e2) {
                // Fallback to statusText
                errorMessage = response.statusText || errorMessage;
            }
        }
        console.error("API Error:", errorMessage, "on endpoint:", endpoint);
        throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    // For plain text responses (register, /user/me, /api/recipe_agent/run)
    return response.text();
}

export const loginUser = (credentials) => {
    return request('/auth/login', { // Expects { token: "..." }
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

export const registerUser = (credentials) => {
    return request('/auth/register', { // Expects plain text "User registered successfully"
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

export const fetchUserDetails = () => {
    return request('/user/me'); // Expects plain text "Hello, <username> 👋"
};

export const runRecipeAgent = (userInput) => {
    // Expects plain text recipes_id as response from backend's RecipeAgentService
    return request('/api/recipe_agent/run', {
        method: 'POST',
        body: JSON.stringify({ input: userInput }),
    });
};

export const getRecipesBySetId = (recipesId) => {
    // Expects JSON array of Recipe objects
    return request(`/recpies/${recipesId}`);
};

// Optional: If you need to fetch a single recipe by title from a set
export const getRecipeDetailsByTitle = (recipesId, title) => {
    const encodedTitle = encodeURIComponent(title);
    return request(`/recpies/set/${recipesId}/title/${encodedTitle}`);
};