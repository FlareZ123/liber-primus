// All-initial-list transparent-F prime-position inverse. Sound rank-domain
// state propagation separates every fixed forbidden plaintext-F rank.
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
#ifdef _OPENMP
#include <omp.h>
#endif
using namespace std;
using M=uint32_t;constexpr int N=29;constexpr M all=(M(1)<<N)-1;
using D=array<M,N>;
static M low(int n){return (M(1)<<n)-1;}
static bool one(M x){return x&&!(x&(x-1));}
static bool propagate(D& d){
  // All-different singleton propagation, including contradiction on duplicate singletons.
  M done=0;for(;;){M fixed=0;for(M x:d){if(!x)return false;if(one(x)){if(fixed&x)return false;fixed|=x;}}
    if(fixed==done)return true;done=fixed;for(M& x:d)if(!one(x)){x&=~fixed;if(!x)return false;}}
}
static bool step(D& d,int c,int r,int f,bool prune){
  M a=d[c]&~(M(1)<<f);if(!a)return false;
  int mn=__builtin_ctz(a),mx=31-__builtin_clz(a);M lm=low(mn+1),lx=low(mx),lr=low(r);
  for(int g=0;g<N;++g)if(g!=c){M x=d[g],v=((x&~lm)>>1)|(x&lx);d[g]=(v&lr)|((v&~lr)<<1);if(!d[g])return false;}
  d[c]=M(1)<<r;return !prune||propagate(d);
}
static vector<int> positions(int n){vector<int> p,r;for(int k=2;(int)p.size()<n;++k){bool ok=true;for(int d:p){if(d*d>k)break;if(k%d==0){ok=false;break;}}if(ok){p.push_back(k);r.push_back((k-1)%N);}}assert(p[463]==3301);return r;}
struct State{D d;int t;};
static bool eq(const State&a,const State&b){return a.t==b.t&&a.d==b.d;}
static bool lt(const State&a,const State&b){if(a.t!=b.t)return a.t<b.t;return a.d<b.d;}
static bool exact(const State&s){return all_of(s.d.begin(),s.d.end(),one);}
static void merge(D&a,const D&b){for(int g=0;g<N;++g)a[g]|=b[g];}
struct Result{int f,dead=-1;size_t peak=0,final=0,exactFinal=0,merges=0;uint64_t work=0;};
static Result search(const vector<int>& c,const vector<int>& r,int f,int start,int cursorMin,int cursorMax,size_t cap,bool prune,const vector<State>* truth=nullptr){
  vector<State> states;D full;full.fill(all);for(int t=cursorMin;t<=cursorMax;++t)states.push_back({full,t});Result out;out.f=f;out.peak=states.size();
  for(int i=start;i<(int)c.size()&&!states.empty();++i){int x=c[i];if(x){size_t k=0;for(auto s:states){++out.work;if(step(s.d,x,r[s.t],f,prune)){++s.t;states[k++]=s;}}states.resize(k);}
    else {size_t n=states.size();states.reserve(2*n);for(size_t k=0;k<n;++k){State s=states[k];++out.work;if(step(s.d,0,r[s.t],f,prune)){++s.t;states.push_back(s);}}}
    if(!x||i%64==63){sort(states.begin(),states.end(),lt);states.erase(unique(states.begin(),states.end(),eq),states.end());if(states.size()>cap){size_t k=0;for(auto s:states){if(k&&states[k-1].t==s.t){merge(states[k-1].d,s.d);++out.merges;}else states[k++]=s;}states.resize(k);}}
    out.peak=max(out.peak,states.size());if(states.empty())out.dead=i;
    if(truth){const State& want=(*truth)[i];bool contained=false;for(const State& s:states)if(s.t==want.t){bool ok=true;for(int g=0;g<N;++g)if((s.d[g]&want.d[g])!=want.d[g]){ok=false;break;}if(ok){contained=true;break;}}assert(contained);}
  }
  out.final=states.size();out.exactFinal=count_if(states.begin(),states.end(),exact);return out;
}
static void controls(const vector<int>& r){mt19937 rng(301129);for(int trial=0;trial<6;++trial){vector<int> a(N);iota(a.begin(),a.end(),0);shuffle(a.begin(),a.end(),rng);int t=37+trial*41,f=trial*4;vector<int> c;vector<State> truth;
    for(int i=0;i<350;++i){if(rng()%17==0)c.push_back(0);else{int j=rng()%(N-1);j+=j>=f;int x=a[j];c.push_back(x);a.erase(a.begin()+j);a.insert(a.begin()+r[t++],x);}D d{};for(int j=0;j<N;++j)d[a[j]]=M(1)<<j;truth.push_back({d,t});}
    int o=37+trial*41;auto s=search(c,r,f,0,o-2,o+2,500,true,&truth);assert(s.final>0);}
  cerr<<"six arbitrary-list/rank/cursor F-hold containment controls passed\n";}
int main(int argc,char**argv){if(argc<2)return 2;ifstream f(argv[1]);vector<int> c;char ch;uint32_t hash=2166136261u;while(f>>ch){int x=ch<='9'?ch-'0':ch-'A'+10;assert(x>=0&&x<N);c.push_back(x);hash=(hash^(unsigned char)ch)*16777619u;}assert(c.size()==12956&&hash==0x75f0ccfau);auto r=positions(c.size()+464);controls(r);
  int start=argc>2?stoi(argv[2]):0;size_t cap=argc>3?stoull(argv[3]):5000;bool prune=argc>4?stoi(argv[4]):true;int lo=count_if(c.begin(),c.begin()+start,[](int a){return a!=0;}),hi=463+start;
  array<Result,28> results;auto t=chrono::steady_clock::now();cerr<<"start="<<start<<" cursor="<<lo<<".."<<hi<<" cap="<<cap<<" singleton="<<prune<<"\n";
#pragma omp parallel for schedule(dynamic)
  for(int f=0;f<28;++f){auto v=search(c,r,f,start,lo,hi,cap,prune);results[f]=v;
#pragma omp critical
    cerr<<"f="<<f<<" dead="<<v.dead<<" final="<<v.final<<" exact="<<v.exactFinal<<" peak="<<v.peak<<" merges="<<v.merges<<" work="<<v.work<<"\n";
  }
  cout<<"{\"start\":"<<start<<",\"cursor_min\":"<<lo<<",\"cursor_max\":"<<hi<<",\"cap\":"<<cap<<",\"singleton\":"<<prune<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<",\"results\":[";
  for(int f=0;f<28;++f){auto v=results[f];if(f)cout<<",";cout<<"{\"f\":"<<f<<",\"dead\":"<<v.dead<<",\"final\":"<<v.final<<",\"exact\":"<<v.exactFinal<<",\"peak\":"<<v.peak<<",\"merges\":"<<v.merges<<",\"work\":"<<v.work<<"}";}cout<<"]}"<<endl;return 0;
}
