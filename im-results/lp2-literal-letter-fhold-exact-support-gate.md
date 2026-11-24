# Exact support-key recovery: chart literal-letter register and period-8 F holds

Director #2528. Tested 2026-11-24 by Agent5.

## Frozen model

Take the 22 GP symbols with exactly one Latin letter in the canonical chart transcription: F U O R C G W H N I J P X S T B E M L D A Y. This is an alternative spelling register (not a claim that LP2 uses it). Exclude the seven multi-letter signs TH EO NG OE AE IA EA from plaintext only. Ciphertext uses all 29 symbols. Expand solved native spellings into their chart letters for the synthetic control, preserving their actual orthographic choices. The key has eight arbitrary GP shifts; ordinary symbols consume one shift, plaintext F (index 0) emits ciphertext F and consumes none. Ordinary encryption may also emit ciphertext F. No printed-group constraints, frequency bounds or crib are used to infer keys. The starting phase is absorbed into the ordered key.

## Exact method

A state is the current phase and eight 29-bit sets of still-permitted shifts. For ciphertext value c, the consuming transition intersects the current shift set with {c-p mod 29 : p in the 21 ordinary literal-letter symbols}, then advances phase. If c=0, also allow a non-consuming transition that changes neither phase nor key sets. Delete any state with an empty set; merge identical states. Each surviving state denotes the Cartesian product of its sets, all of whose keys satisfy at least one full legal path. Inductively this represents every possible key and pause path; no beam, scoring or search cutoff is used.

## Constructive control and original result

The control encrypts 3,163 chart-expanded letters from the nine solved GP sections under the hidden synthetic key [17,2,28,9,12,25,6,14]. The key-recovery function receives only the first 2,500 ciphertext values and the chart inventory, not that key or the source letters. Peak six states, two terminal states differing only in phase (3 or 4). Both encode the same unique key, exactly the generating key. With this key fixed and both phases allowed, a literal-letter trigram decoder trained separately on Gibran's Prophet selects the remaining 663 letters: 663/663 correct. Every consuming or hold transition implements the forward encoder.

Freeze original LP2 p0–p2, 729 runes, phase zero at p0. Peak 24 states; two states remain after rune 84 (one-based), zero after rune 85. The remainder is not needed: no period-eight key can decrypt even the original 85-rune prefix into this chart-defined register under the stated exact F-hold clock. This is an all-key support contradiction, independent of the word spacing, frequency and language score. No plaintext or key for LP2 is claimed.

The model excludes only this register and continuous period-8 law; it neither asserts this is an attested LP2 register nor excludes native digraphs, other periods, clock resets or other ciphers.

Reproduce: `node sims/lp2_literal_letter_fhold_exact_support_sft.cjs`. Executed the algorithm on the actual canonical input files using JS in this invocation; no CI claim.
