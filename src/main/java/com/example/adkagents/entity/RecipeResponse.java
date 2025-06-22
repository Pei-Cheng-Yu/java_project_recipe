package com.example.adkagents.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "recipe_responses")
@Data
public class RecipeResponse {

    @Id
    private String id;
    @Column(columnDefinition = "TEXT")
    private String rawJson;
}
