#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <random>
#include <sstream>
#include <string>
#include <tuple>
#include <vector>
using namespace std;
using U=uint32_t;
struct Tape { vector<int> c,d; };
struct Item { int pos,q; };
struct Frame { vector<Item> blocked; bool done=false; U rows=0; int far=0; };
struct Counters { uint64_t nodes=0, dead=0, domain=0, hall=0, relaxed=0, leaves=0, branches=0, checks=0; int depth=0; };
struct Solver {
 int n; U all; vector<Tape> tapes; array<int,29> key; array<int,29> inverse;
 U used=0,assigned=0; vector<Frame> frames; Counters count; uint64_t cap; bool limited=false,stopFirst=true; int relaxDepth=21; uint64_t solutionCount=0;
 vector<int> witness; vector<vector<U>> seen; array<array<U,256>,4> pre{};
 chrono::steady_clock::time_point start; double seconds=0,timeCap=0;
 Solver(int alphabet,const vector<vector<int>>& raw,uint64_t nodeLimit=1000000,double sec=0):n(alphabet),all((U(1)<<n)-1),cap(nodeLimit),timeCap(sec){
   assert(n>=2&&n<=29);key.fill(-1);inverse.fill(-1);
   for(auto c:raw){assert(!c.empty()); Tape t; t.c=move(c);t.d.resize(t.c.size());for(size_t j=1;j<t.c.size();j++) t.d[j]=(t.c[j]-t.c[j-1]+n)%n;tapes.push_back(move(t));}
   frames.resize(tapes.size()); seen.resize(tapes.size());for(size_t i=0;i<tapes.size();i++)seen[i].resize(tapes[i].c.size());
 }
 U bit(int k) const {return U(1)<<k;}
 int pop(U x) const {return __builtin_popcount(x);}
 int low(U x) const {return __builtin_ctz(x);}
 U rotRight(U x,int d) const {return d?((x>>d)|(x<<(n-d)))&all:x;}
 void assign(int q,int k){assert(key[q]<0&&inverse[k]<0);key[q]=k;inverse[k]=q;used|=bit(k);assigned|=bit(q);}
 void unassign(int q,int k){key[q]=-1;inverse[k]=-1;used^=bit(k);assigned^=bit(q);}
 // Each blocked entry is a *consuming* continuation only. Its hold path,
 // if present, has already been explored. Re-exploring a hold on resume is harmless.
 Frame expand(size_t i,const Frame& old,int changed){
   if(old.done)return old;
   const auto& t=tapes[i];auto& seen_i=seen[i];fill(seen_i.begin(),seen_i.end(),0);
   Frame out;out.far=old.far;vector<Item> pending;pending.reserve(old.blocked.size()+8);
   auto push=[&](int pos,int q){if(pos==int(t.c.size())){out.done=true;return;}U b=bit(q);if(!(seen_i[pos]&b)){seen_i[pos]|=b;pending.push_back({pos,q});}};
   for(auto b:old.blocked){if(changed<0||b.q==changed)push(b.pos,b.q);else{seen_i[b.pos]|=bit(b.q);out.blocked.push_back(b);out.rows|=bit(b.q);}}
   while(!pending.empty()&&!out.done){auto [pos,q]=pending.back();pending.pop_back();out.far=max(out.far,pos);int k=key[q];
     if(k<0){out.blocked.push_back({pos,q});out.rows|=bit(q);}
     else{int p=(t.d[pos]+k)%n;if(p)push(pos+1,p);}
     if(t.c[pos]==0)push(pos+1,q);
   }
   if(out.done){out.rows=0;out.blocked.clear();out.far=int(t.c.size());}
   return out;
 }
 // Recompute using no stale blocked-state flags from root, for controls/fixed keys.
 void initialize(){for(size_t i=0;i<tapes.size();i++){if(tapes[i].c.size()==1){frames[i].done=true;frames[i].far=1;continue;}Frame f;f.rows=1;f.blocked.push_back({1,0});frames[i]=expand(i,f,-1);}}
 bool match_rec(int q,array<int,29>& m,U& visited,const array<U,29>& dom){U x=dom[q]&~visited;while(x){int k=low(x);x&=x-1;visited|=bit(k);if(m[k]<0||match_rec(m[k],m,visited,dom)){m[k]=q;return true;}}return false;}
 bool hall(const array<U,29>& dom){array<int,29> m;m.fill(-1);vector<int> qs;for(int q=0;q<n;q++)if(key[q]<0)qs.push_back(q);sort(qs.begin(),qs.end(),[&](int a,int b){return pop(dom[a])<pop(dom[b]);});for(int q:qs){U v=0;if(!match_rec(q,m,v,dom))return false;}return true;}
 void build_pre(){for(int b=0;b<4;b++){pre[b][0]=0;for(int x=1;x<256;x++){int k=b*8+__builtin_ctz(unsigned(x));int q=k<n?inverse[k]:-1;pre[b][x]=pre[b][x&(x-1)]|(q>=0?bit(q):0);}}}
 U preimage(U shifts) const {return pre[0][shifts&255]|pre[1][(shifts>>8)&255]|pre[2][(shifts>>16)&255]|pre[3][shifts>>24];}
 // Backward path relaxation: for each unassigned row allow any current-domain
 // shift on each occurrence independently. A real extension is a subcase.
 // For a frame, the union of supported first consuming steps of its exact
 // frontiers is necessary. A single supported row makes that union a key-domain cut.
 bool backward(size_t i,array<U,29>& dom){const auto& f=frames[i];if(f.done)return true;const auto& t=tapes[i];if(f.blocked.empty())return false;
   int left=int(t.c.size());for(auto b:f.blocked)left=min(left,b.pos);
   vector<U> shifts(t.c.size());U reachable=all;
   for(int pos=int(t.c.size())-1;pos>=left;pos--){U a=rotRight(reachable&~U(1),t.d[pos]);shifts[pos]=a;U prev=preimage(a);U qmask=all&~assigned;while(qmask){int q=low(qmask);qmask&=qmask-1;if(dom[q]&a)prev|=bit(q);}if(t.c[pos]==0)prev|=reachable;reachable=prev;}
   array<U,29> support{};U rows=0;for(auto b:f.blocked){U a=shifts[b.pos]&dom[b.q];if(a){support[b.q]|=a;rows|=bit(b.q);}}
   if(!rows)return false;
   if(!(rows&(rows-1))){int q=low(rows);dom[q]&=support[q];if(!dom[q])return false;}
   return true;
 }
 bool dfs(int depth){
   if(++count.nodes>cap||(timeCap>0&&(count.nodes&1023)==0&&chrono::duration<double>(chrono::steady_clock::now()-start).count()>=timeCap)){limited=true;return false;}
   count.depth=max(count.depth,depth);array<U,29> dom{};U free=all&~used;array<int,29> mandatory{},affected{},blocked{};bool allDone=true;
   for(int q=0;q<n;q++)if(key[q]<0)dom[q]=free;
   for(size_t i=0;i<frames.size();i++){
     const auto& f=frames[i];if(f.done)continue;allDone=false;if(f.blocked.empty()){count.dead++;return false;}
     U rows=f.rows;while(rows){int q=low(rows);rows&=rows-1;affected[q]++;}
     for(auto b:f.blocked)blocked[b.q]++;
     if(!(f.rows&(f.rows-1))){int q=low(f.rows);mandatory[q]++;int d=tapes[i].d[f.blocked.front().pos];bool same=true;for(auto b:f.blocked)if(tapes[i].d[b.pos]!=d){same=false;break;}if(same)dom[q]&=~bit((n-d)%n);}
   }
   if(allDone){
     // All remaining assignments extend a genuine legal path on every frame.
     uint64_t f=1;int left=n-depth;for(int a=2;a<=left;a++){if(f>UINT64_MAX/uint64_t(a)){f=UINT64_MAX;break;}f*=a;}solutionCount=solutionCount>UINT64_MAX-f?UINT64_MAX:solutionCount+f;count.leaves++;
     if(witness.empty()){witness.assign(key.begin(),key.begin()+n);U rest=free;for(int q=0;q<n;q++)if(witness[q]<0){int k=low(rest);witness[q]=k;rest&=rest-1;}}
     return stopFirst;
   }
   for(int q=0;q<n;q++)if(key[q]<0&&!dom[q]){count.domain++;return false;}
   if(depth>=relaxDepth){
     count.checks++;build_pre();
     for(size_t i=0;i<frames.size();i++)if(!backward(i,dom)){count.relaxed++;return false;}
     for(int q=0;q<n;q++)if(key[q]<0&&!dom[q]){count.relaxed++;return false;}
   }
   // A full matching is mandatory. Avoid the cost near the top of large domains.
   if(n-depth<=10&&!hall(dom)){count.hall++;return false;}
   int best=-1;
   for(int q=0;q<n;q++)if(key[q]<0&&affected[q]){
     if(best<0||pop(dom[q])<pop(dom[best])||(pop(dom[q])==pop(dom[best])&&make_tuple(mandatory[q],affected[q],blocked[q])>make_tuple(mandatory[best],affected[best],blocked[best])))best=q;
   }
   assert(best>=0);U options=dom[best];
   while(options){int k=low(options);options&=options-1;assign(best,k);count.branches++;vector<pair<int,Frame>> undo;undo.reserve(affected[best]);bool ok=true;
     for(size_t i=0;i<frames.size();i++)if(!frames[i].done&&(frames[i].rows&bit(best))){Frame x=expand(i,frames[i],best);undo.emplace_back(int(i),move(frames[i]));frames[i]=move(x);if(!frames[i].done&&frames[i].blocked.empty()){count.dead++;ok=false;break;}}
     bool found=ok&&dfs(depth+1);
     for(auto& u:undo)frames[u.first]=move(u.second);unassign(best,k);
     if(found)return true;if(limited)return false;
   }
   return false;
 }
 bool solve(const vector<int>& fixed={},bool first=true){stopFirst=first;start=chrono::steady_clock::now();int depth=0;for(int q=0;q<int(fixed.size());q++)if(fixed[q]>=0){assign(q,fixed[q]);depth++;}initialize();bool found=dfs(depth);seconds=chrono::duration<double>(chrono::steady_clock::now()-start).count();return found;}
};
static bool legal(const vector<vector<int>>& frames,const vector<int>& k){int n=k.size();for(auto& f:frames){U s=1;for(size_t i=1;i<f.size();i++){int d=(f[i]-f[i-1]+n)%n;U t=f[i]==0?s:0;while(s){int q=__builtin_ctz(s);s&=s-1;int p=(d+k[q])%n;if(p)t|=U(1)<<p;}s=t;if(!s)return false;}}return true;}
static vector<int> enc(const vector<int>& p,const vector<int>& k,int iv){vector<int> c{iv};int q=0,n=k.size();for(int x:p){if(!x)c.push_back(0);else{c.push_back((c.back()+x-k[q]+n)%n);q=x;}}return c;}
static vector<vector<int>> readFrames(){vector<vector<int>> a;string s;while(cin>>s){vector<int> f;for(char c:s){int q=c<='9'?c-'0':c-'a'+10;assert(q>=0&&q<29);f.push_back(q);}a.push_back(move(f));}return a;}
static void print(const Solver& s){auto c=s.count;cout<<"{\"result\":\""<<(!s.witness.empty()?"sat":s.limited?"unknown":"unsat")<<"\",\"nodes\":"<<c.nodes<<",\"branches\":"<<c.branches<<",\"dead\":"<<c.dead<<",\"domain\":"<<c.domain<<",\"hall\":"<<c.hall<<",\"relaxed\":"<<c.relaxed<<",\"backwardChecks\":"<<c.checks<<",\"depth\":"<<c.depth<<",\"leaves\":"<<c.leaves<<",\"solutionCount\":"<<s.solutionCount<<",\"seconds\":"<<s.seconds<<",\"key\":[";for(size_t i=0;i<s.witness.size();i++){if(i)cout<<',';cout<<s.witness[i];}cout<<"]}"<<endl;}
int main(int argc,char**argv){string mode=argc>1?argv[1]:"controls";if(mode=="controls"){
 mt19937 rng(3045);int trials=0,sat=0,unsat=0;for(int n=3;n<=8;n++){int T=n==8?12:30;for(int t=0;t<T;t++){vector<vector<int>> f(3);for(auto& x:f){int len=3+rng()%10;for(int i=0;i<len;i++)x.push_back(rng()%n);}vector<int> k(n);iota(k.begin(),k.end(),0);uint64_t truth=0;do{truth+=legal(f,k);}while(next_permutation(k.begin(),k.end()));for(int depth:{0,2,n+1}){Solver s(n,f,10000000);s.relaxDepth=depth;s.solve({},false);if(s.limited||s.solutionCount!=truth){cerr<<"failed n="<<n<<" t="<<t<<" relax="<<depth<<" truth="<<truth<<" actual="<<s.solutionCount<<endl;return 1;}}trials++;if(truth)sat++;else unsat++;}}
 // Fixed-key GP29 positive controls and partial-key exact-count comparisons.
 int gp=0;for(int t=0;t<10;t++){vector<int> k(29);iota(k.begin(),k.end(),0);shuffle(k.begin(),k.end(),rng);vector<vector<int>> f;for(int j=0;j<9;j++){vector<int> p(80);for(int& x:p)x=rng()%29;f.push_back(enc(p,k,rng()%29));}assert(legal(f,k));Solver known(29,f);known.relaxDepth=0;known.solve(k);assert(!known.witness.empty()&&legal(f,known.witness));vector<int> fixed=k;vector<int> idx(29);iota(idx.begin(),idx.end(),0);shuffle(idx.begin(),idx.end(),rng);idx.resize(6);sort(idx.begin(),idx.end());vector<int> vals;for(int q:idx){vals.push_back(k[q]);fixed[q]=-1;}sort(vals.begin(),vals.end());uint64_t truth=0;do{auto cand=fixed;for(int z=0;z<6;z++)cand[idx[z]]=vals[z];truth+=legal(f,cand);}while(next_permutation(vals.begin(),vals.end()));Solver s(29,f,10000000);s.relaxDepth=0;s.solve(fixed,false);assert(!s.limited&&s.solutionCount==truth);gp++;}
 cout<<"{\"reducedInstances\":"<<trials<<",\"sat\":"<<sat<<",\"unsat\":"<<unsat<<",\"relaxVariants\":3,\"gp29KnownAndSixUnknown\":"<<gp<<"}"<<endl;return 0;}
 int k0=argc>2?stoi(argv[2]):-1;uint64_t cap=argc>3?stoull(argv[3]):1000000;int relax=argc>4?stoi(argv[4]):21;double sec=argc>5?stod(argv[5]):0;auto f=readFrames();Solver s(29,f,cap,sec);s.relaxDepth=relax;s.solve({k0});if(!s.witness.empty())assert(legal(f,s.witness));print(s);
}
