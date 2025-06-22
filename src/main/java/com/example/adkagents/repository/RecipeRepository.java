package com.example.adkagents.repository;

import com.example.adkagents.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByRecipeSet_Id(String recipeSetId);
    Optional<Recipe> findByRecipeSet_IdAndTitle(String recipeSetId, String title);
}
