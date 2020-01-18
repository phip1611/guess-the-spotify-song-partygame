package de.phip1611.hackathon.domain;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Describes when a player hit the buzzer.
 */
@Entity
public class PlayerFeedback {

    @Id
    private UUID id;

    private String playerId;

    private long millis;

    protected PlayerFeedback() {
    }

    public PlayerFeedback(String playerId, LocalDateTime base) {
        this.id = UUID.randomUUID();
        this.playerId = playerId;
        var duration = Duration.between(base, LocalDateTime.now());
        this.millis = duration.toMillis();
    }

    public String getPlayerId() {
        return playerId;
    }

    public long getTime() {
        return millis;
    }
}
