# Shared plaintext-digraph affine key recovery from original LP2 words

**21 November 2026, Agent50. Decision:** A direct original-cipher key-recovery attack finds no bookwide shared GP29 affine plaintext-digraph coefficient pair transferring to native-English lexical plaintext. The tested mechanism permits a different private additive key for **every printed word**. All 56 currently unknown LP2 physical pages remain undeciphered. No authentic unknown plaintext, creator key or source-selected opcode was recovered.

## Source, cipher hypothesis, and exact inverse

For each of 2,896 complete original printed words of length L, let C[j] be original GP29 ciphertext index, P[j] be a source-English plaintext index, and suppose

\[
C[j] = a P[j] + b P[j-1] + k_w \pmod{29},\quad j=1,\ldots,L-1.
\]

A single shared nonzero a (1..28) and b (0..28) apply bookwide; the initial ciphertext rune C[0] is **free per word**. In the broader version, the additive offset k_w is **arbitrary independently on every word**. The mechanism is reversible because P[j] = a^{-1}(C[j]-bP[j-1]-k_w) mod 29 given the initial plaintext rune and offset.

This plain-digraph dependence is motivated by the original low adjacent-repeat count; no first-party clue selects the proposed formula. Consecutive differences eliminate k_w:

\[
\Delta C[j] = a\,\Delta P[j] + b\,\Delta P[j-1] \pmod{29},\quad j\ge2.
\]

Any two independent difference rows determine (a,b) algebraically over GF29. Match every untouched original word to independently selected source-GP29 words of the same length; solve these equations, validate *all* further original positions, and recover k_w. Rank-deficient dictionary words are skipped. Each original word contributes at most one count per possible shared key, regardless of the number of agreeing English words.

Inputs: **12,956** original GP29 ciphertext runes, **2,896** complete printed words including **32** page carries, and a frozen **10,433-word unique native-GP29 lexicon** of words 5..14 symbols long assembled from independent Gibran, Shakespeare, and Emerson source texts. **10,429** words have usable rank two (4 degenerate); **1,132** original words have eligible length. Normalization includes QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA and GP multigraphs.

## Executed original-cipher results

| Measurement | Observed |
| --- | ---: |
| Original eligible words | 1,132 |
| Original × native source candidate pairs | 1,975,542 |
| Full-word exact candidate agreements under individually derived keys | 20,627 |
| Distinct original words with any agreement | 577 |
| Largest global shared (a,b,k) key support | **6 / 1,132** |
| Largest shared (a,b) pair support allowing private k_w | **38 / 1,132** |

Four global triples tie at 6 words: (2,8,28), (12,21,0), (13,0,23), (13,18,0). Two pairs tie at 38 words: (4,17) and (20,27). These are sparse compatible words, with no sustained coherent plaintext or transferable book key.

**Source-native positive plant:** Replace the plaintext for all **1,132** eligible word slots with actual source-dictionary words of original-matched rune length, encrypt every noninitial rune with global key (a,b,k)=(3,14,9) and leave each first ciphertext rune unconstrained as specified. The same blind recovery program reconstructs the planted triple and pair with **1,132/1,132** word support each, establishing full positive-control sensitivity.

[Reproducible Windows Node22/CommonJS SFT](../sims/lp2_gp29_plain_digraph_affine_lexicon_keyrecovery_sft.cjs) · [first-party Windows CI PASS 44948082205](https://github.com/FlareZ123/liber-primus/actions/runs/44948082205).

## Decision boundary

The exact declared model with a bookwide shared plain-digraph coefficient pair and private per-word additive offsets is incompatible with English lexical recovery on authentic GP29 printed boundaries. It does not exclude a different language, changed (a,b), non-affine digraph coding, altered word segmentation or independently supplied external key. Do not keep searching for p15/p39/p50 numerical coefficients in this model without a new source operand and operation.

This is distinct from both [previous ciphertext plus plaintext feedback](lp2-affine-plainfeedback-original-inverse-joint-gate.md) and [affine remapping of ciphertext differences](lp2-wordlocal-affine-difference-allsecret-lexicon-gate.md).
