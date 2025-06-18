# 🍽️ Recipe Recommendation System

This project is a Spring Boot application integrated with Google's ADK (Agent Development Kit) to generate and manage recipes using GenAI. It includes Swagger UI for API testing.

---

## ⚙️ Prerequisites

- Java 17+
- Maven 3.8+
- Internet connection (for downloading dependencies and using GenAI)
- Google Generative AI API Key

---

## 📦 Installation



1. **Build with Maven**

```bash
mvn clean install
```

2. **Set up environment variables (required for GenAI)**

### On Windows (PowerShell)

```powershell
$env:GOOGLE_API_KEY="your_google_api_key"
$env:GOOGLE_GENAI_USE_VERTEXAI="false"
```

### On macOS/Linux (bash or zsh)

```bash
export GOOGLE_API_KEY="your_google_api_key"
export GOOGLE_GENAI_USE_VERTEXAI=false
```

3. **Set up application.properties**
## 🛠️ Configuration Setup

Before running the Spring Boot backend, make sure to configure the following in `src/main/resources/application.properties`:

### ✅ Required Properties

```properties
# JWT secret key used for signing tokens (change this to a strong, random value)
jwt.secret=your_jwt_secret_here

# Frontend origin(s) allowed for CORS (typically your dev server like Vite or React)
frontend.origins=http://localhost:5173
```
> 📌 Get your API key from AI studio, u might need to create a google cloud account before that

---

## ▶️ Running the App

### Option 1: Using Maven

```bash
mvn spring-boot:run
```

### Option 2: Using the JAR file

```bash
java -jar target/java_project_recipe-1.0.0.jar
```

✅ Make sure environment variables are set before running.

---

## 🌐 Accessing Swagger UI

Once the app is running, open your browser and go to:

```
http://localhost:8080/swagger-ui/index.html
```

You can test:

- Agent-based recipe generation
- Fetching recipe sets
- Querying individual recipes

---

## 🔌 REST API Endpoints

| Method | Endpoint                                           | Description                             |
|--------|----------------------------------------------------|-----------------------------------------|
| GET    | `/recpies/set/{recipesId}`                         | Get all recipes in a set                |
| GET    | `/recpies/set/{recipesId}/title/{title}`           | Get a specific recipe by title in a set |
| POST   | `/agent/run`                                       | Run ADK agent to generate recipes       |

---

## 🧱 Project Structure

```
src/main/java
├── agents/recipe/             # ADK Agent + Tool
├── com/example/adkagents/
│   ├── controller/            # REST Controllers
│   ├── entity/                # JPA Entities (Recipe, RecipeSet)
│   ├── repository/            # Spring Data JPA Repositories
│   └── service/               # Service layer logic
```

---

## 🧩 Troubleshooting

- **Missing API Key Error**  
  Make sure to export your `GOOGLE_API_KEY` correctly *before* starting the app.

- **Port already in use**  
  Stop other applications using port `8080` or update `server.port` in `application.properties`.

- **Swagger not showing full routes**  
  Ensure your controller paths are uniquely defined and don't conflict.

---

## 🙋 Contact

For questions, contact [Your Name] or open an issue in the repository.

---

## 📜 License

MIT License – feel free to use, modify, and contribute.
