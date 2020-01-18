package de.phip1611.hackathon.api.dto;

import de.phip1611.hackathon.domain.Game;
import de.phip1611.hackathon.domain.GameRound;
import de.phip1611.hackathon.domain.PlayerPoints;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toList;

/**
 * Players will receive this to retrieve the current state.
 * "Public" means in this case that this are the information
 * that clients can see without
 */
public class PublicGameStatusDto {

    private boolean started;

    private boolean finished;

    private boolean enableUserFeedback;

    private Map<String, Integer> pointsPerPlayer = new HashMap<>();

    private List<String> players = new ArrayList<>();

    private List<PlayerFeedbackDto> feedbacks = new ArrayList<>();

    private Integer currentRound;

    private Integer totalRounds;

    public PublicGameStatusDto(Game entity) {
        this.started = entity.isStarted();
        this.finished = entity.isFinished();
        this.players.addAll(entity.getPlayerIds());
        this.currentRound = entity.getGameRounds().size();
        this.totalRounds = entity.getRounds();
        var gr = entity.getCurrentGameRound();
        if (gr != null) {
            this.enableUserFeedback = gr.isEnableUserFeedback();
            this.feedbacks = gr.getPlayerFeedbacks().stream()
                    .map(PlayerFeedbackDto::new)
                    .collect(toList());
            entity.getPlayerIds().forEach(player -> {
                var points = entity.getGameRounds().stream()
                        .map(GameRound::getPlayerPoints)
                        .flatMap(Collection::stream)
                        .filter(pp -> pp.getPlayerId().equals(player))
                        .map(PlayerPoints::getPoints)
                        .reduce(Integer::sum);
                pointsPerPlayer.put(player, points.orElse(0));
            });
        } else {
            this.enableUserFeedback = false;
        }

    }

    public boolean isStarted() {
        return started;
    }

    public boolean isFinished() {
        return finished;
    }

    public boolean isEnableUserFeedback() {
        return enableUserFeedback;
    }

    public Map<String, Integer> getPointsPerPlayer() {
        return pointsPerPlayer;
    }

    public List<PlayerFeedbackDto> getFeedbacks() {
        return feedbacks;
    }

    public List<String> getPlayers() {
        return players;
    }

    public Integer getCurrentRound() {
        return currentRound;
    }

    public Integer getTotalRounds() {
        return totalRounds;
    }
}
