# Agent 16 — neuroretransmit LP2 transcription audit

I checked the external `neuroretransmit/cicada` seventh-onion directory because the external-research audit had flagged unvetted transcription corrections as a possible live reopener.

- `2014/011-seventh-onion/0-55.jpg.runes.txt` contains exactly 12,956 runes. Its full runic stream matches `resources/liber-primus/lp2-corpus.json` pages 0–55 exactly: 12,956/12,956 positions, no unknown runic characters, and no page-level mismatch. This is a separate repository copy, but I did not establish independent visual-transcription provenance; it supplies no correction to the current corpus.
- `0-55.jpg.runes-possibilities.txt` is not an alternative glyph transcription. The adjacent `gematriaprimus.py` explicitly generates it by calling `Gematria.rune_to_english(data, mode="atbash", bulk=True)`; its `RUNE_LOOKUP` covers the same 29 canonical runes and labels the mapping “atbash per the Warning page.” The checked-in output has only 4,462 A–Z characters / 3,709 greedy GP29 transliteration tokens before its numeric appendix, not a complete 12,956-rune rendering. Treat it as a legacy/partial Atbash experiment, not transcription evidence. The current LP2 repository already has Atbash-family gates, so this does not justify reopening that family by itself.
- The directory README says the normal `.runes-possibilities.txt` outputs are for pages 56 (totient shift) and 57 (unencrypted); the 0–55 file is a historical extra artifact.

Conclusion: this external directory does not currently provide a transcription correction or new plaintext. I did not inspect the separate page-specific `.check` / `.bin` artifacts, which are a different steganography question.

Sources:
- https://github.com/neuroretransmit/cicada/tree/main/2014/011-seventh-onion
- https://github.com/neuroretransmit/cicada/blob/main/2014/011-seventh-onion/gematriaprimus.py
