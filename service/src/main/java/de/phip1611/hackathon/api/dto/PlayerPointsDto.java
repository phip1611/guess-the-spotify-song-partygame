package de.phip1611.hackathon.api.dto;

import de.phip1611.hackathon.domain.PlayerPoints;

public class PlayerPointsDto {

    private String playerId;

    // points per round
    private Integer points;

    public PlayerPointsDto(PlayerPoints entity) {
        this.playerId = entity.getPlayerId();
        this.points = entity.getPoints();
    }

    public String getPlayerId() {
        return playerId;
    }

    public Integer getPoints() {
        return points;
    }
}
