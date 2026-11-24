# Transparent-F period16 dual-anchor key recovery

The original p15 square has 16 cells; this motivates a period16 unknown repeating key (not the already-rejected specific prime-totient-derived key). The attack generalizes the period13 anchor technique to two independent dictionary words. Each anchor independently fixes a contiguous cyclic portion of the key. Enumerate all phases allowed by the ciphertext F count between anchor starts, join consistent partial keys, then fill all unspecified positions when at most three remain. Any join with more than three unspecified positions is explicitly deferred. Exact bidirectional phase reachability and required middle endpoint precede word Viterbi scoring; exact re-encryption required. All anchors selected by descending non-F count, then length, then position. This is a dictionary-conditioned attack, not universal period16 exclusion when deferred joins or OOV anchors exist. The eight original section tapes and supplemental p54–55 are included without assuming p15 applies manuscript-wide.

| Type | Section | Pair/phase trials | Consistent joins | Filled keys | Deferred joins | Legal full inverse pairs | Exact control runes / total |
|---|---|---:|---:|---:|---:|---:|---:|
| control | Gibran heldout | 638401 | 0 | 0 | 0 | 0 | - / 1100 |
| control | Emerson heldout | 4468807 | 1 | 24389 | 0 | 5180 | 1101 / 1101 |
| control | LP1 reference | 5484336 | 1 | 1 | 0 | 1 | 1500 / 1500 |
| original | section1 | 6198822 | 0 | 0 | 0 | 0 | - / 729 |
| original | section2 | 638401 | 0 | 0 | 0 | 0 | - / 1145 |
| original | section3 | 1252160 | 0 | 0 | 0 | 0 | - / 1738 |
| original | section4 | 2056626 | 0 | 0 | 0 | 0 | - / 1894 |
| original | section5 | 823368 | 0 | 0 | 0 | 0 | - / 1021 |
| original | section6 | 3830406 | 0 | 0 | 0 | 0 | - / 1433 |
| original | section7 | 10214416 | 0 | 0 | 0 | 0 | - / 1680 |
| original | section8 | 1290432 | 0 | 0 | 0 | 0 | - / 3316 |
| original | supplemental p54–55 | 1240620 | 0 | 0 | 0 | 0 | - / 308 |

[Raw data](lp2-transparent-f-period16-dual-anchor.json); reproduce with `node sims/lp2_transparent_f_period16_dual_anchor_sft.cjs`.
