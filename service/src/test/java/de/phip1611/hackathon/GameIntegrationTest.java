package de.phip1611.hackathon;

import de.phip1611.hackathon.api.input.NewGameInput;
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
		UUID gameId = this.service.newGame(new NewGameInput().setRounds(3).setSongIds(List.of(
				"Song1", "Song2", "Song3", "Song4"
		)));
		this.service.addPlayerToGame(gameId, "Spieler1");
		this.service.addPlayerToGame(gameId, "Spieler2");
		this.service.addPlayerToGame(gameId, "Spieler3");
		var status = this.service.getGameStatus(gameId);
		Assert.assertEquals(status.getPlayers().size(), 3);
		Assert.assertFalse(status.isStarted());
		Assert.assertFalse(status.isFinished());

		Assert.assertTrue(this.service.getUnplayedSong(gameId).matches("Song[1234]"));

		this.service.startNextRound(
				gameId,
				this.service.getUnplayedSong(gameId)
		);
		status = this.service.getGameStatus(gameId);
		Assert.assertTrue(status.isStarted());
		try {
			this.service.addPlayerToGame(gameId, "Spieler5");
			Assert.fail("Should not be able to add players to started game!");
		} catch (Exception ignored) {}
	}

}
