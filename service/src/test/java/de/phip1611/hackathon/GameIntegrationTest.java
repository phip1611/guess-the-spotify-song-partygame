package de.phip1611.hackathon;

import de.phip1611.hackathon.api.input.NewGameInput;
import de.phip1611.hackathon.api.input.PlayerPointsInput;
import de.phip1611.hackathon.service.api.GameService;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.UUID;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// @ActiveProfiles({"test"})
@DirtiesContext
public class GameIntegrationTest {

    @Autowired
    private GameService service;

    @Test
    public void test() {

        // Init game

        UUID gameId = this.service.newGame(new NewGameInput().setRounds(2).setSongIds(List.of(
                "Song1", "Song2", "Song3", "Song4"
        )));
        this.service.addPlayerToGame(gameId, "Spieler1");
        this.service.addPlayerToGame(gameId, "Spieler2");
        this.service.addPlayerToGame(gameId, "Spieler3");
        var status = this.service.getGameStatus(gameId);
        Assert.assertEquals(status.getTotalRounds().intValue(), 2);
        Assert.assertEquals(status.getPlayers().size(), 3);
        Assert.assertFalse(status.isStarted());
        Assert.assertFalse(status.isFinished());


        // test get next song
        Assert.assertTrue(this.service.getUnplayedSong(gameId).matches("Song[1234]"));

        // start round
        this.service.startNextRound(
                gameId,
                this.service.getUnplayedSong(gameId)
        );
        status = this.service.getGameStatus(gameId);
        Assert.assertTrue(status.isStarted());
        try {
            this.service.addPlayerToGame(gameId, "Spieler5");
            Assert.fail("Should not be able to add players to started game!");
        } catch (Exception ignored) {
        }

        // test game master enabled feedback
        this.service.enableUserFeedback(gameId);
        status = this.service.getGameStatus(gameId);
        Assert.assertTrue(status.isEnableUserFeedback());

        // users hit the buzzer
        this.service.addPlayerFeedbackToGameRound(gameId, "Spieler1");
        this.service.addPlayerFeedbackToGameRound(gameId, "Spieler2");
        status = this.service.getGameStatus(gameId);
        Assert.assertEquals(2, status.getFeedbacks().size());

        // assuming spieler1 has the answer and game master gives him a point
        this.service.finishCurrentRound(
                gameId,
                List.of(
                        new PlayerPointsInput()
                                .setPlayerId("Spieler1")
                                .setPoints(1)
                )
        );
		status = this.service.getGameStatus(gameId);
		Assert.assertEquals(1, status.getPointsPerPlayer().get("Spieler1").intValue());

		// second round start
		this.service.startNextRound(gameId, this.service.getUnplayedSong(gameId));
		// add feedback before it is allowed --> ignored
		this.service.addPlayerFeedbackToGameRound(gameId, "Spieler3");
		status = this.service.getGameStatus(gameId);
		Assert.assertTrue(status.getFeedbacks().isEmpty());

		this.service.enableUserFeedback(gameId);
		this.service.addPlayerFeedbackToGameRound(gameId, "Spieler3");
		this.service.addPlayerFeedbackToGameRound(gameId, "Spieler2");
		// assuming Spieler3 got it wrong and got -1 points and then Spieler2
		// got a point
		this.service.finishCurrentRound(
				gameId,
				List.of(
						new PlayerPointsInput()
								.setPlayerId("Spieler3")
								.setPoints(-1),
						new PlayerPointsInput()
								.setPlayerId("Spieler2")
								.setPoints(1)
				)
		);
		status = this.service.getGameStatus(gameId);
		Assert.assertEquals(-1, status.getPointsPerPlayer().get("Spieler3").intValue());
		Assert.assertEquals(1, status.getPointsPerPlayer().get("Spieler2").intValue());
		// no change
		Assert.assertEquals(1, status.getPointsPerPlayer().get("Spieler1").intValue());

		// round 2 of 2 done
		Assert.assertTrue(status.isFinished());
    }

}
