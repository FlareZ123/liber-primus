// Original p50 32x8 numeric grid: bounded 2014 Unix-second MT19937 gate.
// Build: C++17 or later. Requires only the standard library.
// Reproducer: compile and run this file with no arguments.
// Source: resources/liber-primus/lp2-grid-256.json, bytes[0:8].
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <random>

constexpr std::array<std::uint8_t, 8> original{203,231,167,186,97,237,126,183};
constexpr std::uint32_t first = 1397952000u; // 2014-04-20 00:00:00 UTC
constexpr std::uint32_t last  = 1401580800u; // 2014-06-01 00:00:00 UTC

std::uint8_t emit(std::uint32_t word, unsigned mode) {
  switch (mode) {
    case 0: return static_cast<std::uint8_t>(word);          // low byte
    case 1: return static_cast<std::uint8_t>(word >> 24);    // top byte
    case 2: return static_cast<std::uint8_t>(word >> 1);     // discarded low bit
    case 3: return static_cast<std::uint8_t>(word >> 16);    // middle byte
    default: return static_cast<std::uint8_t>(word >> 23);   // top eight of upper nine
  }
}

unsigned prefix(std::uint32_t seed, unsigned mode,
                const std::array<std::uint8_t, 8>& target) {
  std::mt19937 engine(seed);
  unsigned length = 0;
  while (length < target.size() && emit(engine(), mode) == target[length]) ++length;
  return length;
}

int main() {
  // Independently generate a complete synthetic target and recover its seed.
  std::mt19937 plant(1399766400u); // 2014-05-11 00:00:00 UTC
  std::array<std::uint8_t, 8> fixture{};
  for (auto& byte : fixture) byte = emit(plant(), 1);
  assert(prefix(1399766400u, 1, fixture) == fixture.size());
  unsigned fixture_matches = 0;
  for (std::uint32_t seed = 1399766390u; seed <= 1399766410u; ++seed) {
    fixture_matches += (prefix(seed, 1, fixture) == fixture.size());
  }
  assert(fixture_matches == 1);

  std::uint64_t first3 = 0;
  std::uint64_t first4 = 0;
  std::uint64_t all8 = 0;
  for (std::uint64_t candidate = first; candidate <= last; ++candidate) {
    const auto seed = static_cast<std::uint32_t>(candidate);
    std::mt19937 engine(seed);
    const auto initial_word = engine();
    for (unsigned mode = 0; mode < 5; ++mode) {
      if (emit(initial_word, mode) != original[0]) continue;
      const unsigned n = prefix(seed, mode, original);
      if (n >= 3) {
        ++first3;
        std::cout << "prefix>=3: seed=" << seed << " mode=" << mode
                  << " matching_bytes=" << n << '\n';
      }
      first4 += (n >= 4);
      all8 += (n == 8);
    }
  }
  assert(first3 == 1 && first4 == 0 && all8 == 0);
  std::cout << "PLANT: 8/8 positive; ORIGINAL: " << (last - first + 1u)
            << " UTC-second seeds x 5 byte modes, 3-byte hits=" << first3
            << ", 4-byte hits=" << first4 << ", complete hits=" << all8 << '\n';
}
