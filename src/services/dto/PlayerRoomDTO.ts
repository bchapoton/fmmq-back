export type PlayerRoomDTO = {
  id: string;
  playerToken: string;
  nickname: string;
  score: number;
  previousMusicIndexFound?: number;
  currentMusicValues?: PlayerCurrentMusicValuesDTO;
};

export type PlayerCurrentMusicValuesDTO = {
  artist: Array<string>;
  title: Array<string>;
};
