package de.phip1611.hackathon.rest;

import de.phip1611.hackathon.api.dto.PublicGameStatusDto;
import de.phip1611.hackathon.api.input.NewGameInput;
import de.phip1611.hackathon.api.input.PlayerPointsInput;
import de.phip1611.hackathon.service.api.GameService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("gamestatus/{uuid}")
    public PublicGameStatusDto getGameStatus(@PathVariable("uuid") UUID uuid) {
        return this.gameService.getGameStatus(uuid);
    }

    @PostMapping("game")
    public UUID startNewGame(NewGameInput input) {
        return this.gameService.newGame(input);
    }

    @GetMapping("game/{uuid}/nextsong/")
    public String getUnplayedSong(@PathVariable("uuid") UUID gameId) {
        return this.gameService.getUnplayedSong(gameId);
    }

    @PostMapping("game/{uuid}/addplayer/")
    public void addPlayerToGame(@PathVariable("uuid") UUID gameId, @RequestBody String playerId) {
        this.gameService.addPlayerToGame(gameId, playerId);
    }

    @PostMapping("game/{uuid}/playerfeedback/")
    public void addPlayerFeedbackToGameRound(@PathVariable("uuid") UUID gameId, @RequestBody String playerId) {
        this.gameService.addPlayerFeedbackToGameRound(gameId, playerId);
    }

    @PostMapping("game/{uuid}/finishgameround/")
    public void finishCurrentRound(@PathVariable("uuid") UUID gameId, @RequestBody List<PlayerPointsInput> playerPointsInputs) {
        this.gameService.finishCurrentRound(gameId, playerPointsInputs);
    }

    @PostMapping("game/{uuid}/startnextgameround/")
    public void startNextRound(@PathVariable("uuid") UUID gameId, @RequestBody String songId) {
        this.gameService.startNextRound(gameId, songId);
    }

    @PostMapping("game/{uuid}/enableuserfeedback/")
    public void startNextRound(@PathVariable("uuid") UUID gameId) {
        this.gameService.enableUserFeedback(gameId);
    }

}
