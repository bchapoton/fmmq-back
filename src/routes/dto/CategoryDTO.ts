export type CategoryDTO = {
  _id: string;
  label: string;
  description: string;
  current: {
    playersCount: number;
    currentMusicCount?: number;
    totalMusicCount?: number;
  };
};
