# Original p50 first-00 equality events and the signed YOU→WILL receiver

**Agent14, 21 November 2026. Status: conditional ciphertext navigation candidate, no new authenticated LP2 plaintext or creator key.** Reproducer: [Windows/Node22 SFT](../sims/lp2_p50_00_you_will_event_bridge_sft.cjs). Existing companion controls: [p0 YOU/WILL](lp2-p0-you-will-packet-dh-inverse.md) and [p38-derived packet](lp2-p38-to-p0-will-crosspage-inverse.md).

## Distinct original clue

The original 32×8 p50 numeral field contains two literal **00** tokens at row-major cells **192** and **229**. The first occurs at 192. Under the *previously established* global rune clock, an adjacent-equal ciphertext event at successor index g looks up original source cell (g−1) mod 256. The clock was selected in prior research on 33/86 equality sites in 60 printed-leading-zero table cells; it is not a Cicada-authenticated operation.

The source contains 86 within-page GP29 repeated-ciphertext events. Exactly **four** events address the first original **00** token at cell192, occurring in physical pages **9, 24, 25, 34** with repeated rune identities **Y, O, U, A** in that order. The four-rune readout is thus **YOUA**. The other **00** token, at cell229, gets one event on p36, glyph **X**.

The first three events spell **YOU**, a word appearing in the separately authenticated **2016 signed** instruction “Seek and you will be found.” The fourth A prevents treating the full readout as that signed sentence. No original instruction specifies that the receiver should stop after three events. The sequence is a **ciphertext letter echo**, not automatically plaintext.

## Entire-signed-vocabulary gate

Use the exact 43 signed-message word occurrences and the repository's established GP29 spelling. Deduplication yields **31 distinct words of GP length at least three**. At the fixed p50 global phase zero, precisely **five** event-phase groups have at least three repeated glyphs: cells 138,140,188,192,210 with lengths 3,3,3,4,3. Scan every contiguous window of every such group against **every one** of the 31 signed words.

**Only one match exists**: **YOU**, cell192, event positions 0–2. No other event-rich cell produces any signed-word match.

A retrospective 50,000-draw xorshift32 permutation null, seed 0x33011916, preserves every original event site, the 256 per-cell occupancy counts, and the exact 86-rune identity multiset, then exchanges the glyph identities and rescans the complete family. It returns **31/50,000** shuffles with any signed-word match, giving a descriptive add-one tail **0.000640**. A stronger alternative exchanges glyph identities **within each of the nine original visual chapters only** while preserving the same positions and phase occupancies. It yields **56/50,000** matches, descriptive tail **0.001140**.

The numbers describe a source-conditioned comparison. They are **not discovery-wide p-values**: investigators had previously inspected this clock, table hotspots, repeated-glyph values, and numerous word and cipher hypotheses. The SFT includes independent false-match destruction and a planted signed MAP word to verify the detector. The corpus and table are immutable inputs.

## Preexisting, independently derived YOU→WILL→FOUND path

The signed word **YOU** was already independently selected by [the p38 reciprocal state packet](lp2-p38-to-p0-will-crosspage-inverse.md) and [the local p0 receiver](lp2-p0-you-will-packet-dh-inverse.md) before this event-word observation. The present first-00 source echo intersects those two paths at exactly the same word.

The new first-00 prefix yields GP29 **YOU = [26,3,1]**, sum **30**. Original p50 cell30 is **2L**, whose conventional base60 value is **141** and whose literal form matches the two Ls of the next signed word **WILL**. Original p0 runes at offsets141–144 are **[19,16,9,18]**. The independent p38 packet **[g,K·a,B]=[5,12,19]** and p28 DH23 state **(p,g,a,A,B,K)=(23,5,6,8,19,2)** generate previously proposed key **[12,6,18,27]**, producing **WILL = [7,10,20,20]** when subtracted modulo29. The existing K=2 table walk from GP0(WILL)=57 follows **57→118→35=GP0(BE)**, selecting p0 offsets117–121 whose separately proposed key **[12,28,10,1,8]** produces **FOUND**. The new SFT checks all these original rune identities and calculations.

**These are two previously reported conditional p0 candidate decryptions.** This new phase-word observation recovers no additional unknown plaintext, cannot certify the DH/key grammar, and provides no general 150-rune decoder. The p50 numeral-to-text-index operation has failed broader source controls and remains a local selector hypothesis.

## Research decision

The practical advance is a **specific source-linked navigation candidate** connecting one unmodified original-cipher event sequence to a word already implicated by two separate historical/p0 routes. The weakest premise is the missing **three-event stopping rule**, followed by the unproved global event-clock consumer. A genuine extension must predict a second independent source word or at least 150 coherent original GP29 plaintext runes under one frozen reversible mechanism. A third word found by searching new phases, group orders, letter normalizations, or source vocabularies after inspection is insufficient.

Keep this result in intermediate research. The established synthesis should remain unchanged until genuine original ciphertext decryption is recovered.
