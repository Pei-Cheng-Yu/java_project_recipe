package agents.recipe;

import com.google.adk.tools.Annotations.Schema;
import com.google.adk.tools.ToolContext;
import com.example.adkagents.config.ApplicationContextProvider;
import com.example.adkagents.service.RecipeStorageService;
import java.util.Map;

public class SaveRecipesTool {

    @Schema(
        name = "SaveRecipes",
        description = "Stores recipes in session state and database."
    )
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
}
