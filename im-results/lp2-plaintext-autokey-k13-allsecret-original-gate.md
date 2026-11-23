# Original p0 red-13 plaintext-autokey: exact all-secret exclusion

**Decision (23 November 2026):** The LP2 p0 opening actually prints a thirteen-rune red heading and a thirteen-dot mark. Those are a physically available suggestion of a thirteen-rune key/clock, though **neither proves the cipher is autokey**. I tested the intact original p0–p2 opening and a fully independent p16–p21 region against *every possible unknown thirteen-symbol starting plaintext* for one simple historically available, reversible plaintext-autokey operation. A key-independent equality invariant sharply fails genuine GP29-English controls in both regions. No new LP2 plaintext or key is claimed.

## Exact proposed cipher and the all-secret invariant

With the original GP29 rune indices 0…28 and a section-local continuous clock, suppose for **every** rune after the first thirteen:

\[
C_i \equiv P_i+P_{i-13}\pmod {29}.
\]

The first thirteen positions may be enciphered arbitrarily, and the initial plaintext \(P_0,\ldots,P_{12}\) may be any of \(29^{13}\) values. The proof makes no assumption about them.

For each residue \(r\in\{0,\ldots,12\}\), set \(Q_r=0\) and recursively let \(Q_{r+13m}=C_{r+13m}-Q_{r+13(m-1)}\pmod{29}\) for \(m\geq1\). Then **for every candidate initial plaintext**:

\[
P_{r+13m}=Q_{r+13m}+(-1)^mP_r\pmod{29}.
\]

Therefore, for any two positions with the same \(r\) and the same parity of \(m\), the equality of their recovered plaintext runes is identical to equality of the corresponding \(Q\) runes. Changing any of the 13 secret initial values translates each entire group, preserving its within-group collisions exactly. Summing those collisions and opportunities across the 26 groups gives an **exact key-independent necessary condition** for native English GP29 output. All initial positions \(i<13\) are excluded.

This tests the complete hidden-header plaintext-autokey family with no key search, language-model fitting, source-selected seed, or doublet oracle.

## Original-cipher observations and authentic positive controls

Inputs are the unchanged resources/liber-primus/lp2-corpus.json original 29-rune indices, with p0–p2 concatenated as 729 runes, and p16–p21 concatenated as 1,613 runes. The independent second region was not used to choose thirteen. Native-GP positives preserve actual rune spellings from openly readable original LP1 source transcription sections 3, 8–12 and 14 in resources/transcriptions/lp1_wulfic_canonical.txt, followed by unenciphered solved LP2 p57. The native pool contains exactly **1,322** original GP runes, no Latin-to-GP reconstruction. The 729-rune and 1,322-rune controls are encrypted by the declared recurrence with a nonzero 13-symbol header mask, decrypted with the actual initial plaintext, and reencrypted to the exact original plant. All key-invariant counts are independently recovered with thirty alternative *wrong* header choices.

| Source segment | Runes | Original equal-pair count / opportunities | Original conditional IoC | Genuine GP29 positive count / opportunities | Positive IoC |
|---|---:|---:|---:|---:|---:|
| Original p0–p2 | 729 | 674 / 19,008 | **0.035458754209** | 1,178 / 19,008 | **0.061973905724** |
| Original p16–p21, first 1,322 runes | 1,322 | 2,232 / 64,600 | **0.034551083591** | 3,406 / 64,600 | **0.052724458204** |
| Original p16–p21, complete | 1,613 | 3,292 / 96,868 | **0.033984391130** | Not available at this control length | Not available |

The positive examples were measured after **actual forward plaintext-autokey encryption**, using a known nonzero header key. Source-native plaintext GP group collisions necessarily survive its secret key under this exact rule. Real unknown-page sources instead remain near the uniform-GP collision rate of \(1/29\). The p0 discrepancy is **504 fewer equal-pair events** than the equal-length native source; the independent 1,322-rune discrepancy is **1,174 fewer**. These are empirical contrasts to specified source controls, not universal probability bounds for every imaginable plaintext genre.

## Consequence and next decision

**The thirteen-rune starting secret cannot rescue this specific additive, fixed-lag, original-space-preserving plaintext-autokey mechanism on the unmodified original chapters.** The result is independent of what the first thirteen ciphertext symbols mean and of every proposed secret key. It does **not** exclude feedback involving ciphertext instead of plaintext, a secret time-varying alphabet, changing word/space boundaries, different feedback lags, a source-selected non-GP payload, or a changing key with an additional symbol-dependent state. This is a bounded architecture removal, not a full manuscript solve.

The next high-value task is to find an **original source-authored evolving-state update or actual key-bearing instruction** that can expose at least one complete unknown plaintext passage. Further arbitrary starting-key guessing for the fixed thirteen-lag plaintext-autokey family is mathematically redundant.

**Exact original-input reproducer:** sims/lp2_plaintext_autokey_k13_allsecret_sft.cjs. It reads the canonical source corpus, checks the published original counts, tests 30 alternate hidden seeds per region, and verifies native-GP plant decryption and forward reencryption. There are no derived plaintext claims to authenticate.

**Independent executable environment:** The combined original-source tests completed successfully under **Windows GitHub Actions, Node 22** in [run #45097459572](https://github.com/FlareZ123/liber-primus/actions/runs/45097459572). The workflow runs each complete CommonJS original-source SFT without language-model fitting.
