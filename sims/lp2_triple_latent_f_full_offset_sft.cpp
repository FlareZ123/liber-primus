// Full-evidence latent-F likelihood: exact uniform-placement mixture, no held-out original.
// Inputs: eight fresh full-offset fixtures. Gate first, original unscored if calibration fails.
// Build: g++ -O3 -std=c++17 -pthread <this file>
#include <algorithm>
#include <array>
#include <atomic>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <sstream>
#include <string>
#include <thread>
#include <vector>
using namespace std;
constexpr int Q=29,W=32;
using V=array<double,W>;
using Mat=array<double,Q*W>;
using Tape=vector<int>;
using Triple=array<Tape,3>;
V U; double B[Q][Q]; Mat ones;
vector<int> arr(const string&s,const string&key){
 auto p=s.find("\""+key+"\"");
 assert(p!=string::npos);p=s.find('[',p);
 vector<int> out; int d=0;
 do{char c=s[p];if(c=='[')++d;else if(c==']')--d;
 else if(c>='0'&&c<='9'){int v=0;do{v=v*10+s[p]-'0';++p;}while(s[p]>='0'&&s[p]<='9');out.push_back(v);continue;} ++p;}while(d);
 return out;
}
Triple split(const vector<int>&v){assert(v.size()==376);return {Tape(v.begin(),v.begin()+121),Tape(v.begin()+121,v.begin()+300),Tape(v.begin()+300,v.end())};}
Tape window(const Tape&t,int off,int len){return Tape(t.begin()+off,t.begin()+off+len);}
int mod(int x){return (x+Q)%Q;}
struct Node{
 int code=-1,c=-1;bool terminal=false;vector<int> next;
 V first{};Mat tr{};
};
struct Trie{
 vector<Node> n; int masks=0; double single=0;
 Trie(const Tape&t){
  V prev{},dst{};
  for(int p=0;p<Q;p++)prev[p]=U[p]*(p?1:(t[0]==0?Q:0));
  for(size_t i=1;i<t.size();i++){dst.fill(0);
   for(int p=0;p<Q;p++)for(int j=0;j<Q;j++)dst[p]+=prev[j]*B[j][p];
   dst[0]*=t[i]==0?Q:0;prev=dst;
  }single=log(accumulate(prev.begin(),prev.end(),0.0));
  int z=count(t.begin(),t.end(),0);assert(z<20);masks=1<<z;n.emplace_back();
  for(int mask=0;mask<masks;mask++){
   vector<array<int,3>> g;int held=0,j=0;
   for(int c:t){bool hold=(c==0&&(mask&(1<<j)));if(c==0)j++;if(hold)held++;else{g.push_back({c,held,0});held=0;}}
   assert(!g.empty());g.back()[2]=held;
   int par=0;
   for(auto a:g){
    int c=a[0],h=a[1],tail=a[2],code=(c*128+h)*128+tail,cur=-1;
    for(int x:n[par].next)if(n[x].code==code){cur=x;break;}
    if(cur<0){
     cur=n.size();int pc=n[par].c;n.emplace_back();n[par].next.push_back(cur);
     Node&v=n[cur];v.code=code;v.c=c;
     const double scale=pow(double(Q),h+1+tail);
     auto trail=[&](int p){return tail?B[p][0]*pow(B[0][0],tail-1):1.0;};
     for(int k=0;k<Q;k++){
      int p=mod(c-k);if(!p)continue;
      if(!par)v.first[k]=scale*(h?U[0]*pow(B[0][0],h-1)*B[0][p]:U[p])*trail(p);
      else for(int l=0;l<Q;l++){
       int s=mod(pc-l);if(!s)continue;
       v.tr[l*W+k]=scale*(h?B[s][0]*pow(B[0][0],h-1)*B[0][p]:B[s][p])*trail(p);
      }
     }
    }par=cur;
   }n[par].terminal=true;
  }
  for(auto&v:n)if(v.terminal)assert(v.next.empty());
 }
};
struct Eval{double lr=0;long long leaves=0,steps=0;};
void walk(const Trie&a,const Trie&b,const Trie&c,int ia,int ib,int ic,const V&prev,Eval&e){
 const Node&A=a.n[ia],&D=b.n[ib],&C=c.n[ic];
 if(A.terminal&&D.terminal&&C.terminal){e.lr+=accumulate(prev.begin(),prev.end(),0.0);++e.leaves;return;}
 const int na=A.terminal?1:A.next.size(),nb=D.terminal?1:D.next.size(),nc=C.terminal?1:C.next.size();
 for(int i=0;i<na;i++)for(int j=0;j<nb;j++)for(int k=0;k<nc;k++){
  int xa=A.terminal?ia:A.next[i],xb=D.terminal?ib:D.next[j],xc=C.terminal?ic:C.next[k];
  const Mat &ma=A.terminal?ones:a.n[xa].tr,&mb=D.terminal?ones:b.n[xb].tr,&mc=C.terminal?ones:c.n[xc].tr;
  alignas(64) V next{};
  for(int l=0;l<Q;l++){
   double w=prev[l]/Q;int off=l*W;
   for(int r=0;r<W;r++)next[r]+=w*ma[off+r]*mb[off+r]*mc[off+r];
  }++e.steps;walk(a,b,c,xa,xb,xc,next,e);
 }
}
Eval joint(const Trie&a,const Trie&b,const Trie&c){
 Eval e;
 for(int x:a.n[0].next)for(int y:b.n[0].next)for(int z:c.n[0].next){
  V p{};for(int k=0;k<Q;k++)p[k]=a.n[x].first[k]*b.n[y].first[k]*c.n[z].first[k]/Q;
  ++e.steps;walk(a,b,c,x,y,z,p,e);
 }
 assert(e.leaves==1LL*a.masks*b.masks*c.masks);assert(isfinite(e.lr)&&e.lr>0);return e;
}
struct Score{int a,b;double bf;long long leaves,steps;};
Score score(const Triple&t,int a,int b,int len){
 Trie x(window(t[0],a,len)),y(window(t[1],b,len)),z(window(t[2],0,len));auto e=joint(x,y,z);return{a,b,log(e.lr)-x.single-y.single-z.single,e.leaves,e.steps};
}
struct Result{int a,b,rank;double best,mixture,posterior,seconds;long long leaves,steps;};
Result sweep(const Triple&t,int ta,int tb){
 auto start=chrono::steady_clock::now();
 vector<Trie>A,Bb;A.reserve(46);Bb.reserve(104);
 for(int i=0;i<46;i++)A.emplace_back(window(t[0],i,76));
 for(int i=0;i<104;i++)Bb.emplace_back(window(t[1],i,76));
 Trie C(window(t[2],0,76));vector<Score> s(4784);atomic<int> cur{0};
 auto work=[&](){for(;;){int id=cur.fetch_add(1);if(id>=4784)return;int a=id/104,b=id%104;auto e=joint(A[a],Bb[b],C);s[id]={a,b,log(e.lr)-A[a].single-Bb[b].single-C.single,e.leaves,e.steps};}};
 vector<thread> th;int nt=max(1u,min(4u,thread::hardware_concurrency()));for(int i=0;i<nt;i++)th.emplace_back(work);for(auto&x:th)x.join();
 long long leaves=0,steps=0;for(auto&x:s){leaves+=x.leaves;steps+=x.steps;}
 stable_sort(s.begin(),s.end(),[](auto&x,auto&y){return x.bf>y.bf;});
 auto top=s.front();int rank=-1;for(int i=0;i<4784;i++)if(s[i].a==ta&&s[i].b==tb)rank=i+1;
 double mass=0;for(auto&x:s)mass+=exp(x.bf-top.bf);double secs=chrono::duration<double>(chrono::steady_clock::now()-start).count();
 return {top.a,top.b,rank,top.bf,top.bf+log(mass/4784),1/mass,secs,leaves,steps};
}
string json(const Result&r){ostringstream o;o<<setprecision(12)<<"{\"a\":"<<r.a<<",\"b\":"<<r.b<<",\"true_rank\":"<<r.rank<<",\"best_bf\":"<<r.best<<",\"mixture_bf\":"<<r.mixture<<",\"best_posterior\":"<<r.posterior<<",\"mask_triples\":"<<r.leaves<<",\"trie_steps\":"<<r.steps<<",\"seconds\":"<<r.seconds<<"}";return o.str();}
int main(){
 ifstream f("im-results/lp2-triple-latent-f-full-offset-fixtures.json");assert(f);string s((istreambuf_iterator<char>(f)),{});
 auto u=arr(s,"n1"),b=arr(s,"n2");assert(u.size()==29&&b.size()==841);double N=accumulate(u.begin(),u.end(),0.0);
 for(int p=0;p<Q;p++)U[p]=(u[p]+.5)/(N+14.5);
 for(int p=0;p<Q;p++){double row=accumulate(b.begin()+p*Q,b.begin()+(p+1)*Q,0.0);for(int q=0;q<Q;q++)B[p][q]=(b[p*Q+q]+12*U[q])/(row+12);}
 for(int p=0;p<Q;p++)for(int q=0;q<Q;q++)ones[p*W+q]=1;
 int aligned=0,ph=0,nh=0;vector<string> rows;auto i=s.find("\"controls\"");
 for(int t=0;t<8;t++){
  i=s.find('{',i);auto j=s.find('}',i);string x=s.substr(i,j-i+1);i=j+1;auto off=arr(x,"off");assert(off.size()==3);
  auto p=sweep(split(arr(x,"positive")),off[0],off[1]);aligned+=p.rank==1;ph+=p.mixture>0;
  cout<<"positive "<<t<<" "<<json(p)<<endl;
  auto n=sweep(split(arr(x,"negative")),-1,-1);nh+=n.mixture<=0;
  cout<<"negative "<<t<<" "<<json(n)<<endl;
  rows.push_back("{\"trial\":"+to_string(t)+",\"positive\":"+json(p)+",\"negative\":"+json(n)+"}");
 }
 bool pass=aligned>=6&&ph>=6&&nh>=6;cout<<"gate "<<aligned<<" "<<ph<<" "<<nh<<" "<<pass<<endl;
 string orig="null";if(pass){orig=json(sweep(split(arr(s,"original")),-1,-1));cout<<"original "<<orig<<endl;}
 ostringstream out;out<<"{\"controls\":[";for(int i=0;i<8;i++){if(i)out<<",";out<<rows[i];}out<<"],\"gate\":{\"aligned\":"<<aligned<<",\"positive_mixture\":"<<ph<<",\"negative_mixture\":"<<nh<<",\"pass\":"<<(pass?"true":"false")<<"},\"original\":"<<orig<<"}";
 cout<<out.str()<<endl;if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<out.str()<<endl;}
}
