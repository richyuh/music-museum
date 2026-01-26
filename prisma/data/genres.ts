export interface GenreData {
  name: string;
  slug: string;
  description: string;
  colorHex: string;
  parentSlug: string | null;
}

export interface AdjacencyData {
  genreSlug: string;
  adjacentSlug: string;
}

// ---------------------------------------------------------------------------
// Wings (top-level parent genres) and their subgenres
// ---------------------------------------------------------------------------

export const genres: GenreData[] = [
  // =========================================================================
  // 1. Rock
  // =========================================================================
  {
    name: "Rock",
    slug: "rock",
    description:
      "Built on electric guitars, bass, and drums, rock music emerged in the 1950s and became the dominant popular music form for decades. Its emphasis on amplified instrumentation, strong backbeats, and expressive vocals has spawned countless subgenres.",
    colorHex: "#dc2626",
    parentSlug: null,
  },
  {
    name: "Alternative Rock",
    slug: "alternative-rock",
    description:
      "Emerging from the independent music underground of the 1980s, alternative rock encompasses a wide range of styles united by their divergence from mainstream commercial rock. It draws on punk, post-punk, and new wave while embracing experimentation.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Indie Rock",
    slug: "indie-rock",
    description:
      "Rooted in the DIY ethos of independent record labels, indie rock favors lo-fi aesthetics, melodic songwriting, and a rejection of corporate music culture. The genre ranges from jangly guitar pop to abrasive noise rock.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Punk",
    slug: "punk",
    description:
      "Defined by fast tempos, short songs, and stripped-down instrumentation, punk rock emerged in the mid-1970s as a raw, confrontational reaction against the perceived excesses of mainstream rock. Its anti-establishment attitude influenced countless subsequent genres.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Post-Punk",
    slug: "post-punk",
    description:
      "Born from punk's energy but reaching toward greater artistic ambition, post-punk incorporated synthesizers, angular guitar work, and darker atmospheres. Bands drew on avant-garde art, electronic music, and funk to create a cerebral, often austere sound.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Progressive Rock",
    slug: "progressive-rock",
    description:
      "Progressive rock expanded the boundaries of rock by incorporating complex compositions, unusual time signatures, and influences from classical and jazz music. Albums often featured extended suites, concept narratives, and virtuosic instrumental performances.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Psychedelic Rock",
    slug: "psychedelic-rock",
    description:
      "Inspired by the mind-expanding counterculture of the 1960s, psychedelic rock uses studio effects, extended improvisations, and unconventional song structures to evoke altered states of consciousness. Reverb, feedback, and Eastern instrumentation are common hallmarks.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Shoegaze",
    slug: "shoegaze",
    description:
      "Named for performers' habit of staring at their effects pedals on stage, shoegaze layers heavily distorted guitars with ethereal vocals to create dense, immersive walls of sound. The genre blends noise and beauty in equal measure.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },
  {
    name: "Grunge",
    slug: "grunge",
    description:
      "Fusing the raw energy of punk with the heavy riffs of metal, grunge emerged from the Seattle scene in the late 1980s. Its angst-ridden lyrics, downtuned guitars, and dynamic soft-loud contrasts defined a generation of rock music.",
    colorHex: "#dc2626",
    parentSlug: "rock",
  },

  // =========================================================================
  // 2. Hip-Hop
  // =========================================================================
  {
    name: "Hip-Hop",
    slug: "hip-hop",
    description:
      "Originating in the Bronx in the 1970s, hip-hop centers on rhythmic vocal delivery (rapping) over beat-driven production. It encompasses a broad culture including DJing, sampling, beatboxing, and turntablism alongside its musical expression.",
    colorHex: "#f59e0b",
    parentSlug: null,
  },
  {
    name: "East Coast Hip-Hop",
    slug: "east-coast-hip-hop",
    description:
      "Rooted in New York City, East Coast hip-hop is known for its lyrical complexity, jazz and soul sampling, and boom-bap production style. MCs emphasize intricate wordplay, storytelling, and multisyllabic rhyme schemes.",
    colorHex: "#f59e0b",
    parentSlug: "hip-hop",
  },
  {
    name: "West Coast Hip-Hop",
    slug: "west-coast-hip-hop",
    description:
      "Originating in California, West Coast hip-hop features laid-back, funk-influenced production with deep bass lines and synthesizer melodies. The style encompasses gangsta rap narratives and the G-funk sound pioneered in the early 1990s.",
    colorHex: "#f59e0b",
    parentSlug: "hip-hop",
  },
  {
    name: "Southern Hip-Hop",
    slug: "southern-hip-hop",
    description:
      "Emerging from cities like Atlanta, Houston, and Memphis, Southern hip-hop is characterized by heavy bass, call-and-response hooks, and regional slang. It gave rise to crunk, chopped and screwed, and bounce subcultures.",
    colorHex: "#f59e0b",
    parentSlug: "hip-hop",
  },
  {
    name: "Alternative Hip-Hop",
    slug: "alternative-hip-hop",
    description:
      "Defying the mainstream conventions of hip-hop, alternative hip-hop embraces eclectic production, unconventional lyrical themes, and genre-blending experimentation. Artists often incorporate live instrumentation, abstract storytelling, and socially conscious messaging.",
    colorHex: "#f59e0b",
    parentSlug: "hip-hop",
  },
  {
    name: "Trap",
    slug: "trap",
    description:
      "Named after the Southern slang for a place where drugs are sold, trap music features aggressive 808 drum machine patterns, rapid hi-hats, layered synthesizers, and dark lyrical content. It became the dominant commercial hip-hop sound in the 2010s.",
    colorHex: "#f59e0b",
    parentSlug: "hip-hop",
  },

  // =========================================================================
  // 3. Electronic
  // =========================================================================
  {
    name: "Electronic",
    slug: "electronic",
    description:
      "Electronic music is produced primarily with electronic instruments, digital audio workstations, and synthesizers. From dance floors to avant-garde sound art, it spans a vast spectrum of tempos, textures, and intentions.",
    colorHex: "#8b5cf6",
    parentSlug: null,
  },
  {
    name: "House",
    slug: "house",
    description:
      "Born in Chicago's club scene in the early 1980s, house music features a steady four-on-the-floor kick drum, synthesized basslines, and soulful vocal samples. Its infectious rhythms and uplifting energy made it a global dance music staple.",
    colorHex: "#8b5cf6",
    parentSlug: "electronic",
  },
  {
    name: "Techno",
    slug: "techno",
    description:
      "Originating in Detroit in the mid-1980s, techno is driven by repetitive, machine-generated rhythms, synthetic textures, and a futuristic aesthetic. It strips away vocals in favor of hypnotic, propulsive electronic compositions.",
    colorHex: "#8b5cf6",
    parentSlug: "electronic",
  },
  {
    name: "Ambient",
    slug: "ambient",
    description:
      "Ambient music prioritizes atmosphere and tone over traditional structure or rhythm, creating immersive sonic landscapes designed for deep listening. Pioneered by Brian Eno, it ranges from serene drones to unsettling textural experiments.",
    colorHex: "#8b5cf6",
    parentSlug: "electronic",
  },
  {
    name: "IDM",
    slug: "idm",
    description:
      "Intelligent dance music applies experimental composition techniques to electronic production, featuring complex rhythms, glitchy textures, and unconventional structures. Despite its name, much of the genre is designed more for headphone listening than dancing.",
    colorHex: "#8b5cf6",
    parentSlug: "electronic",
  },
  {
    name: "Drum and Bass",
    slug: "drum-and-bass",
    description:
      "Characterized by fast breakbeats typically between 160 and 180 BPM and heavy sub-bass, drum and bass emerged from the UK rave scene in the early 1990s. It ranges from dark, aggressive neurofunk to melodic, jazz-influenced liquid styles.",
    colorHex: "#8b5cf6",
    parentSlug: "electronic",
  },
  {
    name: "Synthwave",
    slug: "synthwave",
    description:
      "Synthwave is a retro-futuristic genre that draws heavily on 1980s film soundtracks, video game music, and synth-pop aesthetics. Pulsing analog synthesizers, gated reverb drums, and neon-tinged nostalgia define its signature sound.",
    colorHex: "#8b5cf6",
    parentSlug: "electronic",
  },

  // =========================================================================
  // 4. Jazz
  // =========================================================================
  {
    name: "Jazz",
    slug: "jazz",
    description:
      "Rooted in African American musical traditions, jazz is defined by swing rhythms, improvisation, and complex harmonies. From its origins in New Orleans, it evolved into one of the most influential and diverse art forms in music history.",
    colorHex: "#3b82f6",
    parentSlug: null,
  },
  {
    name: "Bebop",
    slug: "bebop",
    description:
      "Developed in the 1940s, bebop elevated jazz from dance music to an intellectually demanding art form with fast tempos, intricate melodies, and virtuosic improvisation. Small combos replaced big bands, emphasizing individual expression and harmonic sophistication.",
    colorHex: "#3b82f6",
    parentSlug: "jazz",
  },
  {
    name: "Free Jazz",
    slug: "free-jazz",
    description:
      "Free jazz abandons fixed chord changes, predetermined structures, and sometimes conventional tonality in pursuit of collective improvisation and pure spontaneous expression. Pioneered by Ornette Coleman and Cecil Taylor, it remains jazz's most radical form.",
    colorHex: "#3b82f6",
    parentSlug: "jazz",
  },
  {
    name: "Fusion",
    slug: "fusion",
    description:
      "Jazz fusion blends jazz improvisation and harmony with the electric instruments, amplification, and rhythmic intensity of rock and funk. Emerging in the late 1960s, it expanded jazz's sonic palette with synthesizers and electric guitars.",
    colorHex: "#3b82f6",
    parentSlug: "jazz",
  },
  {
    name: "Cool Jazz",
    slug: "cool-jazz",
    description:
      "A relaxed, melodic counterpoint to bebop's intensity, cool jazz features lighter tones, restrained dynamics, and sophisticated arrangements. Popularized on the West Coast in the 1950s, it favors understatement and lyrical phrasing.",
    colorHex: "#3b82f6",
    parentSlug: "jazz",
  },
  {
    name: "Modal Jazz",
    slug: "modal-jazz",
    description:
      "Modal jazz uses musical modes rather than chord progressions as the basis for improvisation, giving soloists greater melodic freedom over sustained harmonic areas. Miles Davis's Kind of Blue is the genre's defining landmark.",
    colorHex: "#3b82f6",
    parentSlug: "jazz",
  },

  // =========================================================================
  // 5. R&B / Soul
  // =========================================================================
  {
    name: "R&B / Soul",
    slug: "rnb-soul",
    description:
      "Combining gospel fervor, blues feeling, and rhythmic drive, R&B and soul music center on the power and expressiveness of the human voice. The genre has continually evolved from doo-wop through Motown to modern R&B production.",
    colorHex: "#ec4899",
    parentSlug: null,
  },
  {
    name: "Neo-Soul",
    slug: "neo-soul",
    description:
      "Neo-soul revived classic soul aesthetics with contemporary production in the late 1990s, blending vintage warmth with hip-hop beats, jazz harmony, and conscious lyricism. Artists like Erykah Badu and D'Angelo defined the movement's organic, retro-modern sound.",
    colorHex: "#ec4899",
    parentSlug: "rnb-soul",
  },
  {
    name: "Funk",
    slug: "funk",
    description:
      "Funk emphasizes a strong rhythmic groove driven by syncopated basslines, percussive guitar riffs, and prominent horn sections. Pioneered by James Brown and Parliament-Funkadelic, its infectious grooves became foundational to hip-hop and electronic dance music.",
    colorHex: "#ec4899",
    parentSlug: "rnb-soul",
  },
  {
    name: "Contemporary R&B",
    slug: "contemporary-rnb",
    description:
      "Contemporary R&B merges traditional soul singing with sleek, rhythm-heavy production incorporating hip-hop beats, electronic textures, and pop hooks. It has dominated mainstream music from the late 1980s onward with polished vocals and modern arrangements.",
    colorHex: "#ec4899",
    parentSlug: "rnb-soul",
  },
  {
    name: "Classic Soul",
    slug: "classic-soul",
    description:
      "Classic soul combines the emotional intensity of gospel singing with secular themes over lush arrangements of horns, strings, and rhythm sections. The genre reached its peak in the 1960s and 1970s through Motown, Stax, and Philadelphia International.",
    colorHex: "#ec4899",
    parentSlug: "rnb-soul",
  },
  {
    name: "Gospel",
    slug: "gospel",
    description:
      "Gospel music is rooted in African American Christian worship, featuring powerful vocal performances, choir harmonies, and call-and-response dynamics. Its emotional intensity and vocal techniques have profoundly influenced virtually every genre of popular music.",
    colorHex: "#ec4899",
    parentSlug: "rnb-soul",
  },

  // =========================================================================
  // 6. Pop
  // =========================================================================
  {
    name: "Pop",
    slug: "pop",
    description:
      "Pop music prioritizes catchy melodies, accessible structures, and broad commercial appeal. Continuously absorbing influences from other genres, it reflects and shapes mainstream musical taste across eras and cultures.",
    colorHex: "#f472b6",
    parentSlug: null,
  },
  {
    name: "Synth-Pop",
    slug: "synth-pop",
    description:
      "Synth-pop foregrounds synthesizers and electronic production within a pop song framework, creating polished, futuristic-sounding music. Emerging in the late 1970s, it brought electronic instruments to the mainstream through acts like Depeche Mode and New Order.",
    colorHex: "#f472b6",
    parentSlug: "pop",
  },
  {
    name: "Art Pop",
    slug: "art-pop",
    description:
      "Art pop blends pop music's accessibility with avant-garde aesthetics, experimental production, and conceptual ambition. Artists prioritize artistic vision and boundary-pushing creativity while maintaining melodic sensibility and cultural engagement.",
    colorHex: "#f472b6",
    parentSlug: "pop",
  },
  {
    name: "Dream Pop",
    slug: "dream-pop",
    description:
      "Dream pop envelops soft vocals in layers of reverb, atmospheric synthesizers, and gently shimmering guitars to create a hazy, ethereal soundscape. The genre evokes a sense of wistful introspection and weightless beauty.",
    colorHex: "#f472b6",
    parentSlug: "pop",
  },
  {
    name: "Indie Pop",
    slug: "indie-pop",
    description:
      "Indie pop combines the melodic sensibility and song-based approach of pop with the independent spirit and lo-fi aesthetics of the underground. It favors jangly guitars, sweet melodies, and an unpolished charm over commercial sheen.",
    colorHex: "#f472b6",
    parentSlug: "pop",
  },
  {
    name: "Dance Pop",
    slug: "dance-pop",
    description:
      "Dance pop fuses uptempo electronic beats with catchy pop melodies and hooks, designed for both radio play and the dance floor. Its polished production and rhythmic drive have made it one of the most commercially successful pop styles.",
    colorHex: "#f472b6",
    parentSlug: "pop",
  },

  // =========================================================================
  // 7. Metal
  // =========================================================================
  {
    name: "Metal",
    slug: "metal",
    description:
      "Metal is characterized by amplified distortion, extended guitar solos, emphatic beats, and overall loudness. Evolving from blues rock and psychedelic rock in the late 1960s, it developed into one of music's most diverse and technically demanding genres.",
    colorHex: "#6b7280",
    parentSlug: null,
  },
  {
    name: "Black Metal",
    slug: "black-metal",
    description:
      "Black metal features shrieked vocals, tremolo-picked guitars, blast-beat drumming, and a raw, lo-fi production aesthetic. Thematically rooted in anti-religious sentiment and dark Romanticism, it originated in Scandinavia in the early 1990s.",
    colorHex: "#6b7280",
    parentSlug: "metal",
  },
  {
    name: "Death Metal",
    slug: "death-metal",
    description:
      "Death metal pushes extreme music to its limits with guttural vocals, heavily distorted and downtuned guitars, complex song structures, and blast-beat drumming. It demands exceptional technical proficiency from its performers.",
    colorHex: "#6b7280",
    parentSlug: "metal",
  },
  {
    name: "Doom Metal",
    slug: "doom-metal",
    description:
      "Doom metal emphasizes slow tempos, low-tuned guitars, and a thick, heavy sound that evokes a sense of despair and dread. Rooted in the heaviest moments of Black Sabbath, it trades speed for crushing weight and atmosphere.",
    colorHex: "#6b7280",
    parentSlug: "metal",
  },
  {
    name: "Thrash Metal",
    slug: "thrash-metal",
    description:
      "Thrash metal combines the aggression and speed of hardcore punk with the technical complexity of heavy metal, featuring rapid-fire riffing, shredding solos, and intense drumming. The Big Four -- Metallica, Megadeth, Slayer, and Anthrax -- defined the genre.",
    colorHex: "#6b7280",
    parentSlug: "metal",
  },
  {
    name: "Progressive Metal",
    slug: "progressive-metal",
    description:
      "Progressive metal fuses metal's heavy sound with the complex compositions, odd time signatures, and extended song forms of progressive rock. It demands both technical virtuosity and compositional sophistication from its practitioners.",
    colorHex: "#6b7280",
    parentSlug: "metal",
  },

  // =========================================================================
  // 8. Folk / Country
  // =========================================================================
  {
    name: "Folk / Country",
    slug: "folk-country",
    description:
      "Rooted in oral traditions, acoustic instrumentation, and narrative songwriting, folk and country music tell the stories of everyday life. From Appalachian ballads to Nashville standards, these genres prize authenticity and lyrical craft.",
    colorHex: "#92400e",
    parentSlug: null,
  },
  {
    name: "Indie Folk",
    slug: "indie-folk",
    description:
      "Indie folk blends the acoustic instrumentation and lyrical intimacy of folk music with the independent ethos and aesthetic sensibility of indie rock. It favors hushed vocals, fingerpicked guitars, and literate, confessional songwriting.",
    colorHex: "#92400e",
    parentSlug: "folk-country",
  },
  {
    name: "Americana",
    slug: "americana",
    description:
      "Americana weaves together threads of country, folk, blues, and roots rock into a distinctly American musical tapestry. It values organic instrumentation, authentic storytelling, and a connection to the traditions of American roots music.",
    colorHex: "#92400e",
    parentSlug: "folk-country",
  },
  {
    name: "Singer-Songwriter",
    slug: "singer-songwriter",
    description:
      "The singer-songwriter tradition foregrounds the individual artist as both composer and performer, emphasizing personal lyrics, acoustic arrangements, and vocal intimacy. It draws on folk, pop, and rock to create deeply personal musical statements.",
    colorHex: "#92400e",
    parentSlug: "folk-country",
  },
  {
    name: "Alt-Country",
    slug: "alt-country",
    description:
      "Alt-country merges the twang and storytelling of traditional country with the attitude and energy of punk and indie rock. It rejects Nashville's commercial polish in favor of raw, unvarnished honesty and musical eclecticism.",
    colorHex: "#92400e",
    parentSlug: "folk-country",
  },
  {
    name: "Bluegrass",
    slug: "bluegrass",
    description:
      "Bluegrass is built on virtuosic acoustic string performance featuring banjo, fiddle, mandolin, guitar, and upright bass. Its rapid tempos, tight vocal harmonies, and improvisational energy trace back to the Appalachian music of Bill Monroe.",
    colorHex: "#92400e",
    parentSlug: "folk-country",
  },
];

// ---------------------------------------------------------------------------
// Adjacencies -- bidirectional relationships between related genres.
// Each conceptual link is represented by two entries (A -> B and B -> A).
// ---------------------------------------------------------------------------

export const adjacencies: AdjacencyData[] = [
  // ── Wing-to-wing adjacencies ──────────────────────────────────────────────

  // Rock <-> Metal
  { genreSlug: "rock", adjacentSlug: "metal" },
  { genreSlug: "metal", adjacentSlug: "rock" },

  // Rock <-> Folk/Country
  { genreSlug: "rock", adjacentSlug: "folk-country" },
  { genreSlug: "folk-country", adjacentSlug: "rock" },

  // Rock <-> Pop
  { genreSlug: "rock", adjacentSlug: "pop" },
  { genreSlug: "pop", adjacentSlug: "rock" },

  // Jazz <-> R&B/Soul
  { genreSlug: "jazz", adjacentSlug: "rnb-soul" },
  { genreSlug: "rnb-soul", adjacentSlug: "jazz" },

  // Electronic <-> Pop
  { genreSlug: "electronic", adjacentSlug: "pop" },
  { genreSlug: "pop", adjacentSlug: "electronic" },

  // Electronic <-> Hip-Hop
  { genreSlug: "electronic", adjacentSlug: "hip-hop" },
  { genreSlug: "hip-hop", adjacentSlug: "electronic" },

  // Hip-Hop <-> R&B/Soul
  { genreSlug: "hip-hop", adjacentSlug: "rnb-soul" },
  { genreSlug: "rnb-soul", adjacentSlug: "hip-hop" },

  // Jazz <-> Electronic
  { genreSlug: "jazz", adjacentSlug: "electronic" },
  { genreSlug: "electronic", adjacentSlug: "jazz" },

  // Rock <-> Hip-Hop
  { genreSlug: "rock", adjacentSlug: "hip-hop" },
  { genreSlug: "hip-hop", adjacentSlug: "rock" },

  // R&B/Soul <-> Pop
  { genreSlug: "rnb-soul", adjacentSlug: "pop" },
  { genreSlug: "pop", adjacentSlug: "rnb-soul" },

  // Folk/Country <-> Jazz
  { genreSlug: "folk-country", adjacentSlug: "jazz" },
  { genreSlug: "jazz", adjacentSlug: "folk-country" },

  // R&B/Soul <-> Folk/Country
  { genreSlug: "rnb-soul", adjacentSlug: "folk-country" },
  { genreSlug: "folk-country", adjacentSlug: "rnb-soul" },

  // ── Rock subgenre adjacencies ─────────────────────────────────────────────

  // Punk <-> Post-Punk
  { genreSlug: "punk", adjacentSlug: "post-punk" },
  { genreSlug: "post-punk", adjacentSlug: "punk" },

  // Punk <-> Grunge
  { genreSlug: "punk", adjacentSlug: "grunge" },
  { genreSlug: "grunge", adjacentSlug: "punk" },

  // Alternative Rock <-> Indie Rock
  { genreSlug: "alternative-rock", adjacentSlug: "indie-rock" },
  { genreSlug: "indie-rock", adjacentSlug: "alternative-rock" },

  // Alternative Rock <-> Grunge
  { genreSlug: "alternative-rock", adjacentSlug: "grunge" },
  { genreSlug: "grunge", adjacentSlug: "alternative-rock" },

  // Shoegaze <-> Dream Pop
  { genreSlug: "shoegaze", adjacentSlug: "dream-pop" },
  { genreSlug: "dream-pop", adjacentSlug: "shoegaze" },

  // Shoegaze <-> Post-Punk
  { genreSlug: "shoegaze", adjacentSlug: "post-punk" },
  { genreSlug: "post-punk", adjacentSlug: "shoegaze" },

  // Psychedelic Rock <-> Progressive Rock
  { genreSlug: "psychedelic-rock", adjacentSlug: "progressive-rock" },
  { genreSlug: "progressive-rock", adjacentSlug: "psychedelic-rock" },

  // Psychedelic Rock <-> Shoegaze
  { genreSlug: "psychedelic-rock", adjacentSlug: "shoegaze" },
  { genreSlug: "shoegaze", adjacentSlug: "psychedelic-rock" },

  // Progressive Rock <-> Progressive Metal
  { genreSlug: "progressive-rock", adjacentSlug: "progressive-metal" },
  { genreSlug: "progressive-metal", adjacentSlug: "progressive-rock" },

  // Alternative Rock <-> Post-Punk
  { genreSlug: "alternative-rock", adjacentSlug: "post-punk" },
  { genreSlug: "post-punk", adjacentSlug: "alternative-rock" },

  // Indie Rock <-> Indie Pop
  { genreSlug: "indie-rock", adjacentSlug: "indie-pop" },
  { genreSlug: "indie-pop", adjacentSlug: "indie-rock" },

  // Indie Rock <-> Indie Folk
  { genreSlug: "indie-rock", adjacentSlug: "indie-folk" },
  { genreSlug: "indie-folk", adjacentSlug: "indie-rock" },

  // ── Hip-Hop subgenre adjacencies ──────────────────────────────────────────

  // East Coast Hip-Hop <-> West Coast Hip-Hop
  { genreSlug: "east-coast-hip-hop", adjacentSlug: "west-coast-hip-hop" },
  { genreSlug: "west-coast-hip-hop", adjacentSlug: "east-coast-hip-hop" },

  // Southern Hip-Hop <-> Trap
  { genreSlug: "southern-hip-hop", adjacentSlug: "trap" },
  { genreSlug: "trap", adjacentSlug: "southern-hip-hop" },

  // Alternative Hip-Hop <-> East Coast Hip-Hop
  { genreSlug: "alternative-hip-hop", adjacentSlug: "east-coast-hip-hop" },
  { genreSlug: "east-coast-hip-hop", adjacentSlug: "alternative-hip-hop" },

  // Alternative Hip-Hop <-> Neo-Soul
  { genreSlug: "alternative-hip-hop", adjacentSlug: "neo-soul" },
  { genreSlug: "neo-soul", adjacentSlug: "alternative-hip-hop" },

  // West Coast Hip-Hop <-> Funk
  { genreSlug: "west-coast-hip-hop", adjacentSlug: "funk" },
  { genreSlug: "funk", adjacentSlug: "west-coast-hip-hop" },

  // Trap <-> Dance Pop
  { genreSlug: "trap", adjacentSlug: "dance-pop" },
  { genreSlug: "dance-pop", adjacentSlug: "trap" },

  // ── Electronic subgenre adjacencies ───────────────────────────────────────

  // House <-> Techno
  { genreSlug: "house", adjacentSlug: "techno" },
  { genreSlug: "techno", adjacentSlug: "house" },

  // IDM <-> Ambient
  { genreSlug: "idm", adjacentSlug: "ambient" },
  { genreSlug: "ambient", adjacentSlug: "idm" },

  // Drum and Bass <-> Techno
  { genreSlug: "drum-and-bass", adjacentSlug: "techno" },
  { genreSlug: "techno", adjacentSlug: "drum-and-bass" },

  // Synthwave <-> Synth-Pop
  { genreSlug: "synthwave", adjacentSlug: "synth-pop" },
  { genreSlug: "synth-pop", adjacentSlug: "synthwave" },

  // House <-> Dance Pop
  { genreSlug: "house", adjacentSlug: "dance-pop" },
  { genreSlug: "dance-pop", adjacentSlug: "house" },

  // House <-> Funk
  { genreSlug: "house", adjacentSlug: "funk" },
  { genreSlug: "funk", adjacentSlug: "house" },

  // IDM <-> Drum and Bass
  { genreSlug: "idm", adjacentSlug: "drum-and-bass" },
  { genreSlug: "drum-and-bass", adjacentSlug: "idm" },

  // Ambient <-> Dream Pop
  { genreSlug: "ambient", adjacentSlug: "dream-pop" },
  { genreSlug: "dream-pop", adjacentSlug: "ambient" },

  // ── Jazz subgenre adjacencies ─────────────────────────────────────────────

  // Bebop <-> Cool Jazz
  { genreSlug: "bebop", adjacentSlug: "cool-jazz" },
  { genreSlug: "cool-jazz", adjacentSlug: "bebop" },

  // Bebop <-> Modal Jazz
  { genreSlug: "bebop", adjacentSlug: "modal-jazz" },
  { genreSlug: "modal-jazz", adjacentSlug: "bebop" },

  // Free Jazz <-> Modal Jazz
  { genreSlug: "free-jazz", adjacentSlug: "modal-jazz" },
  { genreSlug: "modal-jazz", adjacentSlug: "free-jazz" },

  // Fusion <-> Progressive Rock
  { genreSlug: "fusion", adjacentSlug: "progressive-rock" },
  { genreSlug: "progressive-rock", adjacentSlug: "fusion" },

  // Fusion <-> Funk
  { genreSlug: "fusion", adjacentSlug: "funk" },
  { genreSlug: "funk", adjacentSlug: "fusion" },

  // Cool Jazz <-> Modal Jazz
  { genreSlug: "cool-jazz", adjacentSlug: "modal-jazz" },
  { genreSlug: "modal-jazz", adjacentSlug: "cool-jazz" },

  // Free Jazz <-> Bebop
  { genreSlug: "free-jazz", adjacentSlug: "bebop" },
  { genreSlug: "bebop", adjacentSlug: "free-jazz" },

  // ── R&B / Soul subgenre adjacencies ───────────────────────────────────────

  // Neo-Soul <-> Classic Soul
  { genreSlug: "neo-soul", adjacentSlug: "classic-soul" },
  { genreSlug: "classic-soul", adjacentSlug: "neo-soul" },

  // Classic Soul <-> Gospel
  { genreSlug: "classic-soul", adjacentSlug: "gospel" },
  { genreSlug: "gospel", adjacentSlug: "classic-soul" },

  // Funk <-> Classic Soul
  { genreSlug: "funk", adjacentSlug: "classic-soul" },
  { genreSlug: "classic-soul", adjacentSlug: "funk" },

  // Contemporary R&B <-> Neo-Soul
  { genreSlug: "contemporary-rnb", adjacentSlug: "neo-soul" },
  { genreSlug: "neo-soul", adjacentSlug: "contemporary-rnb" },

  // Contemporary R&B <-> Dance Pop
  { genreSlug: "contemporary-rnb", adjacentSlug: "dance-pop" },
  { genreSlug: "dance-pop", adjacentSlug: "contemporary-rnb" },

  // Gospel <-> Singer-Songwriter
  { genreSlug: "gospel", adjacentSlug: "singer-songwriter" },
  { genreSlug: "singer-songwriter", adjacentSlug: "gospel" },

  // ── Pop subgenre adjacencies ──────────────────────────────────────────────

  // Synth-Pop <-> Post-Punk
  { genreSlug: "synth-pop", adjacentSlug: "post-punk" },
  { genreSlug: "post-punk", adjacentSlug: "synth-pop" },

  // Art Pop <-> Synth-Pop
  { genreSlug: "art-pop", adjacentSlug: "synth-pop" },
  { genreSlug: "synth-pop", adjacentSlug: "art-pop" },

  // Dream Pop <-> Indie Pop
  { genreSlug: "dream-pop", adjacentSlug: "indie-pop" },
  { genreSlug: "indie-pop", adjacentSlug: "dream-pop" },

  // Indie Pop <-> Singer-Songwriter
  { genreSlug: "indie-pop", adjacentSlug: "singer-songwriter" },
  { genreSlug: "singer-songwriter", adjacentSlug: "indie-pop" },

  // Art Pop <-> Alternative Rock
  { genreSlug: "art-pop", adjacentSlug: "alternative-rock" },
  { genreSlug: "alternative-rock", adjacentSlug: "art-pop" },

  // Dance Pop <-> Synth-Pop
  { genreSlug: "dance-pop", adjacentSlug: "synth-pop" },
  { genreSlug: "synth-pop", adjacentSlug: "dance-pop" },

  // ── Metal subgenre adjacencies ────────────────────────────────────────────

  // Black Metal <-> Death Metal
  { genreSlug: "black-metal", adjacentSlug: "death-metal" },
  { genreSlug: "death-metal", adjacentSlug: "black-metal" },

  // Death Metal <-> Thrash Metal
  { genreSlug: "death-metal", adjacentSlug: "thrash-metal" },
  { genreSlug: "thrash-metal", adjacentSlug: "death-metal" },

  // Doom Metal <-> Black Metal
  { genreSlug: "doom-metal", adjacentSlug: "black-metal" },
  { genreSlug: "black-metal", adjacentSlug: "doom-metal" },

  // Thrash Metal <-> Punk
  { genreSlug: "thrash-metal", adjacentSlug: "punk" },
  { genreSlug: "punk", adjacentSlug: "thrash-metal" },

  // Progressive Metal <-> Death Metal
  { genreSlug: "progressive-metal", adjacentSlug: "death-metal" },
  { genreSlug: "death-metal", adjacentSlug: "progressive-metal" },

  // Progressive Metal <-> Thrash Metal
  { genreSlug: "progressive-metal", adjacentSlug: "thrash-metal" },
  { genreSlug: "thrash-metal", adjacentSlug: "progressive-metal" },

  // Doom Metal <-> Grunge
  { genreSlug: "doom-metal", adjacentSlug: "grunge" },
  { genreSlug: "grunge", adjacentSlug: "doom-metal" },

  // ── Folk / Country subgenre adjacencies ───────────────────────────────────

  // Americana <-> Alt-Country
  { genreSlug: "americana", adjacentSlug: "alt-country" },
  { genreSlug: "alt-country", adjacentSlug: "americana" },

  // Americana <-> Bluegrass
  { genreSlug: "americana", adjacentSlug: "bluegrass" },
  { genreSlug: "bluegrass", adjacentSlug: "americana" },

  // Singer-Songwriter <-> Indie Folk
  { genreSlug: "singer-songwriter", adjacentSlug: "indie-folk" },
  { genreSlug: "indie-folk", adjacentSlug: "singer-songwriter" },

  // Alt-Country <-> Indie Rock
  { genreSlug: "alt-country", adjacentSlug: "indie-rock" },
  { genreSlug: "indie-rock", adjacentSlug: "alt-country" },

  // Alt-Country <-> Punk
  { genreSlug: "alt-country", adjacentSlug: "punk" },
  { genreSlug: "punk", adjacentSlug: "alt-country" },

  // Bluegrass <-> Classic Soul (shared roots in Southern American music)
  { genreSlug: "bluegrass", adjacentSlug: "classic-soul" },
  { genreSlug: "classic-soul", adjacentSlug: "bluegrass" },

  // Singer-Songwriter <-> Alternative Rock
  { genreSlug: "singer-songwriter", adjacentSlug: "alternative-rock" },
  { genreSlug: "alternative-rock", adjacentSlug: "singer-songwriter" },

  // ── Additional cross-wing subgenre adjacencies ────────────────────────────

  // Psychedelic Rock <-> Ambient
  { genreSlug: "psychedelic-rock", adjacentSlug: "ambient" },
  { genreSlug: "ambient", adjacentSlug: "psychedelic-rock" },

  // Post-Punk <-> Art Pop
  { genreSlug: "post-punk", adjacentSlug: "art-pop" },
  { genreSlug: "art-pop", adjacentSlug: "post-punk" },

  // Fusion <-> Contemporary R&B
  { genreSlug: "fusion", adjacentSlug: "contemporary-rnb" },
  { genreSlug: "contemporary-rnb", adjacentSlug: "fusion" },

  // IDM <-> Alternative Hip-Hop
  { genreSlug: "idm", adjacentSlug: "alternative-hip-hop" },
  { genreSlug: "alternative-hip-hop", adjacentSlug: "idm" },

  // Trap <-> Contemporary R&B
  { genreSlug: "trap", adjacentSlug: "contemporary-rnb" },
  { genreSlug: "contemporary-rnb", adjacentSlug: "trap" },

  // Grunge <-> Alternative Rock (already included above; this pair is
  // a duplicate intentionally avoided -- see line ~280)

  // Synthwave <-> Art Pop
  { genreSlug: "synthwave", adjacentSlug: "art-pop" },
  { genreSlug: "art-pop", adjacentSlug: "synthwave" },

  // Neo-Soul <-> Cool Jazz
  { genreSlug: "neo-soul", adjacentSlug: "cool-jazz" },
  { genreSlug: "cool-jazz", adjacentSlug: "neo-soul" },

  // Drum and Bass <-> Trap
  { genreSlug: "drum-and-bass", adjacentSlug: "trap" },
  { genreSlug: "trap", adjacentSlug: "drum-and-bass" },
];
