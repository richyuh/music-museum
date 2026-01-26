"use client";

import { use, useState, useEffect } from "react";
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

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditAlbumPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    artistName: "",
    releaseYear: 2024,
    coverUrl: "",
    summary: "",
    impactTier: "Notable",
    impactScore: 50,
    linksJson: "{}",
  });

  useEffect(() => {
    fetch(`/api/albums/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title,
          artistName: data.artistName,
          releaseYear: data.releaseYear,
          coverUrl: data.coverUrl,
          summary: data.summary || "",
          impactTier: data.impactTier,
          impactScore: data.impactScore,
          linksJson: data.linksJson,
        });
        setFetching(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/albums/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    router.push("/admin/albums");
  }

  if (fetching) {
    return <div className="max-w-2xl"><p>Loading...</p></div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Album</h1>
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
          />
        </div>

        <div>
          <label className="text-sm font-medium">Summary</label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
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

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/albums")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
