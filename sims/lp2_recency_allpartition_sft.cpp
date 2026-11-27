// Exact all-update adaptive recency side-partition histogram transform.
// Build: g++ -std=c++17 -O3 -march=native -fopenmp lp2_recency_allpartition_sft.cpp -o recency
// Input: whitespace-separated base29 ASCII tape, digits 0..9 and A..S.
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <map>
#include <numeric>
#include <random>
#include <string>
#include <vector>
#ifdef _OPENMP
#include <omp.h>
#endif
#ifdef __AVX512BW__
#include <immintrin.h>
#endif
using namespace std;
constexpr int W=32;
using Mask=uint32_t;
struct Event { int t; Mask older; };
struct Events { vector<Event> visits; int burn=0,repeats=0; };
static int pc(Mask x){
#if defined(__GNUC__) || defined(__clang__)
  return __builtin_popcount(x);
#else
  int n=0;while(x){x&=x-1;++n;}return n;
#endif
}
static Events trace(const vector<int>& c,int n){
  assert(c.size()>1&&n>=2&&n<=29);
  const int k=n-1; vector<int> tok(n,-1),last(k,-1);
  int center=c[0],next=0,seen=0; Events out;
  for(int a=0;a<n;++a)if(a!=center)tok[a]=next++;
  for(int i=1;i<(int)c.size();++i){
    const int a=c[i];assert(a>=0&&a<n);
    if(a==center){if(seen==k)++out.repeats;continue;}
    const int t=tok[a];assert(t>=0);
    if(seen==k){Mask m=0;for(int u=0;u<k;++u)if(last[u]<last[t])m|=Mask(1)<<u;out.visits.push_back({t,m});}
    if(last[t]<0){++seen;if(seen==k)out.burn=i+1;}
    last[t]=i;tok[center]=t;tok[a]=-1;center=a;
  }
  assert(seen==k&&out.burn>0);
  assert(out.burn+(int)out.visits.size()+out.repeats==(int)c.size());
  return out;
}
struct alignas(64) Row { int16_t a[W]{}; };
struct Term {Mask mask;int weight;};
static vector<Term> polynomial(const vector<Event>& events){
  map<Mask,int> d;
  for(auto e:events){assert(!(e.older&(Mask(1)<<e.t)));++d[e.older|(Mask(1)<<e.t)];--d[e.older];}
  vector<Term> out;for(auto [m,w]:d)if(w)out.push_back({m,w});return out;
}
static void transform(vector<Row>& rows,int low){
#ifdef __AVX512BW__
  const __m512i shift=_mm512_setr_epi32(0x00000000,0x00020001,0x00040003,0x00060005,0x00080007,0x000a0009,0x000c000b,0x000e000d,0x0010000f,0x00120011,0x00140013,0x00160015,0x00180017,0x001a0019,0x001c001b,0x001e001d);
#endif
  for(int b=0;b<low;++b){const int s=1<<b;
    for(int i=0;i<(1<<low);i+=2*s)for(int j=0;j<s;++j){
      auto& a=rows[i+j];auto& z=rows[i+j+s];
#ifdef __AVX512BW__
      const __m512i A=_mm512_load_si512(a.a), B=_mm512_load_si512(z.a);
      _mm512_store_si512(a.a,_mm512_add_epi16(A,B));
      const __m512i XB=_mm512_maskz_permutexvar_epi16(0xfffffffeu,shift,B);
      _mm512_store_si512(z.a,_mm512_add_epi16(A,XB));
#else
      // Descending to preserve z[d-1], with A still unmodified.
      Row old=z;
      for(int d=0;d<W;++d){const int16_t A=a.a[d];a.a[d]=A+old.a[d];z.a[d]=A+(d?old.a[d-1]:0);}
#endif
    }
  }
}
static vector<int> brute(const vector<Event>& e,Mask s,int n){
  vector<int> h(n);for(auto v:e)if(s&(Mask(1)<<v.t))++h[pc(s&v.older)];return h;
}
static void fillrows(vector<Row>& rows,const vector<Term>& terms,int low,Mask high){
  fill(rows.begin(),rows.end(),Row{});const Mask lm=(Mask(1)<<low)-1;
  for(auto e:terms){const int d=pc((e.mask>>low)&high);rows[e.mask&lm].a[d]+=e.weight;}
  transform(rows,low);
}
static void controls(){
  mt19937 rng(3301);
  // Exhaustive direct event histograms versus tensor transform, all keys on small alphabets.
  for(int n=3;n<=11;++n){vector<int> c;for(int i=0;i<800;++i)c.push_back(rng()%n);auto e=trace(c,n);auto terms=polynomial(e.visits);const int k=n-1,low=k/2;vector<Row> rows(1<<low);
    for(Mask hi=0;hi<(Mask(1)<<(k-low));++hi){fillrows(rows,terms,low,hi);for(Mask lo=0;lo<(Mask(1)<<low);++lo){auto direct=brute(e.visits,(hi<<low)|lo,n);int x=0;for(int d=0;d<n;++d){x-=rows[lo].a[d];assert(x==direct[d]);}assert(x==0);}}
  }
  // Real 29-symbol adaptive list; independent rank oracle before and after burn-in.
  for(int r:{0,1,7,14,21,28}){
    vector<int> a(29),labels(29);iota(a.begin(),a.end(),0);iota(labels.begin(),labels.end(),0);shuffle(a.begin(),a.end(),rng);shuffle(labels.begin(),labels.end(),rng);
    vector<int> c,truth;for(int i=0;i<2000;++i){int p=(i%5==0)?0:rng()%29;int rank=labels[p];int v=a[rank];truth.push_back(rank);c.push_back(v);a.erase(a.begin()+rank);a.insert(a.begin()+r,v);}
    auto e=trace(c,29);int center=c[0];vector<int> tok(29,-1),tokenSide(28,-1);int k=0;for(int i=0;i<29;++i)if(i!=center)tok[i]=k++;
    // Reconstruct each token's side from actual rank at first access; it never changes.
    for(int i=1;i<(int)c.size();++i){int v=c[i],rank=truth[i];if(v==center){assert(rank==r);continue;}int t=tok[v],side=rank<r?0:1;assert(rank!=r);if(tokenSide[t]<0)tokenSide[t]=side;else assert(tokenSide[t]==side);tok[center]=t;tok[v]=-1;center=v;}
    Mask s=0;for(int i=0;i<28;++i){assert(tokenSide[i]>=0);if(tokenSide[i]==0)s|=Mask(1)<<i;}assert(pc(s)==r);
    auto h=brute(e.visits,s,29),g=brute(e.visits,((Mask(1)<<28)-1)^s,29);vector<int> want(29),got(29);for(int i=e.burn;i<(int)truth.size();++i)++want[truth[i]];got[r]=e.repeats;for(int j=0;j<r;++j)got[j]=h[j];for(int j=0;j<28-r;++j)got[28-j]=g[j];assert(got==want);
  }
  cerr<<"controls: 2044 exhaustive reduced masks, six full alphabet true-rank oracles passed\n";
}
struct Best {int count=0;Mask s=0;int rank=0;};
static bool better(Best a,Best b){return a.count>b.count||(a.count==b.count&&(a.s<b.s||(a.s==b.s&&a.rank<b.rank)));}
int main(int argc,char**argv){
  controls();if(argc<2){cerr<<"usage: recency tape.txt [low=12] [high_begin=0] [high_end=all]\n";return 2;}
  ifstream f(argv[1]);vector<int> c;char ch;uint32_t hash=2166136261u;while(f>>ch){int x=ch<='9'?ch-'0':ch-'A'+10;assert(x>=0&&x<29);c.push_back(x);hash=(hash^(unsigned char)ch)*16777619u;}
  assert(c.size()==12956&&hash==0x75f0ccfau);
  auto e=trace(c,29);auto terms=polynomial(e.visits);int low=argc>2?stoi(argv[2]):12;assert(low>=1&&low<=20);int begin=argc>3?stoi(argv[3]):0,end=argc>4?stoi(argv[4]):(1<<(28-low));assert(begin>=0&&end<=(1<<(28-low))&&begin<end);
  cerr<<"burn="<<e.burn<<" noncenter="<<e.visits.size()<<" center="<<e.repeats<<" signed_terms="<<terms.size()<<" low="<<low<<" high=["<<begin<<","<<end<<")\n";
  array<Best,29> best{};auto start=chrono::steady_clock::now();
#pragma omp parallel
  {
    vector<Row> rows(1<<low);array<Best,29> local{};
#pragma omp for schedule(static)
    for(int hi=begin;hi<end;++hi){fillrows(rows,terms,low,hi);for(Mask lo=0;lo<(Mask(1)<<low);++lo){Mask s=(Mask(hi)<<low)|lo;int m=pc(s),v=0;for(int j=0;j<m;++j){v-=rows[lo].a[j];assert(v>=0);Best b{v,s,j};if(better(b,local[m]))local[m]=b;}v-=rows[lo].a[m];assert(v==0);}}
#pragma omp critical
    {for(int m=0;m<=28;++m)if(better(local[m],best[m]))best[m]=local[m];}
  }
  for(int m=1;m<=28;++m)if(best[m].count){auto x=brute(e.visits,best[m].s,29);assert(pc(best[m].s)==m&&x[best[m].rank]==best[m].count);}
  double secs=chrono::duration<double>(chrono::steady_clock::now()-start).count();
  cout<<"{\"burn\":"<<e.burn<<",\"noncenter\":"<<e.visits.size()<<",\"center\":"<<e.repeats<<",\"terms\":"<<terms.size()<<",\"low\":"<<low<<",\"high_begin\":"<<begin<<",\"high_end\":"<<end<<",\"subsets\":"<<(uint64_t(end-begin)<<low)<<",\"seconds\":"<<secs<<",\"best\":[";
  for(int m=0;m<=28;++m){if(m)cout<<",";cout<<"{\"m\":"<<m<<",\"count\":"<<best[m].count<<",\"mask\":"<<best[m].s<<",\"rank\":"<<best[m].rank<<"}";}
  cout<<"]}\n";
}
