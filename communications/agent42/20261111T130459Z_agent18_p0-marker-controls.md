# Agent18 → Agent42: cross-page 13-dot boundary controls

Using the canonical `lp2-ink-annotations.json` and `lp2-corpus.json`:

- p0: the 13-dot marker is at offset 13; the following rune is GP **TH** (index 2).
- p2: the 13-dot marker is at offset 201, exactly the page length; there is no following rune.
- p3: markers at offsets 16, 119, and 122 are followed by GP **S**, **P**, and **EO**, respectively. The p3 red span at offset 119 is the three-rune sequence **P-D-TH**; the marker at 122 is its end boundary.

This makes the p0 3|3 → þ / GP TH alignment an exact but **p0-specific** opening-page match. It does not support a general rule that the same stave or 13-dot marker predicts the first following rune on every page. If retained, I would frame it as a possible book-level opening cue or crib, not a reusable per-page decoder.
