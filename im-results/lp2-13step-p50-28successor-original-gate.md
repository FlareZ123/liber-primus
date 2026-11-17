# A reversible 13-step predecessor-dependent 28-successor transport: original p51–55 gate

**17 November 2026, Agent 2. Supporting finite negative. No recovered unknown-page plaintext, authenticated key, or historical opcode.** [Single-file CommonJS reproducer](../sims/lp2_13step_p50_28successor_original_sft.cjs).

## Exact hypothesis and unique inverse

The 12,956 unknown LP2 rune symbols have only 86 same-page adjacent equalities among 12,901 pairs; a page-27 12-rune word has disjoint repeated pairs at positions 4–5 and 10–11. That word excludes the earlier strict no-repeat plus one-null-per-word R3. A 29-symbol plaintext alphabet can nevertheless be mapped bijectively into a 29-symbol ciphertext alphabet at each step while favoring 28 non-repeating successors: designate **one rare predecessor-dependent plaintext transition** to emit the zero difference. Every other plaintext transition emits one of 28 nonzero differences. No hidden deletion, extra glyph, or side channel is required. This is a real invertible construction; its ability to reproduce an arbitrary ciphertext alone proves no historical relevance.

The original thirteen-dot marks supply a weak motivation to test the fixed step \(s=13\) in GP ordinal arithmetic. The printed 32×8 p50 table supplies a separate, unauthenticated row-major **base60** interpretation of 256 numeric bytes \(b_0,\ldots,b_{255}\). Freeze the first receiving rune as p51's first rune immediately after the table and continue across p51–55 without resets or extra punctuation clocks. Let all rune ordinals belong to \(\mathbb Z/29\mathbb Z\):

- \(C_0=(P_0+b_0)\bmod29\).
- For each \(i>0\), let \(z_i=(P_i-P_{i-1}-13)\bmod29\).
- If \(z_i=0\), emit \(\Delta_i=0\); otherwise emit \(\Delta_i=1+((z_i-1+b_{i\bmod256})\bmod28)\).
- \(C_i=(C_{i-1}+\Delta_i)\bmod29\).

The inverse obtains \(\Delta_i=(C_i-C_{i-1})\bmod29\). It recovers \(z_i=0\) when \(\Delta_i=0\), otherwise \(z_i=1+((\Delta_i-1-b_{i\bmod256})\bmod28)\), then \(P_i=(P_{i-1}+13+z_i)\bmod29\). The first plaintext is \(P_0=(C_0-b_0)\bmod29\).

This is a full per-position bijection for every previous plaintext rune and every table byte: the zero residue maps to zero, while the 28 nonzero residues undergo a cyclic permutation. It is length-preserving, causal and explicitly invertible even at the actual double-doublet p27 witness. At any repeated ciphertext rune, the proposed plaintext must contain a successive GP ordinal difference of exactly 13. The first-party material does **not** establish that these 13-dot marks specify such a predecessor-dependent marker, nor that p50 should control a 28-ary rotor.

## Locked original-input test

The supplied code reads unchanged canonical GP29 indices, the p50 byte table, printed word boundaries, and the pre-existing independent TextBlob English-to-GP lexicon. The following results are from the exact implementation on the original-source values:

| Check | Observation |
| --- | --- |
| Original p27 witness | GP indices **12,4,9,15,3,3,5,24,18,26,18,18**; doublet second-rune offsets **5 and 11**. Both decode and re-encrypt without deletion |
| Original contiguous p51–55 receiver | **842 runes**, **184 printed words** |
| Decoded p51–55 GP29 index of coincidence | **0.03444604**, with original ciphertext IoC **0.03409864** |
| Decoded complete words found in frozen 29,058-word lexicon | **10/184**; these include short accidental entries, and the output is overwhelmingly nonlinguistic |
| Authentic solved p56 plaintext | **85/85** synthetic cipher inversion (implementation positive only) |
| Clear original p57 | **95/95** synthetic cipher inversion; **16/20** source-printed words in same lexicon before ciphering |
| p27 entire word under the required 13-step equality-marker pattern | **0** matching 12-rune words in the pre-existing 29,058-word lexicon |

The p27 dictionary screen is a necessary word-shape condition only under the **13-step** proposed rule, intact printed word lengths, ordinary GP29 English spelling and the chosen dictionary. It cannot logically exclude proper names, unattested English words or another plaintext language. The p51–55 original output's weak word support and flat unigram distribution are independent reasons to reject this **specific source-keyed direct decoder** as an original-LP2 plaintext recovery.

The source table's radix remains disputed between byte interpretations; a different 28-way key stream, marker function, reset, serialization or language is outside this frozen test. Exhaustively rotating keys to fit native prose would weaken the original clue and create arbitrary alternatives.

## Research decision

A fixed-length reversible 29-to-29 feedback emitter can handle p27's two spatially separate doublets **without any appended null or hidden side information**. This resolves the mechanism-design feasibility question for the constructed family, and explains why an unconditional information-capacity bound for a *strict universal anti-repeat ceiling* does not by itself rule out a *plaintext-dependent suppression* architecture.

The key problem is now discriminative: there is no independently selected rule identifying which plaintext transition emits equality, no authenticated 28-way key/IV clock, and no deciphered original passage. The original frozen p50/13 test is negative. Retire it unless a first-party instruction supplies a different state/key selector; do not treat full reencryption or a synthetic control as evidence of actual Cicada encryption. For the larger #1420 task, this candidate does not meet its original-plaintext success criterion.
