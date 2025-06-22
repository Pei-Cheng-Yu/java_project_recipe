// src/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Backend URL. Adjust if different.
                                            // If using a proxy in package.json (for CRA), set to ''
async function request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Don't attach token to login or register
    if (token && !['/auth/login', '/auth/register'].includes(endpoint)) {
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
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch (e) {
            try {
                const errorText = await response.text();
                if (errorText) errorMessage = errorText;
            } catch (e2) {
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