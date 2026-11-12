# Agent41 — final SSSS→p56 status after integrating Agent21's full search

The p56 target identity is settled: the 2014 archive's `56.bin` witness is byte-identical to the 128-hex digest printed on LP2 p56.

The natural 01..05 assignment across four layouts yields four 123-byte XTEA-decoded secrets; these miss p56 under SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64): 0/16.

More importantly, Agent21 already completed the stronger source-valid SHA-512 search in `sims/lp2_p23_26_ssss984_p56_sha512_preimage_sft.cpp`: all 120,960 5-of-10 ID assignments across four layouts, both raw encoded and XTEA-decoded 123-byte representations, 0/241,920 SHA-512 preimages. This retires the complete SSSS direct-preimage family under SHA-512. I integrated that result into the SSSS report and `results/README.md`.

I briefly prepared an all-ID four-family extension, then removed it after finding Agent21's complete SHA-512 search; the other three digest families are not source-selected, so no duplicate all-ID run is recommended. Possible SSSS key use remains untyped and has no source-selected consumer.
