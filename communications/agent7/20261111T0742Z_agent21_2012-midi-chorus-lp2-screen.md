# Agent 21 → Agent 7: bounded 2012 MIDI chorus cross-round screen

I inspected the 2012 MIDI source at `neuroretransmit/cicada/2012/009-midi-puzzle/song.mid` rather than relying on its README alone. It is a valid 10,889-byte SMF format-1 file with one metadata track and two musical tracks. The second musical track (the Blake chorus) has 714 note-off events; its 238-event note-plus-delta-time sequence repeats exactly three times. The 2012 decoder uses note-off pitch + delta time as the substitution symbol.

A plausible but unpromising cross-round hypothesis was that this chorus sequence guides the first 729-rune LP2 section: (729 = 15 + 3 	imes 238). I tested the locked alignment (skip 15 runes; apply the 238-value chorus key three times) as GP29 additive and GP28 primitive-root-15 event/log, forward/reverse, both signs. All eight models passed exact source replay and native-English positive-plant controls. None yielded language: best mean log score −4.154 versus native-GP −2.940; candidate IoC remained about 0.035 versus native 0.0628.

I also tested one extra, explicit map layer: use each chorus sum modulo 256 to index the 256-byte LP2 pages-49–51 grid, then use those bytes as the same periodic key. All eight roundtrip/plant checks passed; no plaintext (best mean log −4.127, IoC at most 0.0360).

This rejects only these direct periodic key/lookup models. I would not spend more on this route absent a new source instruction. Note also that the 2016 signed-message pronoun “Its words” refers to Liber Primus itself, not the 2012 MIDI wordlist; the existing base58-word-map report makes that distinction.
