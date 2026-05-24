-- CreateIndex
CREATE UNIQUE INDEX "albums_mbid_key" ON "albums"("mbid");

-- CreateIndex
CREATE UNIQUE INDEX "albums_title_artist_name_release_year_key" ON "albums"("title", "artist_name", "release_year");
