package com.example.adkagents.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @GetMapping("/me")
    public String getMyUsername(Authentication auth) {
        return "Hello, " + auth.getName() + " 👋";
    }
}
