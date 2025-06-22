package agents.recipe;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Scanner;

import com.example.adkagents.config.ApplicationContextProvider;
import com.example.adkagents.service.RecipeStorageService;
import com.google.adk.agents.BaseAgent;
import com.google.adk.agents.LlmAgent;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.adk.tools.Annotations.Schema;
import com.google.adk.tools.FunctionTool;
import com.google.adk.tools.ToolContext;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.google.common.collect.ImmutableList;
import io.reactivex.rxjava3.core.Flowable;
public class RecipeAgent{
    private static String USER_ID = "user";
    private static String NAME = "recipe_agent";


    public static Map<String, Object> saveRecipes(
        @Schema(name = "recipesPayload") Map<String, Object> recipesPayload,
        @Schema(name = "toolContext") ToolContext toolContext
    ) {
        toolContext.state().put("last_saved_recipes", recipesPayload);
        System.out.println("saving ");
        RecipeStorageService service = ApplicationContextProvider.getBean(RecipeStorageService.class);
        service.saveGeneratedRecipes(recipesPayload);

        return Map.of("status", "saved");
    }

    public static BaseAgent ROOT_AGENT = initAgent();
    public static BaseAgent initAgent() {
         try {
        FunctionTool saveRecipes = FunctionTool.create(
            RecipeAgent.class.getMethod("saveRecipes", Map.class, ToolContext.class)
        );

        return LlmAgent.builder()
            .name(NAME)
            .model("gemini-2.0-flash")
            .description("Agent to answer questions about how to cook a meal.")
            .instruction("""
                You are a helpful cooking assistant. Your job is to help users decide what meals they can cook.

                Rules:
                1. Only answer questions related to cooking, recipes, steps for making meals, drinks, desserts, or any other edible item.
                2. If the user doesn't mention what ingredients they have, ask them first.
                3. Provide clear, step-by-step instructions for each recipe.
                5. You may give multiple recipe options, but create a unique recipes_id for this ask and always follow the exact format shown below.
                Format:
                {
                  "recipes_id": "dinner_suggestion_233",
                  "recipes": [
                    {
                      "title": "Recipe Name",
                      "ingredients": ["ingredient1", "ingredient2"],
                      "instructions": ["Step 1", "Step 2"],
                      "estimated_time_minutes": 30,
                      "difficulty": "easy",
                      "warnings": ["Contains milk."]
                    }
                  ]
                }
                6. Do **not** wrap this object in backticks or format it as JSON code — just pass the structured object to `saveRecipes` tool.

                7. Always remember to **call `saveRecipes`** immediately after generating the recipes, using the format above.

                8. Tell user the recipes(in the json format) with recipes_id, no need of any comments, just the recipes(json)
                """)
            .tools(ImmutableList.of(saveRecipes))
            .build();
    } catch (NoSuchMethodException e) {
        throw new RuntimeException("Failed to initialize saveRecipes tool", e);
    }

    }
}