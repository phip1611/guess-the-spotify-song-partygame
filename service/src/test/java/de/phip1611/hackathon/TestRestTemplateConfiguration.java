package de.phip1611.hackathon;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class TestRestTemplateConfiguration {

    @LocalServerPort
    private int port;

    @Bean
    public TestRestTemplate testRestTemplate() {
        var restTemplate = new RestTemplateBuilder().rootUri("http://localhost:" + port);
        return new TestRestTemplate(restTemplate);
    }

}
