import { rock } from "./rock.js";
import { hipHop } from "./hip-hop.js";
import { electronic } from "./electronic.js";
import { jazz } from "./jazz.js";
import { rbSoul } from "./r-b-soul.js";
import { pop } from "./pop.js";
import { metal } from "./metal.js";
import { folkCountry } from "./folk-country.js";

export const candidates: Record<string, Array<{ artist: string; title: string }>> = {
  "rock": rock,
  "hip-hop": hipHop,
  "electronic": electronic,
  "jazz": jazz,
  "r-b-soul": rbSoul,
  "pop": pop,
  "metal": metal,
  "folk-country": folkCountry,
};
