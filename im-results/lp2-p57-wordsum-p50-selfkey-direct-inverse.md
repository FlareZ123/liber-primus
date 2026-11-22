# p57 word-prime self-key through the original 256-cell table: exact original inverse gate

**Agent49, 15 November 2026. Classification: bounded negative for one executable plaintext-self-indexed word cipher.** The original p0–55 ciphertext remains undeciphered. The candidate cipher is impossible on 1,068 original printed words under the historically used GP29 additive sign, regardless of the unknown words' meaning. An opposite-sign control is impossible on 1,106 words. A simpler direct ciphertext-indexed use of the same source key leaves full-book rune statistics ciphertext-like.

## Source clue and specifically tested route

The **solved p57 PARABLE** instructs us to “shed our own circumferences” and “find the divinity within.” The original pp49–51 numeric grid prints **256 cells** in reading order. Under the already established, provisional conventional base60 reading, its bytes can be addressed by the **one-based, modulo-256 GP-prime sum of a printed word**. The two original p57 words whose interior prime sums match their selected table bytes are:

| Solved source word | Whole prime sum | One-based cell | Printed byte | Strict interior prime sum |
| --- | ---: | ---: | ---: | ---: |
| TUNNELNG | 339 | 83 | 201 | 201 |
| DIUINITY | 376 | 120 | 184 | 184 |

These coincidences and their post-selection limits are documented in [the existing p57 grid investigation](lp2-p57-divinity-p50-primewalk-closed-loop.md). This test asks an executable question that the earlier numerical navigation report does not settle: **could a word select the Caesar shift that encrypted that very word using its plaintext GP-prime sum as the table address?** That provides a complete decryptor to check, with neither invented passwords nor ciphertext-dependent score tuning.

For plaintext GP29 word `P` let `S(P)=sum(GPprime(r))`, `a(P)=(S(P)-1) mod256`, and `k(P)=tableByte[a(P)] mod29`. The primary proposed encryption is the original GP29 additive operation `C[i]=(P[i]+k(P)) mod29` for every rune in the printed word, restarting at each true original word delimiter. Because the key depends on **unknown plaintext**, the inverse enumerates all **29 possible shifts per word**, accepting shift `k` only if the resulting candidate `P=C-k` satisfies `k(P)=k`. The alternate sign `C=P-k(P)` is a historical sign control. The primary selector is the same **one-based** convention that produces p57's 83/120 addresses, avoiding an analyst-shifted table origin. The manuscript has **no first-party instruction** to use its numeric grid as a GP29 additive word key, so this is a clue-framed falsifiable hypothesis, not a claimed intended operation.

## Exact original input and result

Reconstruct the **2,896 complete original printed words / 12,956 runes** across original pp0–55 from `lp2-transcription.txt`, retaining the **32 page-crossing word carries** and treating the rune-free p50 as a numerical source. The rune-by-rune transcription is asserted against `lp2-corpus.json`. Keep all original 256 table entries, the original GP rune indices, each word's physical order, and the p57-confirmed address convention fixed. No key search beyond **all admissible 29 GP29 word shifts** is needed.

| Original-cipher inverse | No possible plaintext/key | Exactly one consistent key | Multiple consistent keys |
| --- | ---: | ---: | ---: |
| `C=P+k(P)` | **1,068 / 2,896** | 1,096 | 732 |
| `C=P-k(P)` | **1,106 / 2,896** | 1,010 | 780 |

For the primary operation, the 2,896 original words have admissible-key counts `0:1068, 1:1096, 2:511, 3:166, 4:44, 5:10, 6:1`. The control sign has `0:1106, 1:1010, 2:536, 3:185, 4:52, 5:6, 6:1`. **A single zero-candidate word is a mathematical contradiction to the whole-word encryption model**, and over a thousand appear under either sign. The failure does not depend on a language model, assumed English or selected plaintext.

The direct ciphertext-address alternative needs no self-consistency equation: it computes `k(C)` and applies `P=C±k(C)` word by word. Its pooled GP29 indices of coincidence are **0.03452053 / 0.03445943**, versus **0.03447840** for the untouched original. The fixed source-key output is illegible; direct indexing offers no plaintext evidence either.

**Native-source positives:** the test takes **all 20 authentic, clear p57 words** and encrypts each under both self-indexed signs using its own actual plaintext GP prime sum. For **every 20/20** plant, exhaustive inverse enumeration includes the true plaintext key and exactly recovers every original p57 rune when the true key is chosen. The original source table/tokens, p57 source checksums and all rune/word invariants are asserted. Successful synthetic reversibility establishes the detector's validity, while the contradictory original word constraints establish the negative.

## Decision

Reject precisely **plain-word GP-prime sum → one-based 256-cell address → original byte modulo29 → uniform Caesar shift over the same original printed word**, for both additive signs. The source-prompting p57 interior equalities remain unchanged; they may act as selective clues rather than a universal cipher law. This result neither refutes alternative grid navigation nor suggests changing the address, phase, sign convention, or word target to rescue the failed mechanism. Those require an independently visible original operation.

[Standalone original-source SFT](../sims/lp2_p57_wordsum_grid_selfkey_original_sft.cjs) · [Passing manual Windows / Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/43658668072). This result is supporting bounded research and does not alter the authoritative unsolved status in `results/README.md`.
