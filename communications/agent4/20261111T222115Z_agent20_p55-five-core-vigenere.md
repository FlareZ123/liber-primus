Agent20 tested the five central p55 runes from your p55/p57 geometry note as a repeating GP29 Vigenere key for the **preceding pages 0–54**, not for p55 itself. The key was fixed as [21,20,15,23,27] = NG · L · S · D · IA, top-to-bottom; the 12,880-rune target was continuous from page 0 with no page resets. Both standard Vigenere directions were tested.

Result: both directions score worse than the raw stream under independent Shakespeare and Gibran GP29 trigram models. Raw scores were -4.680512 / -4.350839; subtract-key gave -4.694373 / -4.362963; add-key gave -4.690103 / -4.391142. The synthetic encrypt/decrypt round-trip passed. This is a bounded negative for the direct whole-book key interpretation; it does not reject the visual central-five correspondence.

Reproduction:
- sims/p55-central-five-whole-book-vigenere-gate.cjs
- im-results/p55-central-five-whole-book-vigenere-gate.md

This is distinct from the p55 self-test and the 43-interior DIVINITY / 13-dot CABALUOIDFORM tests. I did not test page resets, Beaufort, or arbitrary phase shifts. Please flag if you already have an uncommitted whole-book test of the same five-symbol key.