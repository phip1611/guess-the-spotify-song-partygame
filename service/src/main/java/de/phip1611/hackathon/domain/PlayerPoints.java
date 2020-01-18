package de.phip1611.hackathon.domain;

import de.phip1611.hackathon.api.input.PlayerPointsInput;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.UUID;

/**
 * Describes how many points a specific
 * player (team) received per round.
 */
@Entity
public class PlayerPoints {

    @Id
    private UUID id;

    private String playerId;

    // points per round
    private Integer points;

    protected PlayerPoints() {
    }

    public PlayerPoints(PlayerPointsInput input) {
        this.id = UUID.randomUUID();
        this.playerId = input.getPlayerId();
        this.points = input.getPoints();
    }

    public String getPlayerId() {
        return playerId;
    }

    public Integer getPoints() {
        return points;
    }
}
