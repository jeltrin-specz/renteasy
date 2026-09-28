package com.renteasy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI rentEasyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RENT-EASY API Documentation")
                        .description("PG & Hostel Room Rent Payment and Tenant Management REST API.\n\n" +
                                "Provides comprehensive endpoints for room allocation, tenant management, monthly rent obligations, " +
                                "idempotent penalty calculations, partial/full payment recording, and financial analytics.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("RENT-EASY Engineering Team")
                                .email("support@renteasy.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ));
    }
}
