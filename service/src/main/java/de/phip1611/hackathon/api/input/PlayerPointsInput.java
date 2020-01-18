package de.phip1611.hackathon.api.input;

/**
 * Input for the point count a specific player or
 * team got during a game round.
 */
public class PlayerPointsInput {

    private String playerId;

    private Integer points;

    public String getPlayerId() {
        return playerId;
    }

    public PlayerPointsInput setPlayerId(String playerId) {
        this.playerId = playerId;
        return this;
    }

    public Integer getPoints() {
        return points;
    }

    public PlayerPointsInput setPoints(Integer points) {
        this.points = points;
        return this;
    }
}
