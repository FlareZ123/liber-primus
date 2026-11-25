#define main epoch_main
#include "lp2_may2014_shared_rng_nohold_epoch_sieve.cpp"
#undef main
#include <sstream>
#include <queue>
#include <tuple>
struct ScoreState {int j,p;U lo,hi;int64_t score;};
constexpr int64_t NONE=std::numeric_limits<int64_t>::min()/4;
using Weights=array<int,870>;
int64_t relaxed(const vector<int>& C, MT& M,int schedule,int mode,const Weights& W,U low=U(.72*Q)+1,U high=U(.882*Q)){
 vector<ScoreState>S,T;S.reserve(512);T.reserve(1024);S.push_back({0,29,low,high,0});
 using Pair=pair<int64_t,U>;
 vector<Pair> heap;heap.reserve(128);
 for(int i=0;i<int(C.size());i++){
  int c=C[i],prev=i?C[i-1]:-1;T.clear();
  for(const auto&a:S){
   auto add=[&](int j,int p,U lo,U hi){if(lo<=hi)T.push_back({j,p,lo,hi,a.score+W[a.p*29+p]});};
   Trial t=trial(M,a.j,schedule,mode);int k=t.key;
   if(c!=prev)add(t.end,(c+29-k)%29,a.lo,a.hi);
   if(prev<0)continue;
   int p=(prev+29-k)%29;U l=a.lo,h=a.hi;int pos=t.end;
   while(l<=h){U u=schedule?t.coin:M.coin(pos);if(c==prev)add(pos,p,l,min(h,u));l=max(l,u+1);if(l>h)break;
     t=trial(M,pos,schedule,mode);pos=t.end;int emit=(p+t.key)%29;
     if(emit!=prev){if(emit==c)add(pos,p,l,h);break;}
   }
  }
  if(T.empty())return NONE;
  sort(T.begin(),T.end(),[](const ScoreState&a,const ScoreState&b){return tie(a.j,a.p,a.lo)<tie(b.j,b.p,b.lo);});
  S.clear();
  for(size_t k=0;k<T.size();){size_t stop=k+1;int j=T[k].j,p=T[k].p;while(stop<T.size()&&T[stop].j==j&&T[stop].p==p)stop++;
   if(stop==k+1){S.push_back(T[k]);k=stop;continue;}
   heap.clear();U x=T[k].lo;size_t m=k;
   while(true){
    while(m<stop&&T[m].lo<=x){heap.emplace_back(T[m].score,T[m].hi);push_heap(heap.begin(),heap.end());m++;}
    while(!heap.empty()&&heap.front().second<x){pop_heap(heap.begin(),heap.end());heap.pop_back();}
    if(heap.empty()){if(m==stop)break;x=T[m].lo;continue;}
    auto [s,h]=heap.front();if(m<stop)h=min(h,T[m].lo-1);
    if(!S.empty()&&S.back().j==j&&S.back().p==p&&S.back().score==s&&S.back().hi+1==x)S.back().hi=h;
    else S.push_back({j,p,x,h,s});
    if(h==Q)break;x=h+1;
   }k=stop;
  }
 }
 int64_t best=NONE;for(const auto&a:S)best=max(best,a.score);return best;
}
int main(int argc,char**argv){assert(argc==3);ifstream in(argv[1]),wfile(argv[2]);vector<int>C;string row;uint32_t h=2166136261U;
 while(in>>row)for(char c:row){int v=c<='9'?c-'0':c-'a'+10;assert(v>=0&&v<29);C.push_back(v);h=(h^v)*16777619U;}assert(C.size()==12956&&h==0xfe63c4edU);
 string w((istreambuf_iterator<char>(wfile)),istreambuf_iterator<char>());h=2166136261U;for(unsigned char c:w)h=(h^c)*16777619U;assert(h==0xa9ed97e7U);replace(w.begin(),w.end(),',',' ');istringstream ws(w);Weights W;for(int& x:W)assert(bool(ws>>x));int extra;assert(!(ws>>extra));
 vector<tuple<U,int,int>> cases;string label;U seed;int a,b;while(cin>>label>>seed>>a>>b){assert(label=="SURVIVOR"&&a>=0&&a<3&&b>=0&&b<2);cases.emplace_back(seed,a,b);}
 // A known compatible full-length path must not exceed the relaxed optimum.
 MT donor(0x3301);vector<int>P;int pos=0,prev=29;int64_t truth=0;for(int i=0;i<12956;i++){int p=donor.key(pos);P.push_back(p);truth+=W[prev*29+p];prev=p;}
 for(int a=0;a<3;a++)for(int b=0;b<2;b++){MT A(0x64929851),B(0x64929851);auto X=plant(P,A,a,b,Q*4/5);assert(relaxed(X,B,a,b,W)>=truth);}
 #pragma omp parallel for schedule(dynamic,1)
 for(size_t i=0;i<cases.size();i++){auto [seed,a,b]=cases[i];MT m(seed);auto score=relaxed(C,m,a,b,W);assert(score!=NONE);
 #pragma omp critical
 {cout<<seed<<","<<a<<","<<b<<","<<score<<"\n"<<flush;}}
}
