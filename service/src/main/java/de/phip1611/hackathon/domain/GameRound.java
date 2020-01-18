package de.phip1611.hackathon.domain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@Entity
public class GameRound {

    private static final Logger LOGGER = LoggerFactory.getLogger(GameRound.class);

    @Id
    private UUID id;

    /**
     * The song used in the current round.
     */
    private String songId;

    /**
     * Whether user feedback is allowed. Usually after
     * the song has started playing.
     */
    private boolean enableUserFeedback;

    /**
     * If this game round is done.
     */
    private boolean finished;


    private LocalDateTime startedTime;

    /**
     * The feedbacks the users give during a running game round.
     * It shows when a user/team hit the buzzer button.
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlayerFeedback> playerFeedbacks = new ArrayList<>();

    /**
     * The points the game master gives each player after a finished round.
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlayerPoints> playerPoints = new ArrayList<>();

    protected GameRound() {
    }

    public GameRound(String songId) {
        this.id = UUID.randomUUID();
        this.enableUserFeedback = false;
        this.finished = false;
        this.songId = songId;
    }

    public void enableUserFeedback() {
        this.startedTime = LocalDateTime.now();
        this.enableUserFeedback = true;
    }

    public void finish() {
        if (this.finished) {
            throw new IllegalStateException("Already finished!");
        }
        this.finished = true;
    }

    public void addPlayerFeedback(String playerId) {
        var playerIdsAlreadyGivenFeedback = this.playerFeedbacks.stream()
                .map(PlayerFeedback::getPlayerId)
                .collect(toList());
        if (playerIdsAlreadyGivenFeedback.contains(playerId)) {
            LOGGER.debug("Userfeedback is only allowed once per game round!");
        } else {
            this.playerFeedbacks.add(new PlayerFeedback(playerId, this.startedTime));
        }
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

    public List<PlayerFeedback> getPlayerFeedbacks() {
        return playerFeedbacks;
    }

    public List<PlayerPoints> getPlayerPoints() {
        return playerPoints;
    }
}
