# Fixed grammatical clitic framing and all-secret q8 phrase-domain inverse (#2723)

**Decision (Agent8, 25 November 2026):** the frozen grammatical attachment rule improves coarse native length compatibility relative to ordinary word framing, so it is a meaningful alternate representation. However, the exact terminal q8/F-hold receiver fails all keys even allowing arbitrary group start phases, whole-group permutation, and the specified unlimited clitic chains. No unknown plaintext/key or authored selector.

## 1. Frozen plaintext-side framing

Preserve Agent11's recorded list **A, AN, THE, OF, TO, IN, ON, AT, BY, UP, AS**. Treat these exact spellings as particles, attach any maximal run to the next nonparticle word, and preserve a trailing particle chain. All runes are retained. This lexical rule is fixed irrespective of POS. Test both established GP donor spelling conventions and canonical carry-aware source grouping (2,896 groups, 12,956 runes). The SFT counts every exactly rune-length-matched window of complete groups in the first 80% and last 20% of each pinned Gibran/Shakespeare/Emerson source. Counts are invariant to any whole-group permutation. Native solved sections are also framed using exact GP spellings.

| Held-out comparison | Original | Clitic range | Ordinary range |
|---|---:|---:|---:|
| Whole-book groups | 2,896 | 2,348–3,006 | 3,050–3,377 |
| Whole-book singleton groups | 83 | 18–188 | 69–233 |
| Whole-book groups of length ≤2 | 531 | 208–551 | 806–1,016 |
| Whole-book groups of length ≥8 | 343 | 284–542 | 206–382 |
| p40–53 groups | 669 | 523–727 | 676–814 |
| p40–53 groups of length ≤2 | 114 | 37–160 | 153–271 |
| p54–55 groups | 66 | 41–90 | 57–98 |

All four marginal metrics fall within the clitic-control held ranges in all nine chapters and full book. Ordinary-word framing misses at least one range in seven of nine chapters and full book. No held native complete-window histogram exactly equals any original chapter (also true of ordinary framing); best whole-book histogram L1 is 413 clitic vs 646 ordinary. These are finite overlapping-window ranges, not independent statistical tests or evidence of an authentic authored grammar. They suffice to advance the requested cipher gate; do not assert that the complete joint distribution matches. In the exact solved controls, fixed attachment reduces groups in every section but eliminates singletons in seven of nine sections.

- [Inventory SFT](../sims/lp2_clitic_group_inventory_sft.cjs)
- [Full window statistics](lp2-clitic-group-inventory-output.json)

## 2. Exact original key support, no chain truncation

Freeze q8 GP29 addition with literal plaintext F bypass, arbitrary initial phase per group, and a single common cyclic key. The 36,193-form frozen lexicon from the carry experiment uses both donor tokenizations, native solved sections except WELCOME and KOAN, and the English frequency list. 36,182 forms are content words under the exact particle list. The grammar is `particle* content` for a complete nonterminal phrase. For a terminal trailing chain, `particle+` is additionally permitted. Ambiguous lexical spellings are retained, and no arbitrary maximum chain length is imposed.

The 232-rune p54 prefix has 49 complete groups, of which six have exactly eight nonzero ciphertext runes, at offsets [1,9), [9,17), [70,78), [86,94), [159,167), [176,184). The seam-crossing group [222,233) is excluded. A nonzero ciphertext rune cannot be a literal held F, so any admissible plaintext for these anchors consumes all eight key slots. OF contains F and is impossible in such an anchor. Generate all nonzero 8-rune phrases by the exact finite length DP for particle prefixes and content endings: 832,657 distinct phrases. For each anchor C and phrase W, the only key segment is C−W mod29, reduced to its canonical cyclic rotation. Sort and deduplicate the six full-key domains; their support counts are exact. Any common key under a 5% OOV allowance (floor(.05×49)=2) must cover at least four of these six groups. This is a necessary condition even if other groups are permuted, have arbitrary start phases, or contain consuming ciphertext zero.

| Outcome | Result |
|---|---:|
| Original six domain sizes | 832,651–832,657 |
| Canonical keys with support one | 4,995,662 |
| Canonical keys with support two | 132 |
| Keys with support ≥3 | 0 |
| Keys with required support ≥4 | 0 |
| All-key minimum OOV lower bound | 4 of 49, budget 2 |

No original candidate is admissible even before accessing p55. No withheld original scoring or substitute model follows after the exact gate fails.

## 3. Blind controls and ambiguity

Three independent held native donor streams were framed and encrypted using three hidden q8 keys and the genuine F-hold convention. The first six eligible, fully nonzero eight-rune phrase anchors were selected in each held stream. This is anchor-conditional calibration, not a claim of identical original inventory. In every plant the true key is the sole canonical rotation class with support ≥4, with all six anchors supported. With the key frozen, decode the next 16 complete held phrases allowing every phase, both legal paths at ciphertext zero, and all grammatical parses. All 48/48 true plaintexts and all 48/48 true boundary sequences occur in the candidate domains. 36/48 plaintexts and 33/48 boundary sequences are uniquely recovered; the remainder demonstrate genuine phase/segmentation ambiguity. No false rejection. This validates the exact domain construction and calibrated key discrimination, not unique general segmentation.

- [Exact phrase-domain SFT](../sims/lp2_clitic_q8_allkey_anchor_sft.cjs)
- [Executed key domains and blind controls](lp2-clitic-q8-allkey-anchor-output.json)

**Disposition:** close #2723. Preserve the modest improvement in coarse length compatibility as a representation observation. Retire the fixed clitic + canonical q8/F-hold receiver under the frozen finite content lexicon and 5% OOV threshold; do not broaden the particle list or cipher period to rescue the candidate. No plaintext, key or independent source selector. H-decoy, other grammars, other cipher mechanisms and arbitrary out-of-register words remain outside this rejection. Connected V8 executed both SFT functions; standalone Windows/Node wrappers were not separately run.
