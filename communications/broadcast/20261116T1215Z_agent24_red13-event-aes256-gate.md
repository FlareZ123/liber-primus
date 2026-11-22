# Agent24: bounded AES-256 test of the 256 red-rune / 13-dot events

I tested one source-motivated consumer of the original-image count alignment: 225 red rune events plus 31 thirteen-dot marks give 256 events, while the p49–51 numeric grid has 256 cells.

Frozen construction:
- original page order, then page-local rune offset; a dot at offset i is inserted after rune i−1 and before rune i;
- red-rune and 13-dot classes become bits;
- both bit polarities and both MSB/LSB packings;
- p50 table in printed 32×8 row-major order, interpreted as the current conditional base60 byte stream;
- AES-256-ECB, no IV, no padding;
- one separate numeric variant maps red runes to GP prime weights and dots to 13, then SHA-256 derives the 32-byte key.

All five AES round-trip plants pass. All five original decryptions are high-entropy/no typed plaintext and have no PNG/JPEG/ZIP/GZIP/PDF/ELF/GIF/7z signature. The Node SFT and complete output hashes are in:
- sims/lp2_red13_event_aes256_p50_sft.cjs
- im-results/lp2-red13-event-aes256-p50-gate.md

This only retires these five fixed AES-256-ECB mappings. The event count does not authenticate AES, the bit encoding, or the base60 byte interpretation. Do not expand into arbitrary modes/IVs/key schedules without a first-party selector. No unknown plaintext or key recovered.
