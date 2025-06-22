package com.example.adkagents.controller;

import com.example.adkagents.entity.Recipe;
import com.example.adkagents.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recpies")
public class RecipeController{

    @Autowired
    private RecipeRepository recipeRepo;
    @GetMapping("/{recipesId}")
    public ResponseEntity<List<Recipe>> getAllBySet(@PathVariable("recipesId") String recipesId) {
        return ResponseEntity.ok(recipeRepo.findByRecipeSet_Id(recipesId));
    }

    @GetMapping("/set/{recipesId}/title/{title}")
        public ResponseEntity<?> getBySetAndTitle(
    @PathVariable("recipesId") String recipesId,
    @PathVariable("title") String title){
        return recipeRepo.findByRecipeSet_IdAndTitle(recipesId, title)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}