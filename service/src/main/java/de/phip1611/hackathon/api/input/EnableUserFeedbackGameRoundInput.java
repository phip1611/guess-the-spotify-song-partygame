package de.phip1611.hackathon.api.input;

import java.util.UUID;

public class EnableUserFeedbackGameRoundInput {

    private UUID gameRoundId;

    public UUID getGameRoundId() {
        return gameRoundId;
    }

    public EnableUserFeedbackGameRoundInput setGameRoundId(UUID gameRoundId) {
        this.gameRoundId = gameRoundId;
        return this;
    }
}
