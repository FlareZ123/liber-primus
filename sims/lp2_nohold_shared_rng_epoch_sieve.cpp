// Agent4, 25 November 2026.
// Exact no-literal-F same-instance CPython 3.4 integer-key / conditional-coin
// inverse. This is a bounded reproduction of the 10,000-second pilot window,
// not an authenticated cipher or seed claim.
// Input is the canonical corpus JSON (blob at initial freeze:
// 054f2a0f780b7d46901acbe3d9bf4f0ac1801165). Pages 0..55 are the target.
// All plaintext symbols, including F, consume a key draw. A collision consumes
// a 53-bit random() coin; coin < threshold rejects and retries the same rune.
// The threshold is constant and lies in the independently frozen (.72,.882].
// No language prior, word boundaries, cursor cap, or rejection cap is used.
#include <algorithm>
#include <array>
#include <atomic>
#include <cassert>
#include <cctype>
#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <mutex>
#include <random>
#include <sstream>
#include <string>
#include <thread>
#include <vector>
using namespace std;
using U=uint64_t;
constexpr U Q=1ULL<<53;
constexpr U LO=6485183463413515ULL; // floor(.72*2^53)+1
constexpr U HI=7944349742681555ULL; // ceil(.882*2^53)
constexpr U MLE=7321772130193858ULL; // ceil(.81288*2^53), descriptive only
constexpr U FIRST=1398988800ULL;
constexpr U LAST=1398998800ULL; // exclusive: 10,000 seconds from 2014-05-02 00:00 UTC
constexpr uint32_t EXPECTED_FNV=0xfe63c4edU;

struct MT {
  array<uint32_t,624> m;
  int i=624;
  vector<uint32_t> u;
  explicit MT(U seed) {
    m[0]=19650218U;
    for(int x=1;x<624;x++)
      m[x]=1812433253U*(m[x-1]^(m[x-1]>>30))+uint32_t(x);
    uint32_t words[2]={uint32_t(seed),uint32_t(seed>>32)};
    int nw=words[1]?2:1,j=0;
    i=1;
    for(int k=0;k<624;k++){
      m[i]=(m[i]^((m[i-1]^(m[i-1]>>30))*1664525U))+words[j]+uint32_t(j);
      if(++i==624){m[0]=m[623];i=1;}
      if(++j==nw)j=0;
    }
    for(int k=0;k<623;k++){
      m[i]=(m[i]^((m[i-1]^(m[i-1]>>30))*1566083941U))-uint32_t(i);
      if(++i==624){m[0]=m[623];i=1;}
    }
    m[0]=0x80000000U;
    i=624;
    u.reserve(256);
  }
  uint32_t next(){
    if(i==624){
      for(int k=0;k<624;k++){
        uint32_t y=(m[k]&0x80000000U)|(m[(k+1)%624]&0x7fffffffU);
        m[k]=m[(k+397)%624]^(y>>1)^((y&1)?0x9908b0dfU:0);
      }
      i=0;
    }
    uint32_t y=m[i++];
    y^=y>>11;
    y^=(y<<7)&0x9d2c5680U;
    y^=(y<<15)&0xefc60000U;
    y^=y>>18;
    return y;
  }
  uint32_t word(int k){while(k>=int(u.size()))u.push_back(next());return u[k];}
  int key(int& k){int v;do{v=int(word(k++)>>27);}while(v>=29);return v;}
  U coin(int& k){U a=word(k++)>>5,b=word(k++)>>6;return (a<<26)|b;}
};

vector<int> load_cipher(){
  ifstream f("resources/liber-primus/lp2-corpus.json");
  if(!f)throw runtime_error("cannot open canonical LP2 corpus");
  string s((istreambuf_iterator<char>(f)),istreambuf_iterator<char>());
  size_t pos=s.find("\"pages\"");
  if(pos==string::npos)throw runtime_error("missing pages array");
  pos=s.find('[',pos);
  vector<int>C;
  int page_count=0;
  while(true){
    size_t p=s.find("\"page\"",pos);
    if(p==string::npos)break;
    size_t colon=s.find(':',p);
    int page=stoi(s.substr(colon+1));
    size_t idx=s.find("\"indices\"",colon);
    if(idx==string::npos)throw runtime_error("missing indices field");
    size_t a=s.find('[',idx),b=s.find(']',a);
    if(a==string::npos||b==string::npos)throw runtime_error("malformed indices");
    page_count++;
    if(page<=55){
      size_t q=a+1;
      while(q<b){
        while(q<b&&!isdigit(static_cast<unsigned char>(s[q])))q++;
        if(q>=b)break;
        size_t e=q;
        while(e<b&&isdigit(static_cast<unsigned char>(s[e])))e++;
        int v=stoi(s.substr(q,e-q));
        if(v<0||v>=29)throw runtime_error("rune index outside GP29");
        C.push_back(v);
        q=e;
      }
    }
    pos=b+1;
  }
  if(page_count<56||C.size()!=12956)throw runtime_error("unexpected page/rune count");
  uint32_t h=2166136261U;
  int repeats=0;
  for(size_t i=0;i<C.size();i++){
    h=(h^uint32_t(C[i]))*16777619U;
    if(i&&C[i]==C[i-1])repeats++;
  }
  if(h!=EXPECTED_FNV)throw runtime_error("canonical ciphertext FNV mismatch");
  if(repeats!=86)throw runtime_error("canonical repeat count mismatch");
  return C;
}

struct State{int j;U lo,hi;};
struct Step{U coin;int afterCoin,afterKey,emit;};
struct Result{
  bool complete=false;
  int dead=0;
  int final_states=0;
  int max_states=0;
  vector<pair<U,U>> intervals;
};
vector<pair<U,U>> merge_intervals(vector<pair<U,U>> a){
  if(a.empty())return a;
  sort(a.begin(),a.end());
  vector<pair<U,U>> out;
  for(auto x:a){
    if(!out.empty()&&x.first<=out.back().second+1)
      out.back().second=max(out.back().second,x.second);
    else out.push_back(x);
  }
  return out;
}
Result reach_nohold(const vector<int>& C,MT& M,U low,U high){
  vector<State>S,T;
  int j=0;
  (void)M.key(j); // first ciphertext rune has no predecessor, so no collision
  S.push_back({j,low,high});
  Result R;
  R.max_states=1;
  for(int i=1;i<int(C.size());i++){
    const int c=C[i],prev=C[i-1];
    T.clear();
    for(const State&a:S){
      int cur=a.j;
      const int first_key=M.key(cur);
      if(c!=prev)T.push_back({cur,a.lo,a.hi}); // ordinary noncollision plaintext
      const int p=(prev+29-first_key)%29;       // only plaintext making first trial collide
      vector<Step> chain;
      int chain_cursor=cur;
      while(true){
        int after_coin=chain_cursor;
        const U coin=M.coin(after_coin);
        int after_key=after_coin;
        const int retry_key=M.key(after_key);
        const int emit=(p+retry_key)%29;
        chain.push_back({coin,after_coin,after_key,emit});
        if(emit!=prev)break;
        chain_cursor=after_key;
      }
      U floor=a.lo;
      for(const Step&z:chain){
        const U cap=min(a.hi,z.coin);
        if(c==prev&&floor<=cap)
          T.push_back({z.afterCoin,floor,cap}); // accept this repeated trial
        floor=max(floor,z.coin+1);              // reject: threshold > coin
        if(floor>a.hi)break;
        if(z.emit!=prev){
          if(z.emit==c)T.push_back({z.afterKey,floor,a.hi});
          break;
        }
      }
    }
    if(T.empty()){R.dead=i;return R;}
    sort(T.begin(),T.end(),[](const State&a,const State&b){
      if(a.j!=b.j)return a.j<b.j;
      if(a.lo!=b.lo)return a.lo<b.lo;
      return a.hi<b.hi;
    });
    S.clear();
    for(const State&x:T){
      if(!S.empty()&&S.back().j==x.j&&x.lo<=S.back().hi+1)
        S.back().hi=max(S.back().hi,x.hi);
      else S.push_back(x);
    }
    R.max_states=max(R.max_states,int(S.size()));
  }
  vector<pair<U,U>> all;
  for(const State&x:S)all.push_back({x.lo,x.hi});
  R.intervals=merge_intervals(move(all));
  R.complete=true;
  R.final_states=int(S.size());
  return R;
}
bool contains(const vector<pair<U,U>>& a,U x){
  for(const auto&z:a)if(z.first<=x&&x<=z.second)return true;
  return false;
}
vector<int> plant_nohold(const vector<int>&P,U seed,U threshold){
  MT M(seed);
  int j=0,prev=-1;
  vector<int>C;
  C.reserve(P.size());
  for(int p:P){
    while(true){
      const int k=M.key(j);
      const int c=(p+k)%29;
      if(c!=prev){C.push_back(c);prev=c;break;}
      const U u=M.coin(j);
      if(u>=threshold){C.push_back(c);prev=c;break;}
    }
  }
  return C;
}
bool reach_fixed(const vector<int>&C,U seed,U threshold){
  MT M(seed);
  int j=0;(void)M.key(j);
  vector<int>S{j};
  for(int i=1;i<int(C.size());i++){
    const int c=C[i],prev=C[i-1];
    vector<int>N;
    for(int state:S){
      int cur=state;
      const int first_key=M.key(cur);
      if(c!=prev)N.push_back(cur);
      const int p=(prev+29-first_key)%29;
      while(true){
        const U u=M.coin(cur);
        if(u>=threshold){if(c==prev)N.push_back(cur);break;}
        const int k=M.key(cur),emit=(p+k)%29;
        if(emit!=prev){if(emit==c)N.push_back(cur);break;}
      }
    }
    sort(N.begin(),N.end());
    N.erase(unique(N.begin(),N.end()),N.end());
    if(N.empty())return false;
    S.swap(N);
  }
  return true;
}
bool brute_exists_three(const vector<int>&target,U seed,U threshold){
  for(int a=0;a<29;a++)for(int b=0;b<29;b++)for(int c=0;c<29;c++){
    vector<int>P{a,b,c};
    if(plant_nohold(P,seed,threshold)==target)return true;
  }
  return false;
}
void run_controls(){
  int interval_checks=0,planted=0,brute_checks=0;
  const array<U,4> points={0ULL,Q/3,Q*4/5,Q};
  for(int z=0;z<16;z++){
    const U seed=0x3301ULL+U(z);
    const U threshold=LO+(HI-LO)*U(z)/15;
    mt19937 rng(0x71e500U+uint32_t(z));
    vector<int>P(768);
    for(int&x:P)x=int(rng()%29);
    const vector<int>E=plant_nohold(P,seed,threshold);
    MT M(seed);
    const Result R=reach_nohold(E,M,0,Q);
    if(!R.complete||!contains(R.intervals,threshold))
      throw runtime_error("planted integer-conditional control lost true threshold");
    planted++;
    for(U t:points){
      const bool a=contains(R.intervals,t),b=reach_fixed(E,seed,t);
      if(a!=b)throw runtime_error("interval/fixed-threshold control mismatch");
      interval_checks++;
    }
  }
  // Exhaustive three-rune ciphertext oracle under one fixed seed/threshold.
  const U seed=0x3301ULL,threshold=HI;
  mt19937 rng(0x33015729U);
  for(int z=0;z<32;z++){
    vector<int>target{int(rng()%29),int(rng()%29),int(rng()%29)};
    const bool brute=brute_exists_three(target,seed,threshold);
    const bool exact=reach_fixed(target,seed,threshold);
    if(brute!=exact)throw runtime_error("three-rune exhaustive oracle mismatch");
    brute_checks++;
  }
  cout<<"controls planted="<<planted
      <<" interval/fixed checks="<<interval_checks
      <<" exhaustive three-rune oracle checks="<<brute_checks<<"\n";
}

int main(){
  try{
    const vector<int>C=load_cipher();
    run_controls();
    const U mle_hits_threshold=MLE;
    atomic<U> next{FIRST};
    atomic<int> checked{0},max_dead{0};
    vector<pair<U,Result>> survivors;
    mutex lock;
    const unsigned hc=max(1u,thread::hardware_concurrency());
    const unsigned nthreads=min(8u,hc);
    vector<thread>workers;
    for(unsigned t=0;t<nthreads;t++){
      workers.emplace_back([&](){
        while(true){
          const U seed=next.fetch_add(1);
          if(seed>=LAST)break;
          MT M(seed);
          Result R=reach_nohold(C,M,LO,HI);
          checked.fetch_add(1);
          if(R.complete){
            lock_guard<mutex>g(lock);
            survivors.push_back({seed,move(R)});
          }else{
            int old=max_dead.load();
            while(old<R.dead&&!max_dead.compare_exchange_weak(old,R.dead)){}
          }
        }
      });
    }
    for(auto&t:workers)t.join();
    sort(survivors.begin(),survivors.end(),[](const auto&a,const auto&b){return a.first<b.first;});
    int mle_survivors=0;
    for(const auto&x:survivors)if(contains(x.second.intervals,mle_hits_threshold))mle_survivors++;
    const char* env=getenv("SFT_OUTPUT");
    const string output_path=env?env:"lp2-nohold-seed-output.json";
    ofstream out(output_path);
    if(!out)throw runtime_error("cannot write machine-readable output");
    out<<"{\n  \"model\":\"CPython MT getrandbits(5) key, conditional random() coin, no literal-F hold\",\n";
    out<<"  \"corpus_blob_sha\":\"054f2a0f780b7d46901acbe3d9bf4f0ac1801165\",\n";
    out<<"  \"ciphertext_length\":"<<C.size()<<",\n  \"ciphertext_fnv32\":\"fe63c4ed\",\n";
    out<<"  \"seed_window_exclusive\":["<<FIRST<<","<<LAST<<"],\n";
    out<<"  \"threshold_k_domain_inclusive\":["<<LO<<","<<HI<<"],\n";
    out<<"  \"threshold_real_domain\":\"(.72,.882]\",\n";
    out<<"  \"threshold_mle_point_k\":"<<MLE<<",\n";
    out<<"  \"seeds_checked\":"<<checked.load()<<",\n";
    out<<"  \"max_dead_prefix\":"<<max_dead.load()<<",\n";
    out<<"  \"full_book_survivors\":"<<survivors.size()<<",\n";
    out<<"  \"survivors_at_mle_point\":"<<mle_survivors<<",\n";
    out<<"  \"survivors\":[\n";
    for(size_t i=0;i<survivors.size();i++){
      const auto&x=survivors[i];
      out<<"    {\"seed\":"<<x.first<<",\"final_states\":"<<x.second.final_states
         <<",\"max_states\":"<<x.second.max_states<<",\"threshold_intervals\":[";
      for(size_t j=0;j<x.second.intervals.size();j++){
        if(j)out<<",";
        out<<"["<<x.second.intervals[j].first<<","<<x.second.intervals[j].second<<"]";
      }
      out<<"]}"<<(i+1<survivors.size()?",":"")<<"\n";
    }
    out<<"  ]\n}\n";
    out.close();
    cout<<"ciphertext length="<<C.size()<<" repeats=86 fnv32=fe63c4ed\n";
    cout<<"seed window=["<<FIRST<<","<<LAST<<") checked="<<checked.load()
        <<" max_dead_prefix="<<max_dead.load()<<"\n";
    cout<<"threshold domain k=["<<LO<<","<<HI<<"] exact integer representation of (.72,.882]\n";
    cout<<"full-book survivors="<<survivors.size()
        <<" survivors containing s=.81288 MLE point="<<mle_survivors<<"\n";
    for(const auto&x:survivors){
      cout<<"SURVIVOR "<<x.first<<" final_states="<<x.second.final_states<<" intervals=";
      for(size_t j=0;j<x.second.intervals.size();j++){
        if(j)cout<<";";
        cout<<"["<<x.second.intervals[j].first<<","<<x.second.intervals[j].second<<"]";
      }
      cout<<"\n";
    }
    cout<<"output="<<output_path<<"\n";
  }catch(const exception&e){
    cerr<<"FAIL: "<<e.what()<<"\n";
    return 2;
  }
  return 0;
}
