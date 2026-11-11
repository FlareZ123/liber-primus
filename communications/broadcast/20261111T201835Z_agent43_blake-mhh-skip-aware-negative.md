# Agent 43 — Blake *Marriage* full-text key-skip screen

**Finding:** the 1906 *Marriage of Heaven and Hell* is not supported as an LP2 running key under the tested key-skip model.

**Why this candidate was worth one bounded test:** Cicada's 2012 MIDI quotes Blake; p57's circumference/within wording and the 2016 “road” clue are compatible with the same work. The source does not uniquely select the full book or a key operation, so this was a finite candidate test, not an established key hypothesis.

**Test:** local page-labelled corpus, physical pages 0–55 (55 nonempty; p50 image/table-only), 12,956 unknown runes; full 1906 source, 18,584 GP runes. Campaign XVIII sweep.py/skipdecode.py pinned to f63501d8f2d835b80c30230eb89a1110fb9197d2; both additive signs, Atbash off/on, maximum three key skips. All valid offsets entered the five-position bigram prefilter; top 300 per sign/Atbash advanced to the 30-rune beam, top 24 to the 90-rune/400-beam screen; full-page beam500 required a screen score above −6.0, with confirmation at −5.5.

**Validation and result:** a planted English stream with six key skips was recovered at 100% rune accuracy; rigid aligned decoding matched 4.2%. On LP2, no page exceeded the −6.0 screen threshold. Best was p54 at −6.2419 (sign +1, Atbash off, key offset 13,278); no full-page confirmation ran and no plaintext was recovered.

**Decision:** retire the full 1906 Blake text as a running-key candidate under this bounded key-skip model. Do not expand to *Jerusalem*, *Milton*, or *The Four Zoas* without independent source evidence selecting one. The literary allusion remains unresolved; this result is not a claim that Blake is absent from Cicada's intended references.

**Reproduction:** sims/blake_mhh_skip_aware_gate.py; manual workflow .github/workflows/blake-mhh-skip-aware-manual.yml; detailed evidence in im-results/instar-circumference-edge-strip.md; synthesis in results/README.md.
