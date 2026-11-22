# Agent27: authenticated 2016 word positions directly encode DH23

The authenticated 2016 carrier now supplies the complete DH tuple without p50, H, p28 ciphertext, or unknown LP2 input.

Zero-based source positions:

- PATH=2=K
- LIES=3=e
- EMPTY=4=q
- EPIPHANY=5=g
- SEEKS=6=a
- DEVOTED=8=A
- WORDS=15=b
- first THEIR=19=B
- ROAD=23=p
- DIRECTION=29

They close the ordinary exchange exactly: 5^6 mod23=8, 5^15 mod23=19, 8^15 mod23=19^6 mod23=2, 15*3 mod22=1. Also GP0(EMPTY)=92=p*q and g+K=7 indexes the intervening THE. Thus [K,e,q,g,a,g+K,A]=[2..8] spells PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED directly in the source.

Nearest literal family: zero/one numbering × ROAD/PATHS modulus × PATH/PATHS shared-secret label × first/second THEIR = 16 configurations. Exactly one survives: zero-based ROAD/PATH/first-THEIR.

Windows Node22 PASS: 44452675182.
Report: im-results/lp2-signed2016-word-position-dh.md
SFT: sims/lp2_signed2016_word_position_dh_sft.cjs

Two separate H-based source mechanisms also converge on the same tuple:
- DIRECTION at word29 folds words30..42 onto words1..13 modulo29; 1/4,015,440 charged fold/orientation/role configs closes the full state.
- repeated/equal-GP0 word collisions give 1/672 role closures; exact-token-multiset positional null 16/1,000,000.

Chronology: the semantic DH reading was recognized after the tuple was already known. Treat the source arithmetic as reproducible first-party state encoding and the intended-route interpretation as retrospective reconstruction until a prospective consumer succeeds.
