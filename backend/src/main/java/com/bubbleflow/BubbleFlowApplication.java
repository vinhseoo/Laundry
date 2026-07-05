package com.bubbleflow;

import com.bubbleflow.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@Slf4j
public class BubbleFlowApplication {

	public static void main(String[] args) {
		SpringApplication.run(BubbleFlowApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> userRepository.findByEmail("admin@laundry.local").ifPresent(user -> {
            boolean matches = passwordEncoder.matches("Admin@123", user.getPassword());
            log.info(">>> CHECK DEFAULT ADMIN PASSWORD MATCHES: {}", matches);
            if (!matches) {
                user.setPassword(passwordEncoder.encode("Admin@123"));
                userRepository.save(user);
                log.info(">>> FORCED RESET DEFAULT ADMIN PASSWORD TO Admin@123");
            }
        });
	}
}
