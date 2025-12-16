package com.fitlife.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitlife.model.User;
import com.fitlife.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {

        String username = data.get("username");
        String password = data.get("password");

        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(user -> ResponseEntity.ok(Map.of(
                        "user", Map.of(
                                "id", user.getId(),
                                "username", user.getUsername(),
                                "name", user.getName(),
                                "email", user.getEmail()),
                        "token", "token-" + System.currentTimeMillis(),
                        "message", "Login successful")))
                .orElse(ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid username or password")));
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {

        if (userRepository.existsByUsername(data.get("username"))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Username already exists"));
        }

        User user = new User();
        user.setUsername(data.get("username"));
        user.setName(data.get("name"));
        user.setEmail(data.get("email"));

        // 🔐 HASH PASSWORD
        user.setPassword(passwordEncoder.encode(data.get("password")));

        // ================= DEBUG =================
        System.out.println("=== REGISTER DEBUG ===");
        System.out.println("Username : " + user.getUsername());
        System.out.println("Email    : " + user.getEmail());
        System.out.println("Password (HASH) : " + user.getPassword());
        System.out.println("======================");
        // =========================================

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    // ================= GET ALL USERS =================
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("username", user.getUsername());
                    map.put("name", user.getName());
                    map.put("email", user.getEmail());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // ================= DELETE USER =================
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "User not found"));
        }

        userRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
