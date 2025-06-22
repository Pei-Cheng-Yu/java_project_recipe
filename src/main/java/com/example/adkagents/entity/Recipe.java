package com.example.adkagents.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Table(name = "recipes")
@Data
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ElementCollection
    private List<String> ingredients;

    @ElementCollection
    private List<String> instructions;

    private int estimatedTimeMinutes;

    private String difficulty;

    @ElementCollection
    private List<String> warnings;

    @ManyToOne
    @JoinColumn(name = "recipe_set_id")
    @ToString.Exclude
    @JsonBackReference
    private RecipeSet recipeSet;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @JsonBackReference
    private User user;
}