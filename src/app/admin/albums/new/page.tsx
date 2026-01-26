"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMPACT_TIERS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewAlbumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    artistName: "",
    releaseYear: 2024,
    coverUrl: "",
    summary: "",
    impactTier: "Notable",
    impactScore: 50,
    genreIds: [] as number[],
    linksJson: "{}",
  });

  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then((data) => {
        const allGenres: { id: number; name: string; slug: string }[] = [];
        for (const parent of data) {
          allGenres.push({ id: parent.id, name: parent.name, slug: parent.slug });
          for (const child of parent.childGenres || []) {
            allGenres.push({ id: child.id, name: `  ${child.name}`, slug: child.slug });
          }
        }
        setGenres(allGenres);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin/albums");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Album</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Artist</label>
            <Input
              value={form.artistName}
              onChange={(e) => setForm({ ...form, artistName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Year</label>
            <Input
              type="number"
              value={form.releaseYear}
              onChange={(e) =>
                setForm({ ...form, releaseYear: parseInt(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Impact Tier</label>
            <Select
              value={form.impactTier}
              onValueChange={(v) => setForm({ ...form, impactTier: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPACT_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Impact Score</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.impactScore}
              onChange={(e) =>
                setForm({ ...form, impactScore: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Cover URL</label>
          <Input
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Summary</label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Museum placard text..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Genres</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`px-2 py-1 text-xs rounded border ${
                  form.genreIds.includes(g.id)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
                onClick={() => {
                  setForm({
                    ...form,
                    genreIds: form.genreIds.includes(g.id)
                      ? form.genreIds.filter((id) => id !== g.id)
                      : [...form.genreIds, g.id],
                  });
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Links (JSON)</label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
            rows={3}
            value={form.linksJson}
            onChange={(e) => setForm({ ...form, linksJson: e.target.value })}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Album"}
        </Button>
      </form>
    </div>
  );
}
