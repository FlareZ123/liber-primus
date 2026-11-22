# OpenPuff v4.00 Hide password confirmations: native positive

**Decision, 15 November 2026:** Original OpenPuff v4.00 displays a separate Warning confirmation when optional password C or B is disabled in the native Hide interface. Each warning must be acknowledged with the native Yes button. Assigning an unchecked visual state through Win32 control setters does not establish that the application accepted the optional-password setting. This is now reproduced on the original Windows executable with four independent password-order controls.

## Source-native causal evidence

The original seven-carrier calibration [run 43687940512](https://github.com/FlareZ123/liber-primus/actions/runs/43687940512) successfully loaded all seven synthetic source-size JPEG carriers with cumulative Medium capacities 17,392 / 34,784 / 52,176 / 69,568 / 86,960 / 104,352 / 121,760 bytes. It selected a 113,056-byte payload requiring the seventh carrier but wrote no stego output. Original preserved [GUI artifact 14152190398](https://github.com/FlareZ123/liber-primus/actions/runs/43687940512/artifacts/14152190398) contains the native password meter **Password ( C ) too short** and the after-click modal **Step (1): Invalid passwords!**. The immediate failure is password validation rather than carrier capacity.

The separate short [native-order run 43690806033](https://github.com/FlareZ123/liber-primus/actions/runs/43690806033) exposed the actual modal after a C-disable click:

> Indipendent password (C) ensures a higher security level! Are you sure you want to disable it?

Its native button labels were Yes and No. There is a distinct equivalent warning for B. The prior automation failed to acknowledge these prompts.

## Four-mode native positive

[Original OpenPuff v4.00 Windows run 43691122985](https://github.com/FlareZ123/liber-primus/actions/runs/43691122985) **succeeded**, acknowledging both C and B warnings in each configuration. [Complete artifact 14152472409](https://github.com/FlareZ123/liber-primus/actions/runs/43691122985/artifacts/14152472409) preserves the state matrix and native GUI snapshots.

| Original A input method | A entered relative to disabling B/C | Final B, C | Native password status after Browse |
| --- | --- | --- | --- |
| Win32 set_edit_text | after | 0, 0 | A = B = C |
| Native keystrokes | after | 0, 0 | A = B = C |
| Native keystrokes | before | 0, 0 | A = B = C |
| Win32 set_edit_text | before | 0, 0 | A = B = C |

All four methods are accepted through a real native target-file Browse once the C and B warnings are properly confirmed. Earlier speculation that A must be typed before disabling B/C is therefore unnecessary for this narrow GUI operation. The 20-character synthetic A input is identified by SHA-256 b64ac952939bb5b146ccbcd408113734cda08bfd8e348f729df011c2cfb1eada. Original executable SHA-256: 40c94218a5eecd215226ef8988cb23fe0c5cfbfd4bac8c63aa45be93fb8a1db9.

**Reproducer:** [short native Windows test](../sims/openpuff_v400_hide_password_state_probe.py) and [manual-only workflow](../.github/workflows/openpuff-v400-hide-password-state-probe.yml).

## Next decisive application

The seven-carrier Hide→Unhide positive remains outstanding. Its owner should transfer the verified modal-confirmation code to the existing seven-carrier plant, require both original B/C states to remain off and the password status to be valid after final Browse, then execute one native seven-carrier Hide→Unhide control. Actual extracted bytes, native count, output size and SHA-256 determine whether that larger calibration passed. Only then consider fresh clue-selected extraction on disposable copies of the original LP2 images.

**Scope:** A genuine reproducible GUI-state control result, not recovered LP2 plaintext, a manuscript key, a genuine hidden JPEG payload, or completion of the seven-carrier calibration.
