export interface GenreSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  colorHex: string | null;
  parentGenreId: number | null;
}

export interface GenreDetail extends GenreSummary {
  childGenres: GenreSummary[];
  adjacentTo: { adjacentGenre: GenreSummary }[];
  heroAlbums: { album: import("./album").AlbumCard; position: number }[];
  canonAlbums: { album: import("./album").AlbumCard; position: number }[];
}
