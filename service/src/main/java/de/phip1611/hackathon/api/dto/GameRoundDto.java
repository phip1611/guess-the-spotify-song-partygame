package de.phip1611.hackathon.api.dto;

import de.phip1611.hackathon.domain.GameRound;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

public class GameRoundDto {

    private UUID id;

    private String songId;

    private boolean enableUserFeedback;

    private boolean finished;

    private LocalDateTime startedTime;

    private List<PlayerFeedbackDto> playerFeedbacks = new ArrayList<>();

    private List<PlayerPointsDto> playerPoints = new ArrayList<>();

    public GameRoundDto(GameRound entity) {
        this.id = entity.getId();
        this.songId = entity.getSongId();
        this.enableUserFeedback = entity.isEnableUserFeedback();
        this.finished = entity.isFinished();
        this.startedTime = entity.getStartedTime();
        this.playerFeedbacks.addAll(
                entity.getPlayerFeedbacks().stream()
                .map(PlayerFeedbackDto::new)
                .collect(toList())
        );
        this.playerPoints.addAll(
                entity.getPlayerPoints().stream()
                .map(PlayerPointsDto::new)
                .collect(toList())
        );
    }

    public UUID getId() {
        return id;
    }

    public String getSongId() {
        return songId;
    }

    public boolean isEnableUserFeedback() {
        return enableUserFeedback;
    }

    public boolean isFinished() {
        return finished;
    }

    public LocalDateTime getStartedTime() {
        return startedTime;
    }

    public List<PlayerFeedbackDto> getPlayerFeedbacks() {
        return playerFeedbacks;
    }

    public List<PlayerPointsDto> getPlayerPoints() {
        return playerPoints;
    }
}
