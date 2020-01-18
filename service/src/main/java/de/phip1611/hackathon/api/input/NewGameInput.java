package de.phip1611.hackathon.api.input;

import java.util.List;

/**
 * Creates a new game.
 */
public class NewGameInput {

    private List<String> songIds;

    private Integer rounds;

    public List<String> getSongIds() {
        return songIds;
    }

    public NewGameInput setSongIds(List<String> songIds) {
        this.songIds = songIds;
        return this;
    }

    public Integer getRounds() {
        return rounds;
    }

    public NewGameInput setRounds(Integer rounds) {
        this.rounds = rounds;
        return this;
    }
}
