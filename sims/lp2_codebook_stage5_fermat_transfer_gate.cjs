'use strict';

// Bounded literal-transfer test for the 1999 Code Book Cipher Challenge Stage 5.
// The historical key text and recovered output are taken from Almgren et al.'s
// published winning-team report; the LP2 numeric operand is transcribed from
// the original LP2 p15 image (archive index 32.jpg).

const assert = require('node:assert/strict');

const fermatLatin = `Cubem autem in duos cubos, aut quadratoquadratum in duos quadratoquadratos, et generaliter nullam in infinitum ultra quadratum potestatem in duos eiusdem nominis fas est dividere. Cuius rei demonstrationem mirabilem sane detexi hanc marginis exiguitas non careret.`;
const fermatLetters = fermatLatin.toUpperCase().replace(/[^A-Z]/g, '');
const reportedStage5Output = 'PLAIFAIRCIPHERESELPROXIMONIVELLAPALABRASECRETAESILLIAD';
const p15PrintedNumbers = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820,
];

assert.equal(fermatLetters.length, 225, 'the winning report’s Fermat text should normalize to 225 letters');
assert.equal(reportedStage5Output.length, 54, 'the winning report’s extracted Stage 5 string should contain 54 letters');

const outOfRange = p15PrintedNumbers.filter(n => n < 1 || n > fermatLetters.length);
const directReads = p15PrintedNumbers.map(n => (n >= 1 && n <= fermatLetters.length) ? fermatLetters[n - 1] : null);
const reverseReads = p15PrintedNumbers.map(n => {
  const fromEnd = fermatLetters.length - n + 1;
  return (fromEnd >= 1 && fromEnd <= fermatLetters.length) ? fermatLetters[fromEnd - 1] : null;
});
const validPositiveOffsets = Array.from(
  { length: Math.max(0, fermatLetters.length - Math.max(...p15PrintedNumbers) + 1) },
  (_, i) => i
);

assert.equal(p15PrintedNumbers.length, 16);
assert.equal(outOfRange.length, 16, 'all printed p15 values should be out of range for direct letter addressing');
assert.ok(p15PrintedNumbers.every(n => n > fermatLetters.length));
assert.ok(directReads.every(x => x === null));
assert.ok(reverseReads.every(x => x === null));
assert.equal(validPositiveOffsets.length, 0, 'no nonnegative text offset can bring the largest p15 index into a 225-letter source');

const result = {
  historical_reference: {
    normalized_fermat_letter_count: fermatLetters.length,
    reported_stage5_output_length: reportedStage5Output.length,
    reported_stage5_output: reportedStage5Output,
    historical_ciphertext_index_range_reported: [3, 215],
  },
  lp2_operand: {
    page: 'LP2 p15',
    original_image: 'resources/liber-primus/32.jpg',
    printed_values: p15PrintedNumbers,
    direct_one_based_letter_addressing: {
      valid: p15PrintedNumbers.length - outOfRange.length,
      out_of_range: outOfRange.length,
      minimum: Math.min(...p15PrintedNumbers),
      maximum: Math.max(...p15PrintedNumbers),
      decoded: directReads,
      reverse_counting_valid: reverseReads.filter(x => x !== null).length,
      nonnegative_text_offsets_available: validPositiveOffsets.length,
      operand_count_vs_historical_stage5: { p15_values: p15PrintedNumbers.length, stage5_indices: 54 },
    },
  },
  decision: 'No literal Stage-5-style direct character-address transfer from the p15 printed grid to the 225-letter Fermat note. No modulo, offset, subtraction from 3299, or other recoding is tested because LP2 supplies no selector for one.',
};

console.log(JSON.stringify(result, null, 2));
