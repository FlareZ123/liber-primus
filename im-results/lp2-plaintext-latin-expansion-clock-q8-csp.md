# Plaintext Latin-expansion GP29 key clock: exact q8 inverse

**Director #2538 · Agent2 · 24 November 2026. Decision:** a genuinely plaintext-dependent Latin expansion clock is identifiable on an authentic native-GP planted control, including the transparent-F ambiguity. The exact continuous q8 model has no valid shared key for the first three words of original p54–55, even with an arbitrary opening singleton. No unknown LP2 plaintext or authentic key recovered.

## Frozen cipher and clock

The canonical GP chart uses the principal readings F,U,TH,O,R,C,G,W,H,N,I,J,EO,P,X,S,T,B,E,M,L,NG,OE,D,A,AE,Y,IA,EA. Choose the first/main transliteration in the repository's source-aligned GP chart. NG has length 2, even when contextually read ING; no per-word alternate readings or fitted advance values. The seven two-character labels are TH, EO, NG, OE, AE, IA, EA; all remaining ordinary labels advance one. This clock is a defined candidate, not an independently authenticated LP2 operation.

For consuming phase t in Z/8:
- If plaintext p=0 (Fehu), c=0 and t'=t. This is the authentic LP1 transparent-F convention.
- Otherwise c=(p+k[t]) mod29 and t'=(t+length(primary(p))) mod8.
- Ciphertext F can also come from a nonzero p under the consuming branch. A fixed key can therefore have multiple inverses; keep the alternatives until lexical constraints disambiguate them.

The period 8 is selected from the authentic LP1 WELCOME key DIUINITY, not inferred from original page scores. One continuous phase from the chapter start, no resets or period sweeps. Ciphertext and plaintext both remain GP29 rune tapes; this is distinct from pre-rune Latin-letter ciphers tested in #1347/#2284.

## Exact solver

Use the pinned 29,058-word TextBlob word-frequency source and existing native-GP transliteration conventions (all GP digraph segmentation variants; QU→CW, V→U, K/Q→C, Z→S, and native ING→NG). Include the canonical solved-native words, plus A/I/O; resulting vocabulary 38,920 unique rune sequences, indexed by word length and a trie. Each state contains phase, all eight key values (unknown allowed), and a representative plaintext backtrace with path multiplicity clipped to two. At an unknown key phase, every lexically admissible non-F plaintext symbol determines a candidate key residue exactly. Repeated phases must agree; at ciphertext F, test the non-consuming and ordinary consuming branches. Merge identical future states, retaining ambiguity. No language scores, key guesses or heuristic pruning. An explicitly reported five-million-node cap is a resource limit, never an impossibility result.

## Authentic solved-native planted recovery

An initial plant on the first words of native Koan1 hit the five-million-node cap at the fourth word for both clocks; no conclusion was drawn. A layout-only control selection takes the first suffix of this same section beginning with consecutive words of length at least eight and six and with at least 250 runes remaining. That starts at zero-based word 135 (lengths 9,7), with 292 runes remaining. Encrypt that authentic text with the frozen expansion clock and an eight-residue hidden plant key [23,10,1,10,9,10,16,26]. Key recovery receives only 37 words/151 encrypted runes and the dictionary. The actual solved-native words are included in the lexicon, so this is a calibration plant, not an independent ciphertext-only discovery.

| Attack on expansion-clock plant | First word states | Second word states | Final outcome |
|---|---:|---:|---|
| Correct expansion clock |155|1|Unique key through all 37 training words|
| Ordinary one-rune clock, same F hold |168|1|Zero states at word 6|

Correct solver uses 18,209 trie nodes. Freeze the recovered key and continue with the remaining ciphertext, which contains 36 words/141 runes. Exact continuation retains one complete plaintext path, **292/292 original native runes correct**, including the entire 141-rune holdout. Re-encryption matches all planted ciphertext. This distinguishes the two phase mechanisms under the declared plant, rather than merely showing a round-trip.

## Original chapter p54–55

Choose the shortest whole unknown chapter (308 runes, 66 words) independently of ciphertext values. Freeze the first 34 complete words / 151 runes as training and the remaining 157 runes as withheld. The original canonical rune parse is asserted against the repository's physical-page corpus. The opening word lengths are 1,8,8.

| Original solver | After word 1 | After word 2 | After word 3 | Exact nodes |
|---|---:|---:|---:|---:|
| Native lexicon |7|264|0|107,159|
| Every GP29 opening singleton allowed |28|3,621|0|461,113|

The relaxed singleton case tries every plaintext GP value (Fehu cannot emit a nonzero ciphertext, so only 28 legal states survive the first rune). Both runs terminate naturally, without hitting the cap. No candidate key survives the first 17 runes, hence no held-out decode was attempted. The negative depends on the two eight-rune words being members of the declared lexicon, original word boundaries being preserved, q8, the specific chart expansions and a continuous clock starting at the chapter beginning. It does not exclude other periods, unknown vocabulary, a different clock or a separately justified reset.

[Executable CommonJS reproducer](../sims/lp2_plain_latin_expansion_clock_q8_csp.cjs), final commit `4c8df2624f5b29bb7de96ce01602b30cfb54b6f7`. Executed final source directly in the invocation JavaScript runtime with repository data supplied through a read-only filesystem shim; all assertions passed. No CI run claimed.

## Research decision

Retire this precise q8 continuous expansion-clock model for the p54–55 opening under the finite native register. Preserve the reusable solver for a new source-selected period or expansion convention. An ordinary key-position search cannot replace it, because plaintext symbol length changes the future key phase. Do not rescue the failed original hypothesis by post-selecting a new chapter/reset or trying arbitrary lengths; a new source clue is required.
