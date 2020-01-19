export interface PublicGameStatusDto {
  started: boolean;
  finished: boolean;
  enableUserFeedback: boolean;
  pointsPerPlayer: {[playerId: string]: number},
  players: string[],
  feedbacks: PlayerFeedbackDto[];
  currentRound: number;
  totalRounds: number;
}

export interface PlayerFeedbackDto {

  playerId: string;

  millis: number;
}