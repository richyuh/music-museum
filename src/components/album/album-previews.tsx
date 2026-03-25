"use client";

interface AlbumPreviewsProps {
  linksJson: string;
}

export function AlbumPreviews({ linksJson }: AlbumPreviewsProps) {
  let links: Record<string, string> = {};
  try {
    links = JSON.parse(linksJson);
  } catch {
    return null;
  }

  const spotifyId = links.spotifyId;
  if (!spotifyId) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Preview</h2>
      <iframe
        src={`https://open.spotify.com/embed/album/${spotifyId}?utm_source=generator&theme=0`}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify album preview"
        className="rounded-xl"
      />
    </section>
  );
}
