package de.phip1611.hackathon.api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class GameDto {

    private UUID id;

    private Integer rounds;

    private boolean started;

    private boolean finished;

    private LocalDateTime startedTime;

    private List<String> songIds = new ArrayList<>();

    private List<String> playerIds = new ArrayList<>();

    private List<GameRoundDto> gameRounds = new ArrayList<>();



    public UUID getId() {
        return id;
    }

    public Integer getRounds() {
        return rounds;
    }

    public boolean isStarted() {
        return started;
    }

    public boolean isFinished() {
        return finished;
    }

    public LocalDateTime getStartedTime() {
        return startedTime;
    }

    public List<String> getSongIds() {
        return songIds;
    }

    public List<String> getPlayerIds() {
        return playerIds;
    }

    public List<GameRoundDto> getGameRounds() {
        return gameRounds;
    }
}
