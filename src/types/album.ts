export interface AlbumLinks {
  spotify?: string;
  apple?: string;
  youtube?: string;
  wikipedia?: string;
  spotifyId?: string;
}

export interface AlbumCard {
  id: number;
  title: string;
  artistName: string;
  releaseYear: number;
  coverUrl: string;
  impactTier: string;
  genres: { genre: { id: number; name: string; slug: string } }[];
}

export interface AlbumDetail extends AlbumCard {
  summary: string | null;
  impactScore: number;
  linksJson: string;
  subgenresJson: string;
  mbid: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumListResponse {
  albums: AlbumCard[];
  total: number;
  page: number;
  totalPages: number;
}
