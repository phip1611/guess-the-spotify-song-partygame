export interface SpotifyPlaylistTrack {
  album: Album;
  id: string;
  preview_url: string;
}

export interface Album {
  images: {
    height: number,
    url: string,
    width: number
  }[];
}
