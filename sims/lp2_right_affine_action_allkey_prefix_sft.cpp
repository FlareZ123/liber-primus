// Exact all noncommuting GP29 affine right-action pairs and all initial alphabets.
// Prefix thresholds are fixed on independent native GP and literary reference windows.
// Build: g++ -std=c++17 -O3 -pthread ...
#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cstdlib>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>
using namespace std;
constexpr int Q=29,M=812,TRI=24389,NEG=-1000000000;
int md(int x){int y=x%Q;return y<0?y+Q:y;}
int id(int a,int b){return (a-1)*Q+b;}
int aa(int i){return i/Q+1;}
int bb(int i){return i%Q;}
int inv[Q],cls[Q],lens[3],floorScore[3];
array<int16_t,TRI> sc;
array<array<uint16_t,M>,M> nxt;
array<array<uint8_t,M>,Q> decodeTable,enc;
array<array<int,Q*Q>,33> tail;
struct Data{string name;vector<int> c,p;int train;bool plant;array<int,3> truth;};
struct Key{int u=-1,v=-1,iv=-1;bool valid()const{return u>=0;}};
struct Stats{
 uint64_t tested=0,steps32=0,pass32=0,pass64=0,pass128=0;
 int max32=NEG,max64=NEG,max128=NEG,bestTrain=NEG,secondTrain=NEG;Key best;
};
void init(){
 for(int a=1;a<Q;a++)for(int b=1;b<Q;b++)if(md(a*b)==1)inv[a]=b;
 for(int s=0;s<M;s++){
  int A=aa(s),B=bb(s);
  for(int x=0;x<Q;x++){decodeTable[x][s]=md(inv[A]*(x-B));enc[x][s]=md(A*x+B);}
  for(int k=0;k<M;k++)nxt[k][s]=id(md(A*aa(k)),md(A*bb(k)+B));
 }
 tail[0].fill(0);
 for(int n=1;n<=32;n++)for(int x=0;x<Q;x++)for(int y=0;y<Q;y++){
  int zmax=NEG;for(int z=0;z<Q;z++)zmax=max(zmax,int(sc[(x*Q+y)*Q+z])+tail[n-1][y*Q+z]);tail[n][x*Q+y]=zmax;
 }
}
bool noncomm(int u,int v){return md(aa(u)*bb(v)+bb(u))!=md(aa(v)*bb(u)+bb(v));}
vector<int> transform(const vector<int>& t,Key k,bool encrypt){
 int s=k.iv;vector<int> out;out.reserve(t.size());for(int x:t){int p=encrypt?x:decodeTable[x][s];out.push_back(encrypt?enc[p][s]:p);s=nxt[cls[p]?k.v:k.u][s];}return out;
}
int rangeScore(const vector<int>& p,int start,int end){int sum=0;for(int i=start+2;i<end;i++)sum+=sc[(p[i-2]*Q+p[i-1])*Q+p[i]];return sum;}
void rankOne(Stats& st,int score,Key k){
 if(score>st.bestTrain){st.secondTrain=st.bestTrain;st.bestTrain=score;st.best=k;}
 else if(score>st.secondTrain)st.secondTrain=score;
}
Stats run(const Data& d){
 atomic<int> nextU{0};unsigned nt=max(1u,min(8u,thread::hardware_concurrency()));vector<Stats> local(nt);vector<thread> workers;
 for(unsigned tid=0;tid<nt;tid++)workers.emplace_back([&,tid]{
  Stats& st=local[tid];int u;
  while((u=nextU.fetch_add(1))<M){
   const uint16_t* t0=nxt[u].data();
   for(int v=0;v<M;v++){
    if(!noncomm(u,v))continue;const uint16_t* t1=nxt[v].data();const uint16_t* ts[2]={t0,t1};
    for(int iv=0;iv<M;iv++){
     st.tested++;int state=iv;
     int x=decodeTable[d.c[0]][state];state=ts[cls[x]][state];
     int y=decodeTable[d.c[1]][state];state=ts[cls[y]][state];
     int sum=0,i=2;
     // Exact unconstrained suffix upper bound. No admissible prefix is pruned.
     for(;i<32;i++){
      int z=decodeTable[d.c[i]][state];state=ts[cls[z]][state];sum+=sc[(x*Q+y)*Q+z];x=y;y=z;st.steps32++;
      if(sum+tail[31-i][x*Q+y]<floorScore[0])break;
     }
     if(i<32)continue;
     st.pass32++;st.max32=max(st.max32,sum);
     for(;i<64;i++){int z=decodeTable[d.c[i]][state];state=ts[cls[z]][state];sum+=sc[(x*Q+y)*Q+z];x=y;y=z;}
     st.max64=max(st.max64,sum);if(sum<floorScore[1])continue;st.pass64++;
     for(;i<128;i++){int z=decodeTable[d.c[i]][state];state=ts[cls[z]][state];sum+=sc[(x*Q+y)*Q+z];x=y;y=z;}
     st.max128=max(st.max128,sum);if(sum<floorScore[2])continue;st.pass128++;
     for(;i<d.train;i++){int z=decodeTable[d.c[i]][state];state=ts[cls[z]][state];sum+=sc[(x*Q+y)*Q+z];x=y;y=z;}
     rankOne(st,sum,{u,v,iv});
    }
   }
  }
 });
 for(auto& w:workers)w.join();Stats out;
 for(auto& a:local){
  out.tested+=a.tested;out.steps32+=a.steps32;out.pass32+=a.pass32;out.pass64+=a.pass64;out.pass128+=a.pass128;
  out.max32=max(out.max32,a.max32);out.max64=max(out.max64,a.max64);out.max128=max(out.max128,a.max128);
  if(a.best.valid())rankOne(out,a.bestTrain,a.best);out.secondTrain=max(out.secondTrain,a.secondTrain);
 }
 if(out.tested!=516266352ULL)throw runtime_error("incomplete key domain");return out;
}
string keyJson(Key k){ostringstream s;s<<"[["<<aa(k.u)<<","<<bb(k.u)<<"],["<<aa(k.v)<<","<<bb(k.v)<<"],["<<aa(k.iv)<<","<<bb(k.iv)<<"]]";return s.str();}
string compact(const vector<int>& p){string s;s.reserve(p.size());for(int x:p)s+="0123456789abcdefghijklmnopqrs"[x];return s;}
string nullable(int x){return x==NEG?"null":to_string(x);}
int main(){
 ifstream in("im-results/lp2-right-affine-action-allkey-prefix-input.txt");if(!in)throw runtime_error("missing input");
 for(int& x:lens)in>>x;for(int& x:floorScore)in>>x;for(int& x:cls)in>>x;
 if(lens[0]!=32||lens[1]!=64||lens[2]!=128)throw runtime_error("wrong gate lengths");
 for(auto& x:sc){int q;in>>q;if(q>0||q<-32768)throw runtime_error("score range");x=q;}
 int n;in>>n;vector<Data> ds(n);
 for(auto& d:ds){int len,flag;in>>d.name>>len>>d.train>>flag;d.plant=flag;if(d.train<128||d.train>=len)throw runtime_error("bad frame");
  if(d.plant){for(int& k:d.truth){int a,b;in>>a>>b;k=id(a,b);}}
  d.c.resize(len);for(int& x:d.c){in>>x;if(x<0||x>=Q)throw runtime_error("invalid cipher");}
  if(d.plant){d.p.resize(len);for(int& x:d.p){in>>x;if(x<0||x>=Q)throw runtime_error("invalid plain");}}
 }
 if(!in)throw runtime_error("truncated input");init();
 ostringstream out;out<<"{\"domain\":516266352,\"floor\":["<<floorScore[0]<<","<<floorScore[1]<<","<<floorScore[2]<<"],\"datasets\":[";
 for(int k=0;k<n;k++){const Data& d=ds[k];auto start=chrono::steady_clock::now();
  if(d.plant){Key actual{d.truth[0],d.truth[1],d.truth[2]};if(transform(d.p,actual,true)!=d.c)throw runtime_error("plant forward mismatch");for(int j=0;j<3;j++)if(rangeScore(d.p,0,lens[j])<floorScore[j])throw runtime_error("plant outside native floor");}
  Stats a=run(d);double elapsed=chrono::duration<double>(chrono::steady_clock::now()-start).count();
  if(k)out<<",";out<<"{\"name\":\""<<d.name<<"\",\"tested\":"<<a.tested<<",\"steps32\":"<<a.steps32<<",\"pass32\":"<<a.pass32<<",\"pass64\":"<<a.pass64<<",\"pass128\":"<<a.pass128<<",\"max32_if_pass\":"<<nullable(a.max32)<<",\"max64_over_pass32\":"<<nullable(a.max64)<<",\"max128_over_pass64\":"<<nullable(a.max128)<<",\"elapsed_seconds\":"<<elapsed;
  if(a.best.valid()){
   auto p=transform(d.c,a.best,false);if(transform(p,a.best,true)!=d.c)throw runtime_error("forward replay");
   if(rangeScore(p,0,d.train)!=a.bestTrain)throw runtime_error("train score mismatch");
   out<<",\"best\":{\"key\":"<<keyJson(a.best)<<",\"train\":"<<a.bestTrain<<",\"second_train\":"<<nullable(a.secondTrain)<<",\"held\":"<<rangeScore(p,d.train,p.size())<<",\"train_mean\":"<<double(a.bestTrain)/(256*(d.train-2))<<",\"held_mean\":"<<double(rangeScore(p,d.train,p.size()))/(256*(p.size()-d.train-2))<<",\"decoded\":\""<<compact(p)<<"\"";
   if(d.plant){size_t recovered=0;for(size_t i=0;i<p.size();i++)recovered+=(p[i]==d.p[i]);bool exact=a.best.u==d.truth[0]&&a.best.v==d.truth[1]&&a.best.iv==d.truth[2];out<<",\"actual\":"<<keyJson({d.truth[0],d.truth[1],d.truth[2]})<<",\"exact_key\":"<<(exact?"true":"false")<<",\"recovered\":"<<recovered;if(!exact||recovered!=p.size())throw runtime_error("blind plant recovery failed");}
   out<<"}";
  }else{out<<",\"best\":null";if(d.plant)throw runtime_error("plant pruned");}
  out<<"}";cerr<<d.name<<" checked "<<a.tested<<" pass32 "<<a.pass32<<" pass64 "<<a.pass64<<" pass128 "<<a.pass128<<" seconds "<<elapsed<<"\n";
 }
 out<<"]}\n";cout<<out.str();if(const char* file=getenv("SFT_OUTPUT")){ofstream f(file);f<<out.str();}
}
