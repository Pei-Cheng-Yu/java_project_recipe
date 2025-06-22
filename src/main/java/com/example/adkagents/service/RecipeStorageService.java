package com.example.adkagents.service;

import com.example.adkagents.entity.Recipe;
import com.example.adkagents.entity.RecipeSet;
import com.example.adkagents.repository.RecipeSetRepository;
import com.example.adkagents.service.UserUtilService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecipeStorageService {
    private final UserUtilService userUtilService;
    @Autowired
    private RecipeSetRepository recipeSetRepo;

    public void saveGeneratedRecipes(Map<String, Object> agentResponse) {
        String recipesId = (String) agentResponse.get("recipes_id");
        System.out.println("recipesId: "+recipesId);
        List<Map<String, Object>> recipes = (List<Map<String, Object>>) agentResponse.get("recipes");

        RecipeSet recipeSet = new RecipeSet();
        recipeSet.setId(recipesId);

        for (Map<String, Object> r : recipes) {
            Recipe recipe = new Recipe();
            recipe.setTitle((String) r.get("title"));
            recipe.setEstimatedTimeMinutes((Integer) r.get("estimated_time_minutes"));
            recipe.setDifficulty((String) r.get("difficulty"));

            recipe.setIngredients((List<String>) r.get("ingredients"));
            recipe.setInstructions((List<String>) r.get("instructions"));
            recipe.setWarnings((List<String>) r.get("warnings"));

            recipe.setUser(userUtilService.getCurrentUser());
            recipe.setRecipeSet(recipeSet);
            recipeSet.getRecipes().add(recipe);
        }

        recipeSetRepo.save(recipeSet); // saves both set + recipes via cascade
    }
}
