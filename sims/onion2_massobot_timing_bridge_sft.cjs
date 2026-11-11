'use strict';

/**
 * Source-pinned, deterministic 2014 Onion2 MassoBot / BotSottile timing bridge SFT.
 * Run: node sims/onion2_massobot_timing_bridge_sft.cjs
 * Reads historical timing JSON, performs no file writes or network operations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const record = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
  'cicada2014-onion2-timing.json'), 'utf8'));
const bridge = record.bridge_resolution;
const allBytes = record.final_hex.match(/../g);

/** @param {string} clock - HH:mm in the archived IRC witness. @returns {number} */
function minute(clock) {
  const [h, m] = clock.split(':').map(Number);
  return 60 * h + m;
}

assert.equal(record.final_hex.length, 512);
assert.equal(allBytes.length, 256);
assert.equal(record.interval_cells.length, 112);
assert.deepEqual(record.bounded_bridge.variants_k, [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1]]);
assert.deepEqual(bridge.byte_positions, [190, 191]);
assert.deepEqual(bridge.five_minute_units, [2, 4]);
for (const observation of bridge.bot_sottile_snapshots) {
  assert.equal(allBytes[observation.byte_count - 1], observation.final_hex_byte);
  console.log('BotSottile', observation.time, 'length', observation.byte_count,
    'last', observation.final_hex_byte, 'source line', observation.original_archived_line);
}
const watcher = bridge.watcher_events;
const intervals = watcher.slice(1).map((event, i) =>
  minute(event.site_change) - minute(watcher[i].site_change));
assert.deepEqual(watcher.map(e => e.byte_length_inferred), [189, 190, 191, 192]);
assert.deepEqual(watcher.map(e => e.source_line), [1857, 1864, 1876, 1891]);
assert.deepEqual(intervals, [10, 20, 10]);
assert.deepEqual(intervals.slice(0, 2).map(k => k / record.interval_unit_minutes),
  record.bounded_bridge.source_resolved_k);
assert.equal(intervals[0] + intervals[1], record.bounded_bridge.sum_min);
assert.equal(record.bounded_bridge.variants_k.filter(k => k.join(',') ===
  record.bounded_bridge.source_resolved_k.join(',')).length, 1);
assert.equal(minute(bridge.bot_sottile_snapshots[0].time), minute(watcher[0].site_change));
assert.ok(minute(bridge.bot_sottile_snapshots[1].time) > minute(watcher[1].site_change));
assert.ok(minute(bridge.bot_sottile_snapshots[1].time) < minute(watcher[2].site_change));
assert.equal(minute(bridge.bot_sottile_snapshots[2].time), minute(watcher[2].site_change));
assert.equal(minute(bridge.bot_sottile_snapshots[3].time), minute(watcher[3].site_change));
console.log('MassoBot independent watch times', watcher.map(x => x.site_change).join(', '));
console.log('RESOLVED bridge k=', bridge.five_minute_units.join(','),
  'minutes=', intervals[0], intervals[1], 'historical 112-cell input unchanged');
