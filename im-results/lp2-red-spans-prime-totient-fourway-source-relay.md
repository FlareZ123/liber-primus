# Four original red spans encode a unique prime/totient arithmetic relay

**Agent 50, 16 November 2026. Status: intermediate, source-exact, postselected clue candidate. No recovered unknown LP2 plaintext, cipher key, decipherment operation or destination.**

## Exact original-ink observation

The 58 original LP2 page images and their page-corrected 29-symbol source transcription define 18 physically colored red rune spans (225 red runes in all). Use the published Gematria Primus **prime weights**, not their 0–28 symbol indices. Four distinct, visually fixed red spans give:

| Physical page and position | Source role | Red runes | GP-prime sum |
| --- | --- | ---: | ---: |
| p0, runes 0–12 | First red 8+5-word heading | 13 | **662** |
| p6, runes 71–81 | Interior red 4+1+4+2-word passage | 11 | **661**, prime |
| p27, runes 0–18 | Red 3+12+4-word heading | 19 | **1109**, prime |
| p57, runes 0–6 | **Already clear** PARABLE heading | 7 | **449**, prime |

They satisfy **two linked exact equalities**:

\`\`\`text
sum(p0 red)  = sum(p6 red) + 1      = 662
sum(p27 red) = sum(p6 red) + sum(p57 red) - 1
             = 661 + 449 - 1       = 1109

sum(p27 red) - sum(p57 red) = 660 = Euler_phi(661)
sum(p27 red) - sum(p6 red)  = 448 = Euler_phi(449)
\`\`\`

The two totient equations are the **same additive identity**, expressed using the fact that 661 and 449 are prime. They do **not** count as independent confirmations. The already solved Cicada material explicitly says the *totient function is sacred*, so this relation has a plausible human-readable mathematical vocabulary; the text does **not** instruct solvers to apply that rule to these three particular red passages.

There are **18** original source-colored spans. Exhaustive comparison of *all* ordered **four distinct spans** for the joint condition \`A=B+1; C=B+D-1; B and D have prime sums\` finds **exactly one** source match: \`A=p0, B=p6, C=p27, D=p57\`. The report deliberately lists every case through a complete programmatic census instead of identifying the four passages as a preordained grouping.

## Distinct original-era pointers, not a recovered opcode

Two previously documented sources happen to intersect the same values:

- The source-authenticated **2014 OpenPuff 7×7 magic square** has row-center 331 and row-edge 16; the two original p0 *red-word* sums are \`347=331+16\` and \`315=331−16\`, total \`662=2×331\`. The dated 2014 Stage11 archived HTML likewise prints 133 and 331. This is [existing prior source evidence](lp2-stage11-html-p0-red-title-331-16-link.md); no new instruction follows from it.
- An already published **361-entry reconstruction** of the *secondary-witness* 2013 remote missing-prime/gap transcript gives \`S[133]=449\` and \`S[331]=1109\` in **zero-based** indexing. Those match the p57 and p27 red-span sums respectively; the original reconstruction and its authentication limits predate this observation. See [the earlier source gate](crossround-361-133-331-source-gate.md). The indices 133/331 overlap the 2014 HTML values, but no authentic first-party source tells a solver to use this reconstructed series as the red-title map.

These intersections are hypotheses about **intended navigation or numerical key selection**. They do not authorize borrowing a modulus, exponent, starting prime, cipher sign or word order to produce plaintext.

## One complete reversible key-use candidate, rejected on original ciphertext

Cicada's original 2012–2014 rounds used RSA, and the solved LP1 WISDOM instructs that primes and the totient are sacred. The three **independently marked prime sums** suggest a particularly short source-driven interface: \`p=661\` (p6 red), \`q=449\` (p57 PARABLE), and \`e=1109\` (p27 red), giving the valid RSA values

\`\`\`text
n=p*q=296789
phi(n)=(p-1)*(q-1)=295680
gcd(e,phi(n))=1
d=e^(-1) mod phi(n)=134909
\`\`\`

Because \`29^3 = 24389 < n < 29^4 = 707281\`, a compact, conventional **three-GP-rune plaintext block → four-GP-rune ciphertext block** would use RSA modular exponentiation and four positional GP29 digits per emitted block. The source stream contains **12,956/4=3,239** such candidate blocks, so this is a finite mathematically plausible format. The first 4 original ciphertext rune indices are **[15,8,18,3]**, whose ordinary base29 value is **373,088**, already **greater than n=296,789**, a prohibited canonical RSA ciphertext representative. The full original book contains **1,917/3,239** invalid blocks at zero phase with conventional big-endian digits. Granting every fixed four-block phase, both digit endiannesses and continuous/per-physical-page reset still leaves **at least 1,836** invalid blocks in every variant.

The p0 red 13-rune heading may be metadata rather than encrypted data. Excluding those 13 runes from the original 729-rune opening chapter leaves **716 black runes**, exactly **179** complete 4-rune blocks, yet **107/179** are invalid (\`>=n\`) even under the intended heading-excluded start. A dedicated positive plant uses the **first 93 original clear p57 GP29 runes**, packs them into 31 three-rune message values, RSA-encrypts to 124 four-rune digits and recovers **93/93** unchanged with the derived private exponent. That establishes correctness of both the RSA inverse and the necessary ciphertext bounds.

**Decision:** This direct source-selected-looking RSA \`(p,q,e)\` assignment with canonical four-rune GP29 serialization is mathematically **impossible as the original emission format**; decrypting invalid representatives by reducing them modulo \`n\` would be a different, lossy, unsupported format. Arbitrary padding, variable block packing or a cipher based on different prime roles remains untested because the original artifact supplies no packing rule. This gate deliberately does **not** evolve into an open-ended search over RSA encodings. [Read-only original RSA and authentic-clear-p57 SFT](../sims/lp2_red_totient_rsa29_blockgate_sft.cjs).

## Locked family calibration and reproducibility

The [single-file Windows-compatible Node22 CJS reproducer](../sims/lp2_red_source_totient_relay_sft.cjs), [passed in original-source Windows Actions run 43910012110](https://github.com/FlareZ123/liber-primus/actions/runs/43910012110), asserts each red glyph against the actual \`lp2-corpus.json\`, recomputes the 18 complete red-span sums, checks the above four values and exact unique four-span relation, then runs a **60,000-draw, globally consistent permutation of the 29 GP prime-weight assignments**, xorshift32 seed \`0x5173301\`. Each null book reruns **the full original 18-span four-tuple search**, permitting neither duplicated span positions nor unprime \`B/D\`.

Exactly **63/60,000** null assignments contain at least one such four-span structure (71 total matched tuples, maximum two in a null sample). This is a **conditional algebraic label-permutation benchmark**, not an authorship p-value: the four observed pages and their arithmetic were identified after surveying substantial preexisting research, and many other arithmetic relationships have been investigated. The null preserves original rune identities, positions, repetitions and red-span geometry while scrambling how source rune identities receive the ordered 29 prime weights.

No historical cipher, original unsolved plaintext word, causal key application, or independent output is obtained. The relation belongs among exploratory observations, **not** in the authoritative established-solution register.

## What would actually advance the book

The promising route is narrow: recover a creator-era instruction connecting prime-weight sums of **marked red passages** to a specific **receiver page and reversible 29-symbol operation**, then predict a full original unknown passage and a separate held-out chapter *without changing the rule*. The 2013 register \`S\` and 2014 HTML suggest candidates to examine only if such an authored connection emerges. A new seed sweep of \`661\`, \`449\`, \`1109\`, \`133\` or \`331\` against an already-failed Caesar, direct totient/F-clock, arbitrary AES, DH or Hill family would repeat completed nulls, and the arithmetic itself supplies no such operation.
