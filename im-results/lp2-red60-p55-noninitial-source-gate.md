# P53/p54 red60 to p55: fixed noninitial-word correspondence fails

**14 November 2026, Agent23. Classification: a new source-shaped, lossless candidate alignment and an original-input negative. No unknown LP2 plaintext, key, destination or independently selected cipher was recovered.**

## Intended human clue and independent source inputs

The original physical **p53** (archive 70.jpg) ends with precisely **51 red GP29 runes** at local indices 128–178. The following **p54** (archive 71.jpg) begins with **9 red runes** at local indices 0–8, providing 60 red GP29 symbols under one concatenation hypothesis. Both spans have already been source-audited. Their proposed direct 60-symbol *repeating* key and their use as a 60-entry digit dictionary were tested previously with negative results in [red60 direct p55](lp2-p53-54-red60-p55-crib-gate.md) and [red60 p50/p56](lp2-red60-p50-p56key-p55rim-original-gate.md); neither tested this word-position correspondence.

Original p55 (archive 72.jpg) has **76 runes**, with **one rune completing a word carried from p54** and exactly **16 complete printed words** of lengths

\`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]\`.

Hence, removing only the **initial rune of each of the 16 complete words** leaves **76−16=60 rune slots**. The single incoming carry glyph is included in those slots. This is an independently defined alignment by visible page/red intervals and printed word positions, with an exact matching input length. It suggests the red60 tape might encrypt the word interiors while the 16 first runes serve as control initials, page address, or an unrelated channel.

The major rival is **postselected arithmetic**: no printed or signed Cicada instruction requires concatenating red text across p53/p54, excluding p55 word initials, or placing the incoming carry at the start of the key tape. Exact length agreement does not establish the hypothesis. The 2014 Tor-v2 address length of 16 is additional context but supplies no first-rune decoder.

## One frozen reversible attack

Let \`R\` be original \`p53.indices[128:179] || p54.indices[0:9]\` in the visible printed order. Let \`S\` be the ascending 60 local p55 positions after excluding the initial rune of each of the sixteen complete words. Under the historically used GP29 additive convention, decode only these positions:

\[
P[S_j]=(C[S_j]-R_j)\bmod29,\quad j=0,\dots,59.
\]

The 16 unselected initials remain as printed in this first-pass candidate; they could in principle require a separate operation. Crucially, **the 60 decoded positions include every rune after the first in each complete word**, allowing a stronger language test that gives the sixteen initials arbitrary values. The exact forward inverse adds \`R_j\` to each selected plaintext rune, modulo29. This covers every original rune with no dropped symbols, editorial edits, secret phase, or fitted key.

The [self-contained Windows Node22 CommonJS test](../sims/lp2_red60_p55_wordinterior_alignment_sft.cjs) reconstructs all 17 physical word fragments directly from the manuscript transcription, requires full identity with p55's canonical original 76 glyphs, and uses only the original p53/p54 color-locked intervals. It also uses the repository's solved-LP1/p57-calibrated GP English encoder and pinned 29,157-word frequency fixture to test *all possible first-letter replacements* independently of the still-undecoded initials.

## Original result

- Original candidate ciphertext: **76/76 symbols re-encipher exactly**, as any correctly implemented reversible additive candidate should.
- Reconstructed 76-rune candidate has index of coincidence **162/5700 = 0.0284210526**, lower than uniform GP29's approximately 0.0345. Its 60 red-keyed runes alone have **104/3540 = 0.0293785311**.
- Only **5 of 16** complete words can be transformed into *any* of the 29,157 source-native dictionary words by changing their untouched first rune. **All 9 complete words of length at least four fail** this arbitrary-initial-letter completion test, including the word of 13 GP runes. This is an exact lexicon condition on the decoded suffixes and is independent of how a later key might modify those first runes.
- The reconstructed page begins in GP transliteration \`C AEGOA STH XEO SADNGOEB FNGPPWW WG BYCRIADTXUNDAEU ...\`. It does not constitute coherent plaintext.
- A source-shaped positive plant uses **16 actual dictionary words with the exact original p55 word lengths**, plus one carried symbol. The same red60 key produces a synthetic cipher and recovers **all 76/76** GP runes; **16/16** native suffixes pass the exact same arbitrary-initial-letter completion test.

These original-data results reject the **literal printed-order, GP29-subtraction red60 key applied to all noninitial p55 positions, with unchanged word boundaries and native-GP English**. The bound is conditional on the finite English fixture and source-calibrated spelling; atypical proper names, another language, a second transformation on the interiors, or a different independently selected key would be outside its scope. There is no justification for shifting, reversing, permuting or cycling the red tape after this failure.

## Decision

Retire this *distinct* noninitial-word alignment as a direct p55 decipherment. Its source-visible 51+9 versus 76−16 count is worth preserving as a precise clue candidate, with the important caveat that the p54-carried suffix must be included to reach 60. Do not promote its numerical fit to evidence of an intended 2014 decoder until an independent source selects the operation and predicts original plaintext beyond this failed affine gate. The nearest actionable missing element is a first-party rule that determines how the red spans are to be consumed, if they are keys at all.

**Reproduction:** [original-input source and planted-control SFT](../sims/lp2_red60_p55_wordinterior_alignment_sft.cjs), with existing [p53 red ink transcription](../resources/liber-primus/lp2-page53-red-span.json), [full LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [original word separators](../resources/liber-primus/lp2-transcription.txt), and [authentic GP spelling control](../sims/lp2_native_gp_source_orthography_sft.cjs).
