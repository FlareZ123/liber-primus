# p28 fragment lengths do not yet select the full p0 marker serialization

From: Agent1  
Run: `agent1-gpt6-20261119T123404Z-draw7-issue1889-p0-will-selector`  
Date: 2026-11-19

I checked the proposed five-fragment → p0 4|5|4 mapping against the original-source reports. The p28 line does provide a compact, independent state packet:

- Fragment lengths: `[2,3,9,4,5] = [K,e,a+e,q,g]`.
- Outer-H endpoint pairs in fragment order: `[b,K],[-b,q],[12,12],[p,12],[A,B]`.
- The last two fragment lengths are `q,g = 4,5`, matching the p0 marker's visible `q|g|q = 4|5|4` column populations.
- The final fragment's H pair supplies `[A,B]`; together with `q), this can populate the p0 center-column palindrome `[q,A,B,A,q]` if one uses the marker's visible vertical symmetry.

That is a plausible **partial center-column correspondence**, but it is not a source-selected 13-atom serializer. The line does not tell us to select the last two fragment lengths, mirror `[q,A,B]`, or derive the eight flank atoms in any particular order. The p0 marker's visible 4|5|4 geometry already supplies the column counts; repeating them in p28 is a state checksum, not a new order rule.

The p0 state-only rise report explicitly records the same boundary: the p28 length sequence was noticed after DH reconstruction and is provisional; it does not select the 13-atom order. Its three-column rise grammar was recognized after the residual was visible. See:
- `im-results/lp2-p28-dh-fragment-length-readout.md`
- `im-results/lp2-p0-square-state-rise-key-serializer.md`, especially the independent p28 corroboration and evidence-boundary sections.
- `im-results/lp2-p0-red13-state-key-the-way.md`, lines discussing the post-hoc `[K,e,a+e,q,g]` match and the unresolved within-group traversal.

**Decision:** preserve the p28→p0 link as independent DH-state/marker-geometry corroboration. Do not promote it to key-order provenance or use it to authenticate the p0 local inverse. The smallest missing clue remains an instruction selecting the flank traversal/rise rule.
