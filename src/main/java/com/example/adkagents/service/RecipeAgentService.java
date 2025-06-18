package com.example.adkagents.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.example.adkagents.entity.Recipe;
import com.example.adkagents.entity.RecipeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.adk.agents.BaseAgent;
import com.google.adk.agents.RunConfig;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.example.adkagents.repository.RecipeRepository;
import com.example.adkagents.repository.RecipeResponseRepository;

import agents.recipe.RecipeAgent;
import io.reactivex.rxjava3.core.Flowable;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeAgentService {

    private final UserUtilService userUtilService;
    private final BaseAgent agent = RecipeAgent.ROOT_AGENT;
    private final RecipeRepository recipeRepo;
    private final RecipeResponseRepository recipeResRepo;
    public String runRequest(String userInput) {
    try {
        String UserId = userUtilService.getCurrentUser().getId().toString();
        InMemoryRunner runner = new InMemoryRunner(agent);
        Session session = runner.sessionService().createSession(agent.name(), UserId).blockingGet();
        System.out.println("Session for user: " + userUtilService.getCurrentUser().getId());

        Content userMessage = Content.fromParts(Part.fromText(userInput + " store it using `saveRecipes` tool**"));
        Flowable<Event> events = runner.runAsync(UserId, session.id(), userMessage);

        StringBuilder response = new StringBuilder();
        events.blockingForEach(event -> {
            event.content().ifPresent(content ->
                content.parts().ifPresent(parts ->
                    parts.forEach(part ->
                        part.text().ifPresent(response::append)
                    )
                )
            );
        });

        String output = response.toString();

        // Try to extract JSON block
        int start = output.indexOf("{");
        int end = output.lastIndexOf("}");
        if (start != -1 && end != -1 && end > start) {
            String jsonString = output.substring(start, end + 1);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> jsonMap = mapper.readValue(jsonString, new TypeReference<>() {});
            String recipesId = (String) jsonMap.get("recipes_id");

            if (recipesId != null) {
                RecipeResponse recipeRes = new RecipeResponse();
                recipeRes.setId(recipesId);
                recipeRes.setRawJson(jsonString);
                recipeResRepo.save(recipeRes);

                List<Recipe> stored = recipeRepo.findByRecipeSet_Id(recipesId);
                if (stored.isEmpty()) {
                    throw new RuntimeException("No recipe found for ID: " + recipesId);
                }
                return recipesId;
            }
        }

        // ✅ No recipes_id, just return the full agent response
        return output;

    } catch (Exception e) {
        e.printStackTrace();
        return "Agent crashed: " + e.getMessage();
    }
}
}
