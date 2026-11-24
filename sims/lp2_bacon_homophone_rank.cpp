// Exhaustive canonical GP29 color-mask ranking for a 32-code homophonic output.
// Build with -DGP_NATIVE for 29 native output labels; default Latin 26.
#define main original_main
#include "lp2_bacon_shared_unknown_codebook.cpp"
#undef main
#include <queue>
#include <cmath>
#include <iomanip>
#include <omp.h>
#ifdef GP_NATIVE
constexpr int ALPHA=29,MIN_D=21,MAX_PAIRS=27092;
constexpr int SMALL[29]={1,2,4,6,8,12,17,24,34,46,60,74,89,106,127,149,172,196,223,252,282,313,345,378,417,460,504,551,600};
constexpr int TOP[29]={104,170,219,259,308,350,389,421,451,472,498,523,537,552,564,571,579,588,592,596,600,600,600,600,600,600,600,600,600};
constexpr int LOW[21]={0,1,3,4,4,5,6,6,6,7,7,8,8,9,9,9,10,11,11,11,12};
#else
constexpr int ALPHA=26,MIN_D=20,MAX_PAIRS=28912;
constexpr int SMALL[26]={1,3,7,12,18,26,34,44,56,72,89,106,129,152,176,202,233,265,301,338,375,413,453,498,548,600};
constexpr int TOP[26]={104,176,228,276,322,367,405,441,469,492,514,530,541,554,567,576,584,591,595,600,600,600,600,600,600,600};
constexpr int LOW[21]={0,1,1,2,2,3,3,4,4,5,5,5,6,6,7,7,8,9,9,10,10};
#endif
struct Candidate {double score;uint32_t key;int bi,tri,quad,pairs;bool operator<(const Candidate& o)const{return score>o.score||(score==o.score&&key<o.key);}};
constexpr size_t KEEP=10000;
bool histgate(const array<uint16_t,32>& counts){
 int maxCount=0,nonzero=0,pairs=0;for(int n:counts){maxCount=max(maxCount,n);nonzero+=(n>0);pairs+=n*(n-1);}if(maxCount>104||nonzero<MIN_D||pairs>MAX_PAIRS)return false;
 #ifdef __AVX512BW__
 const auto H=_mm512_loadu_si512(counts.data());for(int j:{1,3,5,7,9,12,15,17,19})if(__builtin_popcount(_mm512_cmp_epu16_mask(H,_mm512_set1_epi16(j),_MM_CMPINT_LE))<LOW[j])return false;
 #endif
 auto h=counts;sort(h.begin(),h.end());int sm=0,top=0;for(int j=0;j<ALPHA;j++){sm+=h[j];top+=h[31-j];if(sm>SMALL[j]||top>TOP[j])return false;}
 for(int j=0;j<21;j++)if(upper_bound(h.begin(),h.end(),j)-h.begin()<LOW[j])return false;
 return true;
}
struct Ranker{
 vector<uint32_t> bs,ts,qs;vector<uint16_t> bc,tc,qc;uint32_t epoch=0;
 Ranker():bs(1<<10),ts(1<<15),qs(1<<20),bc(1<<10),tc(1<<15),qc(1<<20){}
 int bump(vector<uint32_t>&s,vector<uint16_t>&h,uint32_t k){if(s[k]!=epoch){s[k]=epoch;h[k]=1;return 0;}return h[k]++;}
 Candidate rank(const uint8_t*c,uint32_t key,const array<uint16_t,32>&counts){++epoch;int bi=0,tri=0,quad=0,pairs=0;uint32_t bits=0;for(int i=0;i<600;i++){bits=((bits<<5)|c[i])&((1<<20)-1);if(i>=1)bi+=bump(bs,bc,bits&1023);if(i>=2)tri+=bump(ts,tc,bits&32767);if(i>=3)quad+=bump(qs,qc,bits);}
 for(int n:counts)pairs+=n*(n-1);double p2=(pairs+600.)/(600.*600.);double ex2=179101.*p2*p2,ex3=178503.*p2*p2*p2,ex4=177906.*p2*p2*p2*p2;
 double score=0.05*(bi-ex2)+(tri-ex3)+4*(quad-ex4);return {score,key,bi,tri,quad,pairs};}
};
int main(int argc,char**argv){assert(argc==3||argc==4);auto train=readGroups(argv[1]);assert(train.size()==600);Table t(train);uint32_t trueKey=argc==4?stoul(argv[3]):0;Ranker eval;array<uint16_t,32> h{};array<uint8_t,600> seq{};for(int i=0;i<600;i++)++h[seq[i]=code(train[i],trueKey)];auto truth=eval.rank(seq.data(),trueKey,h);if(argc==4)cerr<<"true gate "<<histgate(h)<<" score "<<truth.score<<" bi/tri/quad "<<truth.bi<<"/"<<truth.tri<<"/"<<truth.quad<<"\n";
 uint64_t survived=0,above=0;priority_queue<Candidate> merged;
 #pragma omp parallel reduction(+:survived,above)
 {Ranker ranker;priority_queue<Candidate> best;alignas(64) array<uint8_t,640> groups{};
 #pragma omp for schedule(dynamic,16)
 for(int a=0;a<int(HALF);a++){
  const uint8_t*l=t.lo.data()+a*t.stride;
  for(uint32_t b=0;b<HALF;b++){
   const uint8_t*rh=t.hi.data()+b*t.stride;array<uint16_t,32> hist{};
   #ifdef __AVX512F__
   for(int i=0;i<640;i+=64)_mm512_store_si512(groups.data()+i,_mm512_or_si512(_mm512_loadu_si512(l+i),_mm512_loadu_si512(rh+i)));
   #else
   for(int i=0;i<600;i++)groups[i]=l[i]|rh[i];
   #endif
   for(int i=0;i<600;i++)++hist[groups[i]];
   if(!histgate(hist))continue;survived++;uint32_t key=(uint32_t(a)<<1)|(b<<15);auto x=ranker.rank(groups.data(),key,hist);
   if(x.score>truth.score||(x.score==truth.score&&key<trueKey))above++;
   if(best.size()<KEEP)best.push(x);else if(x<best.top()){best.pop();best.push(x);}
  }
  if(a%1024==0)fprintf(stderr,"progress a=%d at %.0f\n",a,omp_get_wtime());
 }
 #pragma omp critical
 {while(!best.empty()){auto x=best.top();best.pop();if(merged.size()<KEEP)merged.push(x);else if(x<merged.top()){merged.pop();merged.push(x);}}}
 }
 vector<Candidate> out;while(!merged.empty()){out.push_back(merged.top());merged.pop();}reverse(out.begin(),out.end());ofstream file(argv[2]);file<<setprecision(12);for(auto &x:out)file<<x.key<<' '<<x.score<<' '<<x.bi<<' '<<x.tri<<' '<<x.quad<<' '<<x.pairs<<'\n';cerr<<"survived "<<survived<<" above evaluation key "<<above<<" top "<<out.front().key<<" score "<<out.front().score<<"\n";
}
