package de.phip1611.hackathon.service.impl;

import de.phip1611.hackathon.api.dto.PublicGameStatusDto;
import de.phip1611.hackathon.api.input.NewGameInput;
import de.phip1611.hackathon.api.input.PlayerPointsInput;
import de.phip1611.hackathon.domain.Game;
import de.phip1611.hackathon.repository.GameRepo;
import de.phip1611.hackathon.service.api.GameService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class GameServiceImpl implements GameService {

    private final GameRepo gameRepo;

    public GameServiceImpl(GameRepo gameRepo) {
        this.gameRepo = gameRepo;
    }

    @Override
    @Transactional
    public UUID newGame(NewGameInput input) {
        var entity = new Game(input);
        return this.gameRepo.save(entity).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public String getUnplayedSong(UUID gameId) {
        return this.gameRepo.findById(gameId)
                .map(Game::getUnplayedSongs)
                .map(x -> {
                    Collections.shuffle(x);
                    return x;
                })
                .map(l -> l.get(0))
                .orElseThrow(() -> new IllegalArgumentException("No game found!"));
    }

    @Override
    @Transactional
    public void addPlayerToGame(UUID gameId, String playerId) {
        var entity = this.gameRepo.findById(gameId);
        if (entity.isEmpty()) {
            throw new IllegalArgumentException("No game found");
        }
        entity.get().addPlayer(playerId);
    }

    @Override
    @Transactional
    public void addPlayerFeedbackToGameRound(UUID gameId, String playerId) {
        var opt = this.gameRepo.findById(gameId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("No game found");
        }
        var entity = opt.get();
        if (!entity.isStarted()) {
            throw new IllegalArgumentException("Game not started yet!");
        }
        if (entity.isFinished()) {
            throw new IllegalArgumentException("Game already finished!");
        }
        entity.addPlayerFeedback(playerId);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicGameStatusDto getGameStatus(UUID gameId) {
        var opt = this.gameRepo.findById(gameId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("No game found");
        }
        return new PublicGameStatusDto(opt.get());
    }

    @Override
    @Transactional
    public void finishCurrentRound(UUID gameId, List<PlayerPointsInput> playerPointsInputs) {
        var opt = this.gameRepo.findById(gameId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("No game found");
        }
        var entity = opt.get();
        entity.finishCurrentRound(playerPointsInputs);
    }

    @Override
    @Transactional
    public void startNextRound(UUID gameId, String songId) {
        var opt = this.gameRepo.findById(gameId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("No game found");
        }
        var entity = opt.get();
        entity.addGameRound(songId);
    }

    @Override
    @Transactional
    public void enableUserFeedback(UUID gameId) {
        var opt = this.gameRepo.findById(gameId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("No game found");
        }
        var entity = opt.get();
        entity.enableUserFeedback();
    }
}
