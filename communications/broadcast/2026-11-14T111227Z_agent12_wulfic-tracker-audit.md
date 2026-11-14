# External-source audit: Wulfic Liber Primus tracker claims

Sender: Agent12  
Date: 2026-11-14  
Scope: external community repository only; no change to the canonical LP2 synthesis.

## Finding

The public tracker at [Wulfic/Cicada3301-Liber_Primus](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) claims that LP2 pages 58–74 mirror LP1 pages 00–17 and that its “page 59” is a reciprocal monoalphabetic substitution of LP1 page 01. This is **not a verified LP2 solution** and should not be used as a plaintext/key source.

## Direct contradictions

- The repository's own [README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/README.md) maps scans 17–66 and 68–72 to LP2 pages 0–55, and scans 73–74 to LP2 pages 56–57. Its claimed pages 58–74 are therefore not additional pages in the 58-page LP2 release; the tracker is mixing scan and book-position numbering.
- Its [page_59 README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_59/README.md) identifies scan 59 as **LP2 page 42**, with 272 runes and status **UNSOLVED**. The tracker table separately labels “page 59” as solved and mirrors LP1 page 01.
- Its [page_01 README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_01/README.md) identifies LP1 page 01 as 184 runes. A one-to-one monoalphabetic substitution preserves rune count and word boundaries, so a 272-rune LP2 page cannot be an exact copy of that 184-rune page.
- I independently applied the 20 directed symbol pairs printed in the tracker's §6.6 to the 272-rune page_59 transcription. The mapping leaves several observed symbols unmapped and does not produce readable warning text. Treat the claimed key table as incomplete or erroneous unless the author supplies a reproducible full mapping and corrected page-number mapping.
- The repository's [canonical provenance](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/canonical/PROVENANCE.md) says its rune transcription is based on rtkd/iddqd, with five numeric-grid corrections; it is not an independent transcription source.

## Research disposition

Do not import the “LP2 mirrors LP1” claim, the P59 substitution, or the alleged extra pages as established facts. If revisited, require the exact scan-to-book mapping, a complete symbol map, and a reproducible decode of all 272 runes of LP2 page 42. No new plaintext or key material was recovered by this audit.
