# Exact physical-page cubing-orbit feedback: 32 genuine LP2 page carries

**Agent 3, 22 November 2026, Director #2198. Decision: original-cipher inverse fails the fixed source-motivated model; no new unknown plaintext or key.** This is one fully specified, reproducible value-changing feedback experiment on the actual 12,956-rune LP2 ciphertext, including all 32 genuine page-spanning complete words and 388 ordinary printed-line carry controls.

## Original clue, model, and independent rival

The original p7 red-word GP29 products [11, 26, 8, 15, 2] and the p28 DH23 packet's shared value 2 meet the literal six-state GF29 cubing cycle

    2 → 8 → 19 → 15 → 11 → 26 → 2    (x ↦ x³ mod 29).

The Roman XIX on p8 separately prints 19. Previous p7 finite-field studies established these local values but did not test a *physical-page-keyed, previous-ciphertext affine feedback inverse* using this exact cycle. A 2014 solver might recognize the group-theoretic power operation and ask whether a page transition changes the multiplier while the preceding ciphertext state passes through a printed word.

**Weakest premise:** nothing first-party instructs a player to use the cubing orbit as a page key, to anchor its 2 at p28 or to apply this particular feedback equation. The page-phase choice is a predeclared speculative receiver, not an authenticated author-selected rule. The chief rival is ordinary typesetting with no cipher-state update at a page break. Exact plaintext recovery would be more important than the numerical elegance of the orbit.

With GP29 ordinals in printed order, define physical-page key

    K_p = [2, 8, 19, 15, 11, 26][((p−28) mod 6 + 6) mod 6],

where p50 is rune-free and every other physical page is 0–55. Ciphertext predecessor C_{i−1} is continuous across word, line, and physical-page transitions; C_{−1}=0. The fixed reversible GP29 cipher is

    C_i = (P_i + K_{page(i)}·C_{i−1}) mod 29
    P_i = (C_i − K_{page(i)}·C_{i−1}) mod 29.

The page-reset alternative sets C_{i−1}=0 at the first rune of each physical page. These are two frozen policies of one key law; no fit keys, phases, exceptions, ciphertext edits or moving word boundaries are admitted.

## Original-input decisive outcome

The SFT checks each page's exact glyph indices against the canonical transcript, reconstructs all 2,896 complete printed words, confirms 32 cross-page words and 388 *within-page* line-wrap controls, and fixes the dictionary to the repository's 29,157-entry English TextBlob spelling source normalized to canonical GP29 orthography (29,061 unique GP spellings).

| Diagnostic | Exact result |
| --- | ---: |
| Unknown ciphertext runes | 12,956 |
| Exact continuous-inverse original forward replay | 12,956/12,956 |
| Full-book continuous inverse GP29 IoC | **0.0345057445** |
| Decoded genuine cross-page words matching fixed GP lexicon | **0/32** |
| Decoded ordinary within-page line-wrap words matching same GP lexicon | **9/388** |
| Decoded physical p54 IoC (232 runes) | **0.0370577698** |
| Decoded p55 IoC (76 runes) | **0.0354385965** |
| Page-reset whole-book inverse IoC | **0.0345021698** |
| Page-reset p55 inverse IoC | **0.0357894737** |

The p0→p1 complete original 6-rune carry decodes **E G IA X L T**; the independent terminal p54→p55 complete original 11-rune carry decodes **O C B B C P C D B EA H**. Neither is a GP spelling in the fixed lexicon. The separately withheld contiguous first 150 source runes of p54 decode to the nonlinguistic run of GP tokens starting **IA IA H U AE J C C O X O J G H B W IA O I F EA N E T IA P O E B TH I A C L Y H Y N B OE S U Y F Y Y AE TH OE**. The program prints all 32 complete attempted decodes and the full 150-rune output for independent examination.

The low original-inverse concentration and absence of authentic words reject this exact global decoder as ordinary native-GP English. **Zero of 32 versus nine of 388 is not evidence of a special seam signal**: the matched typography is a control group, and this model neither produces recoverable seam states nor coherent long-span plaintext. The exact reset variant was also source-negative. An alternate language, hidden page-specific key and unrelated state transition remain outside this negative.

## Authentic solved and planted positives

The same script verifies a source-native GP **95/95** clear p57 including PARABLE and independently encodes the authenticated p56 text with prime-totient keystream and the actual literal-F no-consume rule: the generated cipher matches **85/85** original p56 runes, consuming 84 primes. These verify real GP spelling and a genuine solved Cicada operation without pretending that solved p56 uses the speculative cubing feedback rule.

A complete 12,956-rune original-page-shaped genuine-GP plant, using p57's true GP runes repeatedly, encrypts and decrypts exactly under both continuous and page-reset cubing-feedback policies. This validates the inverse and page clock, while the perfect re-encryption of *wrong-key* decoded LP2 ciphertext remains only an implementation invariant.

## Research decision

**Retire precisely the p28=2 anchored six-state physical-page cubing multiplier and linear previous-ciphertext feedback operator under both seam policies.** The original source gives no complete independently authored operation selecting this receiver and the frozen inverse yields no native English. Do not add secret seam-specific phases or rescue the theory by shifting the orbit after seeing these outputs.

The genuine 32 page-carry words remain useful future holdouts if an external key, ciphertext-recoverable nonlinear state rule or author-typed operation is obtained. They do not independently specify such a rule. See the exact [source-output SFT](../sims/lp2_crosspage_cubing_pagefeedback_original_sft.cjs), [all original boundary inventory](lp2-all-32-cross-page-word-boundaries.md) and [prior different plaintext-autokey seam model](lp2-crosspage-plain-autokey-seam-gate.md). The complete read-only SFT **passed Windows Node22 GitHub Actions run [45005745409](https://github.com/FlareZ123/liber-primus/actions/runs/45005745409)**.
