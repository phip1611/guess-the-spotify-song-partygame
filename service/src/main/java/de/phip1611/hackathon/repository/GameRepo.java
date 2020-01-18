package de.phip1611.hackathon.repository;

import de.phip1611.hackathon.domain.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GameRepo extends JpaRepository<Game, UUID> {
}
