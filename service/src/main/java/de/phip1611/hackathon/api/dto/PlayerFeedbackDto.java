package de.phip1611.hackathon.api.dto;

import de.phip1611.hackathon.domain.PlayerFeedback;

public class PlayerFeedbackDto {

    private String playerId;

    private long millis;

    public PlayerFeedbackDto(PlayerFeedback entity) {
        this.playerId = entity.getPlayerId();
        this.millis = entity.getTime();
    }

    public String getPlayerId() {
        return playerId;
    }

    public long getTime() {
        return millis;
    }
}
