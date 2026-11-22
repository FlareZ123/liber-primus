// Blind linear consistency attack on unseeded, full-state MT19937 % 28,
// using the exact GP29 predecessor-exclusion ranks from original LP2.
// No plaintext, guessed MT seed, private artifact or extra key is supplied.
//
// C++17: built for the existing manual-only workflow. Strict byte-for-byte
// source input is resources/liber-primus/lp2-corpus.json.
// A synthetic MT19937 stream is planted with the SAME original doublet mask.
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <iterator>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

constexpr int N = 624;
constexpr int BITS = N * 32;
constexpr int WORDS = BITS / 64;
constexpr std::uint32_t MATRIX_A = 0x9908b0dfu;
using Vec = std::array<std::uint64_t, WORDS>;
using StateWord = std::array<Vec, 32>;

void xori(Vec& a, const Vec& b) {
  for (int k = 0; k < WORDS; ++k) a[k] ^= b[k];
}

std::uint32_t temper(std::uint32_t x) {
  x ^= x >> 11;
  x ^= (x << 7) & 0x9d2c5680u;
  x ^= (x << 15) & 0xefc60000u;
  x ^= x >> 18;
  return x;
}

std::vector<int> readOriginal() {
  std::ifstream in("resources/liber-primus/lp2-corpus.json");
  if (!in) throw std::runtime_error("Run from repository root");
  const std::string s((std::istreambuf_iterator<char>(in)),
                       std::istreambuf_iterator<char>());
  const auto marker = s.find("\"pages\"");
  if (marker == std::string::npos) throw std::runtime_error("Missing pages");
  std::vector<int> stream;
  int runePages = 0;
  auto pos = marker;
  while ((pos = s.find("\"page\"", pos)) != std::string::npos) {
    const auto end = s.find('}', pos);
    if (end == std::string::npos) throw std::runtime_error("Malformed page");
    const auto field = s.substr(pos, end - pos);
    const auto colon = field.find(':');
    const int physical = std::stoi(field.substr(colon + 1));
    const auto status = field.find("\"status\"");
    const bool unsolved =
      status != std::string::npos &&
      field.substr(status).find("\"unsolved\"") != std::string::npos;
    if (unsolved) {
      if (physical == 50 || physical > 55)
        throw std::runtime_error("Unexpected rune-bearing page");
      const auto idx = field.find("\"indices\"");
      const auto open = field.find('[', idx);
      const auto close = field.find(']', open);
      if (idx == std::string::npos ||
          open == std::string::npos || close == std::string::npos)
        throw std::runtime_error("Malformed page indices");
      std::size_t offset = open + 1;
      while (offset < close) {
        while (offset < close && (field[offset] < '0' ||
                                    field[offset] > '9')) offset++;
        if (offset == close) break;
        std::size_t chars = 0;
        const int v = std::stoi(field.substr(offset), &chars);
        if (v < 0 || v > 28) throw std::runtime_error("Invalid GP29 rune");
        stream.push_back(v);
        offset += chars;
      }
      runePages++;
    }
    pos = end + 1;
  }
  if (runePages != 55 || stream.size() != 12956)
    throw std::runtime_error("Changed canonical original corpus");
  return stream;
}

std::vector<int> ranks(const std::vector<int>& glyph, bool cyclic,
                       bool consumeRepeat = false) {
  std::vector<int> result;
  for (std::size_t i = 1; i < glyph.size(); ++i) {
    const int previous = glyph[i-1], current = glyph[i];
    if (current == previous) {
      if (consumeRepeat) result.push_back(-1); // opaque consumed draw
      continue;
    }
    const int digit = cyclic
      ? (current - previous + 29) % 29 - 1
      : current - (current > previous ? 1 : 0);
    assert(digit >= 0 && digit < 28);
    result.push_back(digit);
  }
  return result;
}

struct LinearState {
  std::vector<StateWord> state;
  LinearState() : state(N) {
    for (int i = 0; i < N; ++i)
      for (int bit = 0; bit < 32; ++bit) {
        const int pos = i * 32 + bit;
        state[i][bit][pos / 64] = std::uint64_t(1) << (pos % 64);
      }
  }

  // Exact in-place MT19937 twist. This reproduces the official distinction
  // between old and newly written words when the +397 pointer wraps.
  void twist() {
    for (int i = 0; i < N; ++i) {
      const int next = (i + 1) % N, far = (i + 397) % N;
      const Vec top = state[i][31];
      const Vec low = state[next][0];
      StateWord updated{};
      for (int bit = 0; bit < 32; ++bit) {
        updated[bit] = state[far][bit];
        if (bit < 30) xori(updated[bit], state[next][bit + 1]);
        if (bit == 30) xori(updated[bit], top);
        if (MATRIX_A & (std::uint32_t(1) << bit))
          xori(updated[bit], low);
      }
      state[i] = std::move(updated);
    }
  }
};

struct Elimination {
  std::vector<Vec> pivots;
  std::vector<unsigned char> used, sides;
  int rank = 0, dependencies = 0;
  Elimination() : pivots(BITS), used(BITS), sides(BITS) {}

  bool add(Vec row, int rhs) {
    for (int wi = WORDS - 1; wi >= 0; --wi) {
      while (row[wi] != 0) {
        const int k = 63 - __builtin_clzll(row[wi]);
        const int p = wi * 64 + k;
        if (!used[p]) {
          used[p] = 1;
          pivots[p] = std::move(row);
          sides[p] = static_cast<unsigned char>(rhs);
          ++rank;
          return true;
        }
        const Vec& q = pivots[p];
        for (int j = 0; j <= wi; ++j) row[j] ^= q[j];
        rhs ^= sides[p];
      }
    }
    ++dependencies;
    return rhs == 0;
  }
};

struct Result {
  bool consistent;
  std::size_t processed;
  int rank;
  int dependencies;
};

Result assess(const std::vector<int>& observed, const std::string& title) {
  LinearState mt;
  Elimination elim;
  std::array<std::vector<int>, 2> masks;
  for (int bit = 0; bit < 32; ++bit) {
    const auto out = temper(std::uint32_t(1) << bit);
    for (int b = 0; b < 2; ++b)
      if ((out >> b) & 1u) masks[b].push_back(bit);
  }
  int checked = 0;
  for (std::size_t t = 0; t < observed.size(); ++t) {
    if (t > 0 && t % N == 0) mt.twist();
    if (observed[t] < 0) continue; // draw consumed but output not known
    const auto& current = mt.state[t % N];
    for (int b = 0; b < 2; ++b) {
      ++checked;
      Vec equation{};
      for (const int bit : masks[b]) xori(equation, current[bit]);
      if (!elim.add(equation, (observed[t] >> b) & 1)) {
        std::cout << title << ": INCONSISTENT at draw " << t
                  << " output bit " << b << " (rank " << elim.rank
                  << ", checked " << checked << " equations)\n";
        return {false, t + 1, elim.rank, elim.dependencies};
      }
    }
    if (t % 2048 == 2047) {
      std::cout << title << ": processed " << (t + 1)
                << " ranks, GF2 rank=" << elim.rank << std::endl;
    }
  }
  std::cout << title << ": CONSISTENT " << observed.size()
            << " ranks, GF2 rank=" << elim.rank
            << ", dependencies=" << elim.dependencies
            << ", checked=" << checked << std::endl;
  return {true, observed.size(), elim.rank, elim.dependencies};
}

int main() {
  const auto original = readOriginal();
  const auto sorted = ranks(original, false);
  const auto cyclic = ranks(original, true);
  const std::size_t doublets = original.size() - 1 - sorted.size();
  assert(doublets == 86);
  assert(sorted.size() == cyclic.size());
  std::cout << "Original: " << original.size()
            << " runes, " << doublets
            << " exact repeats, " << sorted.size()
            << " rank28 outputs\n";

  // Positive: encode actual uint32 MT%28 outputs in the same 29-rune
  // predecessor-exclusion alphabet, retaining the original 86 repeat sites.
  std::mt19937 gen(3301);
  std::vector<int> planted{original.front()};
  int previous = planted.front();
  for (std::size_t i = 1; i < original.size(); ++i) {
    if (original[i] == original[i-1]) {
      planted.push_back(previous);
      continue;
    }
    const int digit = static_cast<int>(gen() % 28);
    const int current = digit + (digit >= previous ? 1 : 0);
    assert(current >= 0 && current < 29 && current != previous);
    planted.push_back(current);
    previous = current;
  }
  const auto plant = ranks(planted, false);
  assert(plant.size() == sorted.size());
  assert(assess(plant, "Planted MT19937 source").consistent);

  const auto a = assess(sorted, "Original ascending skip-order");
  const auto b = assess(cyclic, "Original cyclic skip-order");

  // Each source-visible repeated glyph consumes exactly one MT output,
  // without emitting an ordinary 28-way rank digit.
  const auto sortedConsume = ranks(original, false, true);
  const auto cyclicConsume = ranks(original, true, true);
  assert(sortedConsume.size() == original.size() - 1);
  assert(cyclicConsume.size() == sortedConsume.size());

  std::mt19937 genConsume(3301);
  std::vector<int> plantedConsume{original.front()};
  int predecessor = plantedConsume.front();
  for (std::size_t i = 1; i < original.size(); ++i) {
    const int digit = static_cast<int>(genConsume() % 28);
    if (original[i] == original[i - 1]) {
      plantedConsume.push_back(predecessor);
      continue;
    }
    const int current = digit + (digit >= predecessor ? 1 : 0);
    assert(current >= 0 && current < 29 && current != predecessor);
    plantedConsume.push_back(current);
    predecessor = current;
  }
  const auto consumePlant = ranks(plantedConsume, false, true);
  assert(consumePlant.size() == sortedConsume.size());
  assert(assess(consumePlant, "Planted MT19937 one-draw repeat source").consistent);
  const auto c = assess(sortedConsume, "Original ascending consumed-repeat");
  const auto d = assess(cyclicConsume, "Original cyclic consumed-repeat");

  std::cout << "DECISION: no-draw ascending="
            << (a.consistent ? "compatible" : "rejected")
            << ", no-draw cyclic=" << (b.consistent ? "compatible" : "rejected")
            << ", one-draw ascending=" << (c.consistent ? "compatible" : "rejected")
            << ", one-draw cyclic=" << (d.consistent ? "compatible" : "rejected")
            << " in the complete seed-free MT32-mod28/rank28 model.\n";
  return 0;
}
