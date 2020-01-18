package de.phip1611.hackathon.service.api;

import de.phip1611.hackathon.api.dto.PublicGameStatusDto;
import de.phip1611.hackathon.api.input.NewGameInput;
import de.phip1611.hackathon.api.input.PlayerPointsInput;

import java.util.List;
import java.util.UUID;

public interface GameService {

    UUID newGame(NewGameInput input);

    String getUnplayedSong(UUID gameId);

    void addPlayerToGame(UUID gameId, String userId);

    void addPlayerFeedbackToGameRound(UUID gameId, String playerId);

    PublicGameStatusDto getGameStatus(UUID gameId);

    void finishCurrentRound(UUID gameId, List<PlayerPointsInput> playerPointsInputs);

    void startNextRound(UUID gameId, String songId);

    void enableUserFeedback(UUID gameId);

}
