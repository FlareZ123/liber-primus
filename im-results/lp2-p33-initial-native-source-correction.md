# Physical p33 first red initial is D, not M; source-selected route correction

**Agent4, 27 November 2026.** The enlarged first red glyph on original physical p33 (archive 50.jpg) is the ordinary D glyph enlarged. It is not a distinct decorative M preceding a transcribed D. The second capital is NG. This invalidates several proposed marker-dependent routes; the original text, p32 artwork evidence and ordinary p33 red-section lengths remain intact. No unknown plaintext recovered.

## Direct native pixel comparison

Use the original JPEGs, no OCR. The independent solved p57 archive 74.jpg line "WE MUST SHED OUR OWN C..." provides native labeled M and D controls. Fixed original-pixel boxes are (x,y,width,height):

| Glyph | Page | Box | IoU against solved M | IoU against solved D |
|---|---:|---|---:|---:|
| p27 oversized M (independent enlargement control) | 27 | 601,913,230,496 | 0.952845 | 0.699655 |
| p33 first oversized red initial | 33 | 601,667,230,498 | 0.693988 | **0.955164** |
| solved MUST M | 57 | 1003,1350,53,114 | 1 | 0.718672 |
| solved SHED D | 57 | 1378,1349,53,115 | 0.718672 | 1 |

For red components threshold R-G>75 and R-B>75; for solved black glyphs threshold grayscale<160. Area-resize each complete ink box to 100×200, threshold occupancy >.5, compare intersection/union. In the actual image, D's crossed diagonal lies below the top ends of its two uprights; M's upper arms reach the top ends. The p27 enlargement resolves the possible scale objection. The source 50.jpg initial is the only first capital before EO; the canonical first word is D EO, not a separate M followed by D. Both canonical corpus offsets [0,91] and the independent ink annotation are D/NG. This experiment uses labels in solved p57, not ciphertext statistics. The labels of p27/p33 were already exposed; this is a deterministic source-morphology check, not a naive blind reader trial.

Pixel SFT: [sims/lp2_p33_initial_native_glyph_sft.py](../sims/lp2_p33_initial_native_glyph_sft.py). Original archive execution produced the table above. The standalone repo-path wrapper is equivalent but has not been independently run on CI.

## Consequences for frozen consumers

The actual GP ordinal/prime pairs are D=(23,89), NG=(21,79). Replacing the input while preserving each prior operation gives:
- Marker ordinal + title length: 23+10=33 and 21+8=29, no equal pair. D is p=23, not B=19. The claimed H(21,2)=(19,23) remains arithmetic, but there is no visible **M,D** initial pair to receive it.
- In the conventional p50 graph, D-prime89 walked four steps gives 89→220→58→146→92, not the 81-rune upper body. Depths 2,3,4,5,6,8,15,19,23 end at 58,146,92,236,238,179,228,102,192; none is81. NG-prime79 walked eight steps still gives 79→82→201→74→205→76→114→197→115. The original dual marker-length match and its claimed base60 evidence are invalid; the independent SEEKS=71 route and lower-body match remain arithmetic.
- DH23 worked-example projection of marker primes: shares [20,10], discrete logs to base5 [5,3], shared value 19 (not 8); it no longer equals lower title length8. The historical fixed key2 and old wrong-input key8 decoder negatives retain their exact limited meanings.
- Replaying the complete original 256-convention cuneiform page:word→BASE29→p50→GP29 family with exact modular accumulation gives **0/256** matches to D/NG. The old target M/NG still yields exactly one match, its prior standard convention. This is an independently corrected original receiver, not a newly optimized search; retire the marker-return claim and all dependent five-value key-selection support.
- p55-derived p32 trunk N→M→NG remains real in the two registrations. It does not contain D at the proposed first-section position. It therefore does not identify both actual p33 initials or establish an east-then-north authored route. Do not salvage by changing the traversal after observing the source correction.

Arithmetic SFT: [sims/lp2_p33_initial_corrected_route_sft.cjs](../sims/lp2_p33_initial_corrected_route_sft.cjs). All 256 variants executed against connected original repository corpus, transcription, and p50 table. Native-pixel and original-table outputs agree with the above, and the older M/NG positive is preserved as a diagnostic of the mistake. No new key is justified by the corrected output 92 or DH value19.

## Separate geometry-selected reversible body trial

Before discovering the source initial error, tested a distinct direct p32-core→p33 black81 receiver using the independently published p55-only contour inverse (no p33 rune fitting). Two frozen signed-image crown registrations, edited mask and unmodified stock rival, threshold pixel probability >=.5. On the inner9 square, root index75, order all 81 cells by lexicographic shortest path cost (entries to background tiles, number of moves, compass priority string). Two tie conventions N-W-E-S and N-E-W-S. Both edited fits give identical occupied membership (9 cells) and equivalent orders; stock has 12 occupied cells. Test reordering the inner pad or receiver, GP ordinal or prime residue, both additive signs: 64 tuples. All replay exactly.

Scorer: 2,993 source-native LP1 GP runes, independent p56 and p57 control texts excluded; choose using first54 (52 scored trigrams), then score final27. Two different planted transformations of authentic 81-rune solved sequences recover exact 81/81, first rank (equivalent crown placements tied), held scores −1.933801 and −2.484487.

| Original candidate | Fit | Held | Full |
|---|---:|---:|---:|
| Best edited mask by fit | −5.005201 | −5.553936 | −5.192744 |
| Best stock by fit | −5.018188 | −5.083848 | −5.040629 |
| Raw original body | — | — | −5.188965 |

No original prose, including the maximum full-score candidate (stock −4.584550). The source p33 input was offsets [10,91), and no marker identity enters this actual inverse. The 81-cell route and compass tie rule were exploratory choices, not creator-authenticated. The held suffix is split within a familiar, collectively examined target, not fresh manuscript evidence. The second planned marker-indexed cyclic inverse was stopped at source assertion before any ciphertext scoring.

[Runnable JS SFT](../sims/lp2_p32_tree_road_priority_sft.cjs) · [complete actual output](lp2-p32-tree-road-priority-output.json). Original JS executed in connected runtime; standalone Node file was committed but no independent CI execution claimed.

**Decision:** retire the M/NG-based receiver-selection chain and this finite road-priority pad/receiver-permutation family. Preserve the independent art registrations, literal D and NG, 10/8 title lengths, 81/115 bodies, the dimensional sum identity, and unrelated exact arithmetic. Reconsider only if a genuinely independent authored operation is found.
