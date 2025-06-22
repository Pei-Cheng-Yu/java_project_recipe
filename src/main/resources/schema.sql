CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
    -- Add other user fields if needed
);

CREATE TABLE recipe_sets (
    id TEXT PRIMARY KEY
);

CREATE TABLE recipe_responses (
    id TEXT PRIMARY KEY,
    raw_json TEXT
);

CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    estimated_time_minutes INT,
    difficulty TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    recipe_set_id TEXT REFERENCES recipe_sets(id)
);

CREATE TABLE recipes_ingredients (
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredients TEXT
);

CREATE TABLE recipes_instructions (
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    instructions TEXT
);

CREATE TABLE recipes_warnings (
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    warnings TEXT
);
