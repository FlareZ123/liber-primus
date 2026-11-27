# GP29 pair quotient/remainder receiver — #3123

**Decision:** retire the direct fixed ternary-plus-byte receiver and its simplest lossless escape extension. No unknown plaintext, key, or typed auxiliary grammar was recovered. This does not exclude a separately authenticated encrypted or compressed payload.

## Frozen operation and geometry

Use canonical GP indices in ascending Gematria Primus order, continuous physical p0–55 tape, first rune as high digit, no separator/page reset or alternate offset. Each pair (a,b) is n=29a+b. Its unique decomposition is q=floor(n/256), r=n mod256. For q=0,1,2, emit a byte r plus the corresponding ternary tag; for q=3, emit a typed overflow event with literal r in 0..72. Preserve every event's position and tag. Forward n=256q+r, then a=floor(n/29), b=n mod29. The exact legal state space is 3×256+73=841; a strict ternary×byte alphabet cannot injectively represent all pairs. The escape representation is an exploratory modeling decision, not an instruction found in the source.

Input: `resources/liber-primus/lp2-corpus.json`, blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, 12,956 unknown-page runes and 6,478 pairs. Train p0–26 (3,263 fully contained pairs); test p27–55 (3,214 fully contained pairs), omit only boundary-crossing pair index3263 from prediction statistics. Full inverse retains it. No rephasing.

## Original result

| Metric | Full | Train | Held out |
|---|---:|---:|---:|
| q0 | 1917 | 986 | 931 |
| q1 | 2001 | 1009 | 992 |
| q2 | 1980 | 945 | 1034 |
| q3 (overflow) | 580 | 323 | 257 |
| Ordinary printable ASCII including TAB/LF/CR | 38.047% | 37.755% | 38.316% |
| Ordinary byte entropy (bits) | 7.9620 | 7.9293 | 7.9279 |
| Longest ordinary printable run | 9 | 6 | 9 |

Strict ternary-plus-byte fails on 580 original states (8.953%). The escape extension is legal and replays the complete tape, but legality is automatic by construction. Ordinary payload starts `bb0dc1cd1f9345d55560431105c96662`. Neither start nor held-out section start matches the fixed list gzip, bzip2, ZIP, PNG, PDF, ELF, PGP armor, xz, JPEG, 7z. No arbitrary masks or offset scan. The overflow literals are printable 60.52%, close to 44/73=60.27% expected for uniform 0..72; no independent side grammar selected. A first-order quotient transition model, add-one smoothed and trained only on the first section, loses 0.001380 bits per held-out transition relative to the frozen iid quotient model. This supplies no transferable serial tag rule.

## Calibration and rival

All 841 legal states round-trip exactly, with strict range checks. The independently solved p56 prime-minus-one/F-hold and p57 clear GP text provide two native ASCII transliteration plants (91 and 100 letters, respectively) using a fixed cycling ternary tag; both recover every byte and tag, and 100% printable versus 38% original. The additional 256-event mixed overflow plant recovers all 20 reserved events and their exact positions. These are constructed controls, not historical instances of the proposed codec.

Two sets of 1,000 seeded null tapes: iid uniform GP29 and a uniform nonrepeat-transition generator with exactly the original 37 within-pair and 49 between-pair repeat flags randomly placed within each parity. The observed values are inside the central 95% of the repeat-matched null for every frozen diagnostic:

| Metric | Original | Matched central 95% |
|---|---:|---:|
| Overflow fraction | .089534 | .079654–.092776 |
| Ordinary ASCII fraction | .380468 | .371593–.396468 |
| Ordinary byte entropy | 7.962032 | 7.956451–7.969013 |
| Longest printable run | 9 | 7–12 |
| Held-out quotient gain (bits/transition) | −.001380 | −.005797–.000865 |

The iid byte entropy lower-tail count is 15/1000; the repeat-matched count is 398/1000. Low-repeat behavior accounts for the apparent entropy anomaly under the simpler null. The matched null controls only equality counts, not all observed rune marginal or lag structure; these diagnostics do not establish global equivalence to randomness.

Single-channel rival: canonical whole-tape BASE29 big integer converted to minimal big-endian bytes, preserving the known rune count to restore leading zero digits. Exact inverse; 7,868 bytes, 38.421% printable, entropy 7.976885, prefix `08734843a55193dcbb7231b564a2a088`, no fixed header. No recognizable advantage for the pair receiver.

## Conclusion and next decision

The strict three-tag model fails structurally in both independent sections. Allowing typed overflow restores invertibility but adds no identifying evidence: 580 escape positions need a separately selected semantic interpretation. All frozen diagnostics are unexceptional under the matched low-repeat rival, and the simple quotient transition law fails held-out improvement. Do not continue searching arbitrary byte XOR masks, arbitrary alternate pair frames, or overflow trimming. Reopen only with independently selected pair framing, overflow semantics or authenticated byte-format evidence. A nested encryption or compression layer remains outside this finite gate.

Reproduction: `node sims/lp2_gp29_pair_quotient_gate.cjs`; [raw JSON](lp2-gp29-pair-quotient-output.json). The exact computation executed in the connected JavaScript runtime on the fetched canonical corpus. The standalone Node filesystem wrapper was not separately executed. Seed 0x3123beef. Code and raw output commit `de5bdbc5c36f820c8c6d655b93ecafcfdd5cd15e`.
