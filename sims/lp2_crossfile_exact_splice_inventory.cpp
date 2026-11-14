// Exact 75-JPEG cross-file byte-span inventory. C++17; no external libraries.
// 64-byte seeds every 64 source bytes, scanned against every target byte.
// A >=512-byte common span with a source-aligned 64-byte seed containing
// >=4 distinct byte values is necessarily found. All hits byte-verified.
// Prints a TSV to stdout; no data files are changed.
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
constexpr size_t WIDTH=64, MIN_LENGTH=512;
constexpr uint64_t BASE=257;
struct Seed { uint32_t index, offset; uint8_t direction; };
struct Match { uint32_t target, source; uint8_t direction; uint32_t targetStart, sourceStart, length; };

int main(int argc, char** argv) {
 const string dir=(argc>1)?argv[1]:"resources/liber-primus";
 array<vector<unsigned char>,75> original, reversed;
 uint64_t totalBytes=0;
 for(int i=0;i<75;i++) {
  char name[16]; snprintf(name,sizeof(name),"%02d.jpg",i);
  ifstream f(dir+"/"+name,ios::binary|ios::ate);
  if(!f) { cerr<<"Missing "<<name<<"\n"; return 1; }
  size_t n=static_cast<size_t>(f.tellg()); f.seekg(0);
  original[i].resize(n); f.read(reinterpret_cast<char*>(original[i].data()),n);
  reversed[i]=original[i]; reverse(reversed[i].begin(),reversed[i].end());
  totalBytes+=n;
 }
 // Historical positive controls established on the original artifact.
 const auto& a=original[5];
 if(a.size()!=673066 || !equal(a.begin(),a.begin()+336353,a.rbegin()) ||
    a[336353]!=10 || a[336354]!=10) { cerr<<"p05 shell control failed\n"; return 2; }
 const auto& book=original[10]; size_t bpos=754662;
 for(int s:{11,12,13}) {
  const auto& piece=original[s];
  if(bpos+piece.size()>book.size() ||
     memcmp(book.data()+bpos,piece.data(),piece.size())!=0) {
   cerr<<"p10 embedded-page control failed\n"; return 2;
  }
  bpos+=piece.size();
 }
 if(bpos!=book.size()) { cerr<<"p10 join-length control failed\n"; return 2; }

 uint64_t power=1;
 for(size_t i=1;i<WIDTH;i++)power*=BASE;
 auto hash=[&](const vector<unsigned char>&v,size_t p) {
  uint64_t h=0;
  for(size_t i=0;i<WIDTH;i++)h=h*BASE+v[p+i];
  return h;
 };
 unordered_multimap<uint64_t,Seed> index; index.reserve(2200000);
 for(uint32_t i=0;i<75;i++) for(uint8_t direction=0;direction<2;direction++) {
  const auto& b=direction?reversed[i]:original[i];
  for(size_t off=0;off+WIDTH<=b.size();off+=WIDTH) {
   bool seen[256]={}; int distinct=0;
   for(size_t j=0;j<WIDTH;j++)if(!seen[b[off+j]]) {
    seen[b[off+j]]=true; distinct++;
   }
   if(distinct<4)continue; // ignore zero-fill / <=3-byte-value anchors
   index.emplace(hash(b,off),Seed{i,static_cast<uint32_t>(off),direction});
  }
 }
 vector<Match> matches;
 uint64_t candidateCount=0,seedValid=0,fullExtends=0;
 for(uint32_t target=0;target<75;target++) {
  const auto& tb=original[target];
  // One interval per source, direction and signed source/target offset.
  unordered_map<int64_t,uint32_t> covered;
  uint64_t h=hash(tb,0);
  for(size_t p=0;p+WIDTH<=tb.size();p++) {
   auto [it,end]=index.equal_range(h);
   for(;it!=end;++it) {
    const auto& seed=it->second;
    if(seed.index>=target)continue; // avoid duplicate pair orientations
    candidateCount++;
    const auto& sb=seed.direction?reversed[seed.index]:original[seed.index];
    const int64_t delta=static_cast<int64_t>(p)-seed.offset;
    const int64_t key=(static_cast<int64_t>(seed.index)*2+seed.direction)
                     *14000000LL+(delta+7000000LL);
    auto found=covered.find(key);
    if(found!=covered.end() && p<found->second)continue;
    if(memcmp(tb.data()+p,sb.data()+seed.offset,WIDTH)!=0)continue;
    seedValid++;
    size_t left=0;
    while(p>left && seed.offset>left &&
          tb[p-left-1]==sb[seed.offset-left-1])left++;
    size_t right=WIDTH;
    while(p+right<tb.size() && seed.offset+right<sb.size() &&
          tb[p+right]==sb[seed.offset+right])right++;
    fullExtends++;
    if(left+right<MIN_LENGTH)continue;
    covered[key]=static_cast<uint32_t>(p+right);
    matches.push_back({target,seed.index,seed.direction,
                       static_cast<uint32_t>(p-left),
                       static_cast<uint32_t>(seed.offset-left),
                       static_cast<uint32_t>(left+right)});
   }
   if(p+WIDTH<tb.size())h=(h-uint64_t(tb[p])*power)*BASE+tb[p+WIDTH];
  }
 }
 sort(matches.begin(),matches.end(),[](const Match&a,const Match&b) {
  if(a.length!=b.length)return a.length>b.length;
  return a.target<b.target;
 });
 cout<<"target\tsource\torientation\ttargetStart\tsourceStartOriented"
       "\tsourceStartOriginal\tlength\tentropyBitsPerByte\n";
 size_t meaningful=0,headers=0,internal=0,other=0;
 for(const auto& m:matches) {
  const uint32_t origin=m.direction?
    static_cast<uint32_t>(original[m.source].size())-(m.sourceStart+m.length):
    m.sourceStart;
  array<size_t,256> counts{};
  for(size_t i=0;i<m.length;i++)
   counts[original[m.target][m.targetStart+i]]++;
  double entropy=0;
  for(auto n:counts)if(n) {
   double fraction=static_cast<double>(n)/m.length;
   entropy-=fraction*log2(fraction);
  }
  if(entropy>=3) {
   meaningful++;
   if(m.targetStart==0 || origin==0)headers++;
   else if(m.targetStart>=20000 && origin>=20000)internal++;
   else other++;
  }
  cout<<m.target<<'\t'<<m.source<<'\t'
      <<(m.direction?"reverse":"forward")<<'\t'
      <<m.targetStart<<'\t'<<m.sourceStart<<'\t'<<origin<<'\t'
      <<m.length<<'\t'<<entropy<<'\n';
 }
 cerr<<"bytes="<<totalBytes<<" seeds="<<index.size()
     <<" min="<<MIN_LENGTH<<" candidate-hashes="<<candidateCount
     <<" valid-seeds="<<seedValid<<" extended="<<fullExtends
     <<" matches="<<matches.size()<<" entropy>=3="<<meaningful
     <<" headersOrEmbeddedStarts="<<headers
     <<" internal>=20k="<<internal<<" other="<<other<<"\n";
}
