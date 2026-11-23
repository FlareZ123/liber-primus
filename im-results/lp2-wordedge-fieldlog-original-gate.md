# Word-edge field-log inverse on original LP2 interiors

## Decision and present status (23 November 2026)

**No unknown-page plaintext or original key is recovered.** An exact source-motivated, reversible word-local GP29 field cipher was evaluated on the complete unknown physical LP2 manuscript. Every one of 72 frozen public-edge variants leaves the decoded word interiors approximately uniform. This is a bounded negative for this *particular direct decoder*, not a no-go theorem for general nonrepeat coding, different alphabets, movable spaces, high-entropy keying, or longer state.

The only upstream semantic clue is the genuinely solved LP2 p57 instruction **WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE**. A literal word-level reading would expose each printed word's first and last runes and treat its interior as a payload. Solved LP1 p05 explicitly mentions **primes** and the **totient function**. These motivate a source-visible key family, although no first-party source specifically selects the field-log operation or a primitive root.

## Frozen reversible interpretation

Parse all 2,896 complete words from original `resources/liber-primus/lp2-transcription.txt`, retaining the 32 genuine cross-page words. Join pages only at their physical continuation, preserve the printed word separators, and compare the full 12,956-rune tape against `resources/liber-primus/lp2-corpus.json`.

Write each complete ciphertext word as `C[0] ... C[L-1]`. Its literal public shell `(f,l)=(C[0],C[L-1])` is unchanged and supplies the same key `k mod 28` for all interior indices `j=1..L-2`. For `d_j=(C[j]-C[j-1]) mod 29`, set `P[j]=EA` (GP29 index28) if `d_j=0`; otherwise set `P[j]=(log_g(d_j)-k) mod28`. Encode by `d_j=0` for GP-EA, else `d_j=g^(P[j]+k) mod29`; accumulate from the transmitted first rune and append the transmitted last rune. The last rune is a literal shell component, so it need not satisfy the feedback equation. There is no loss of information.

Enumerate all twelve primitive roots `g=2,3,8,10,11,14,15,18,19,21,26,27` and six independently specified public key laws: first rune, last rune, their sum, their difference, sum of corresponding Gematria prime values, sum of corresponding totients. All key values are reduced mod28. The two last laws differ by a constant two and therefore produce the same aggregate IoC; retaining both makes the source-choice ambiguity explicit. No language-dependent fitting or key search takes place.

## Exact original-input outcome

- 12,956 original physical p0–p55 runes, 2,896 complete printed words, **7,247 interior runes**.
- All 72 decoders re-encrypt all original ciphertext words byte-for-byte at the rune-index level. A separate genuine solved p57 95-rune GP29 passage is planted into 95 interior slots, then recovered and re-encoded by every decoder.
- The **highest** original interior IoC is **0.03539618419202921** at generator15 with primeSum or totientSum; next is 0.03539313725561142 at generator15 with the last-rune law. Both are near the uniform-GP29 benchmark of 1/29. There are exactly **44** zero-difference interior events, which this model treats as reserved EA. No candidate supplies a connected, recognizable genuine unknown-page plaintext.
- The untouched physical p16–21 and p40–53 windows are also decoded by the same globally frozen word-edge laws. The executable SFT prints their exact scores rather than choosing separate per-window keys.

**Interpretation.** A shell-derived field-unit log is a complete reversible code and accommodates zero differences, but the original decoded distribution does not resemble the ordinary source-native GP prose in solved pages. This result removes a small human-plausible direct route, while the parent idea of externally keyed no-repeat coding remains completely open. Do not enlarge this into arbitrary per-word key searches without an independently visible new operand.

## Reproduction

[Single-file CommonJS original-source SFT](../sims/lp2_wordedge_fieldlog_original_sft.cjs) reads the two repository source files directly under Node.js 22, performs its own original-versus-corpus and count assertions, applies every original decoder, verifies exact full-word replay, and plants/replays the 95 genuine solved p57 runes. It prints the extrema and two disjoint original scopes without downloading external corpora or changing any source file.
