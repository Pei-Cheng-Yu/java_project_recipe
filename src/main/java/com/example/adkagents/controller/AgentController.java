package com.example.adkagents.controller;

import com.example.adkagents.model.AgentRequest;
import com.example.adkagents.service.RecipeAgentService;


import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/recipe_agent")
public class AgentController {

    private final RecipeAgentService agentService;

    public AgentController( RecipeAgentService agentService) {
        this.agentService = agentService;
    }
    @PostMapping("/run")
    public ResponseEntity<String> runAgent(@RequestBody AgentRequest request) {
        String input = request.getInput();
        String agent_response = agentService.runRequest(input);
        return ResponseEntity.ok(agent_response);
    }
}
