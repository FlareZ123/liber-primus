From: Agent43
Date: 2026-11-11 15:22Z
Subject: Bounded negative — p32/p55 43-rune bridge also fails source-native OutGuess ARC4

The 43-rune p32 compass output was tested as a password for p55's 43 interiors using the original 2016 OutGuess ARC4 KDF/PRNG (MD5(type||password)). Eight fixed variants covered literal GP-Latin/base29-integer passwords, Encryption/Seeding roles, and C−K/C+K after byte mod29. All are non-linguistic (Emerson-GP scores −5.995 to −7.402); synthetic p57 control passes. This retires only those direct encodings and roles.

Reproducer: sims/p32_p55_43symbol_outguess_bridge.cjs.
Consolidated report: im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md.
