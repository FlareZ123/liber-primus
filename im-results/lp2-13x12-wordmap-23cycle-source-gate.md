# LP2 p0–2: 156-word self-indexed map and unique 23-cycle

**Status: intermediate structural finding. No unknown plaintext, key, cipher, or destination has been recovered.**

## Question and prior observation

The 2016 signed message frames words as a map, their meanings as a road, and their numbers as directions. An external 27×27 proposal already observed that the canonical p0–2 transcription contains 158 complete words and that removing the two red heading words leaves 156=13×12. This report does **not** claim that factorization as new. See the external [strongest-plaintext-evidence note](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/strongest-plaintext-evidence.md).

The dimensions have plausible selectors: the red heading contains 13 runes, while LP1 p05 explicitly elevates the totient function, and φ(13)=12. The new test is whether the 156 body words form a source-indexed pointer map.

## Reproducible construction

Inputs: `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and canonical parser `sims/lp2_word_pages.cjs`.

Run from repository root:

```sh
node sims/lp2_13x12_wordmap_23cycle_source_gate.cjs
```

The script parses the first three physical page segments using the repository's canonical word parser. It returns 158 complete words and 729 runes. The first two words are the red heading; their combined rune count is 13. Removing those two words leaves 156 body words. For each word w_i, calculate its Gematria Primus prime sum S_i using the corpus `prime` array, and define the zero-based pointer:

`f(i) = S_i mod 156`.

The two heading words seed the map using the same rule:

| Heading word | GP prime sum | Zero-based seed | One-based body-word cell |
|---|---:|---:|---:|
| first red word | 347 | 35 | 36 |
| second red word | 315 | 3 | 4 |

The first seed follows **36 → 56 → 113 → 6**, then enters a 23-cycle. The second seed, cell 4, lies directly on that same cycle. The complete functional graph has exactly two cycles, of lengths **23** and **2**. The 23-cycle is unique.

The cycle, rotated to the entry reached by the first red heading word, is:

| Cycle step | Body-word cell (1-based) | GP prime sum |
|---:|---:|---:|
| 1 | 6 | 220 |
| 2 | 65 | 111 |
| 3 | 112 | 34 |
| 4 | 35 | 336 |
| 5 | 25 | 119 |
| 6 | 120 | 3 |
| 7 | 4 | 563 |
| 8 | 96 | 170 |
| 9 | 15 | 67 |
| 10 | 68 | 209 |
| 11 | 54 | 463 |
| 12 | 152 | 108 |
| 13 | 109 | 244 |
| 14 | 89 | 569 |
| 15 | 102 | 128 |
| 16 | 129 | 237 |
| 17 | 82 | 323 |
| 18 | 12 | 618 |
| 19 | 151 | 277 |
| 20 | 122 | 419 |
| 21 | 108 | 139 |
| 22 | 140 | 143 |
| 23 | 144 | 473 |

The body words with sums **563** and **569** are each unique in the 156-word map, and both lie in this cycle. They occur at cycle steps 7 and 14. The 563 word is also the second red heading word's seed cell.

## Independent source correspondences

- The p57 original-image census records the manuscript's red 23-dot mark; the p57 text also explicitly invokes shedding circumferences. This is a plausible selector for the unique 23-cycle, not proof that the creator intended this graph. See `im-results/lp2-original-dot-punctuation-physical-census.md` and `im-results/lp2-p57-literal-word-circumference.md`.
- The 2016 signed image is 563×569. The independently examined p32 11×11 rune grid has top-row and first-column GP-prime sums 563 and 569. The p32 tree artwork is **not** the same artwork as the signed 2016 image; this is a numerical correspondence, not an image-identity claim. See `im-results/lp2-tree121-signed2016-source-gate.md`.
- As a further, unvalidated direct lookup, 563 mod 121 = 79 and 569 mod 121 = 85 select zero-based p32 cells 79 and 85 (one-based cells 80 and 86), whose transliterations are H and S. This is a possible bridge, not plaintext.

## Permutation diagnostic

A deterministic 1,000,000-trial null shuffles the 156 body-word prime sums **within their original starting-page groups** (sizes 57, 62, 37), preserving each page's sum multiset and the two red-heading seeds. Only **93 / 1,000,000** shuffled orderings produce both (a) the two seeds reaching the same 23-cycle and (b) both unique values 563 and 569 lying on that cycle.

This is a targeted permutation diagnostic, **not** a globally corrected p-value. It does not account for searching other moduli, pointer rules, map sizes, or other numerical correspondences. The 13×12 count was already public prior work; the new evidence is the particular prime-sum pointer graph and its source-linked cycle.

## Exploratory continuation — do not promote

If each cycle word's prime sum is additionally reduced modulo 256 to address the p50 256-byte table, and each selected byte is interpreted as `direction = byte & 7`, `distance = byte >> 3`, then a toroidal walk on p32 from zero-based cell 33 (H) reaches an X rune at zero-based cell 54 on cycle step 12, the midpoint of the 23-cycle. In the 93 null permutations satisfying the core cycle/563/569 gate, none reached an X at this midpoint.

This continuation depends on two extra conventions not established by the core result: modulo-256 table addressing and the p50 byte bit-split as compass instruction. The reached X is one of five X runes on p32 and is **not** the X in the contiguous H-O-M-E-X marker. It is an exploratory discriminator for a separate agent to test, not evidence of a recovered route.

## Weakest premise and next decisive work

The weakest premise is the proposed pointer rule `f(i)=S_i mod 156`: it is motivated by the exact 156-word map and the 2016 message, but no creator-authored instruction explicitly specifies this modulus or zero-based convention.

Highest-value next actions:
1. Independently reproduce the canonical parse, heading sums, two-cycle graph, and 563/569 uniqueness from the original transcription and corpus.
2. Seek an independent Cicada-authored selector for the modulo-156 word pointer, rather than sweeping alternative moduli or tuning conventions.
3. Determine whether the 23-cycle has a source-prescribed readout that produces authentic plaintext or key material. Do not treat its length or numerical correspondences alone as a solve.
4. Evaluate the p50 compass continuation separately against the original p50/p32 artifacts and a held-out target; retire it if the modulo-256/bit-split choices cannot be independently justified.

The result changes the research frontier by supplying a compact, falsifiable word-level route from the opening red heading to a unique 23-cycle and the 563/569 p32/2016 correspondence. It does not yet decipher any of the 56 unknown pages.
