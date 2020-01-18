package de.phip1611.hackathon.domain;

import de.phip1611.hackathon.api.input.NewGameInput;
import de.phip1611.hackathon.api.input.PlayerPointsInput;

import javax.persistence.CascadeType;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@Entity
public class Game {

    @Id
    private UUID id;

    private Integer rounds;

    private boolean started;

    private boolean finished;

    private LocalDateTime startedTime;

    @ElementCollection
    private List<String> songIds = new ArrayList<>();

    //@ElementCollection
    //private List<String> playedSongIds = new ArrayList<>();

    @ElementCollection
    private List<String> playerIds = new ArrayList<>();

    @OrderColumn // keep order when we add new rounds to the list
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameRound> gameRounds = new ArrayList<>();

    // Hibernate Constructor
    protected Game() {
    }

    public Game(NewGameInput input) {
        this.id = UUID.randomUUID();
        this.started = false;
        this.finished = false;
        this.songIds.addAll(input.getSongIds());
        this.rounds = input.getRounds();
        if (this.rounds > this.songIds.size()) {
            this.rounds = this.songIds.size();
        }
    }

    public void addPlayer(String playerId) {
        if (this.started) {
            throw new IllegalStateException("Game already started!");
        }
        if (this.playerIds.contains(playerId)) {
            throw new IllegalArgumentException("Player already registered!");
        }
        this.playerIds.add(playerId);
    }

    public List<String> getUnplayedSongs() {
        var songs = new ArrayList<>(this.songIds);
        var playedSongs = this.getGameRounds().stream()
                .map(GameRound::getSongId)
                .collect(toList());
        playedSongs.forEach(songs::remove);
        return songs;
    }

    /**
     * Returns the current game round or the last game round
     * if the game is finished.
     */
    public GameRound getCurrentGameRound() {
        if (this.gameRounds.isEmpty()) {
            return null;
        }
        return this.gameRounds.get(this.gameRounds.size() - 1);
    }

    public void addGameRound(String songId) {
        if (!this.isStarted()) {
            this.started = true;
        }
        if (this.gameRounds.size() == this.rounds) {
            throw new IllegalStateException("Maximum rounds count already reached!");
        }
        if (!this.gameRounds.isEmpty() && !this.getCurrentGameRound().isFinished()) {
            throw new IllegalStateException("Can't start next game round; current one is not finished!!");
        }
        this.gameRounds.add(new GameRound(songId));
    }

    public void finishCurrentRound(List<PlayerPointsInput> playerPointsInputs) {
        this.getCurrentGameRound().finish(playerPointsInputs);
        if (this.gameRounds.size() == this.rounds) {
            this.finished = true;
        }
    }

    public void addPlayerFeedback(String playerId) {
        this.getCurrentGameRound().addPlayerFeedback(playerId);
    }

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

    /*public List<String> getPlayedSongIds() {
        return playedSongIds;
    }*/

    public List<String> getPlayerIds() {
        return playerIds;
    }

    public List<GameRound> getGameRounds() {
        return gameRounds;
    }

    public void enableUserFeedback() {
        this.getCurrentGameRound().enableUserFeedback();
    }
}
