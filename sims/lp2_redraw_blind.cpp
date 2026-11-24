#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <map>
#include <numeric>
#include <random>
#include <string>
#include <vector>
#include <thread>
#include <tuple>
#include <stdexcept>
using namespace std;
constexpr int A=29, M=26; constexpr float NEG=-1e20f;
using V=vector<int>; using K=array<int,13>;
const string chars="abcdefghijklmnopqrstuvwxyzABC";
int mod(int x){return x<0?x+29:x>=29?x-29:x;}
string enc(const V&v){string s;for(int x:v)s+=chars.at(x);return s;}
V dec(const string&s){V v;for(char c:s)v.push_back(int(chars.find(c)));return v;}
bool original(const string&name){return !name.empty()&&name[0]=='p'&&name.find('-')!=string::npos;}
string keystr(const K&k,int q){return enc(V(k.begin(),k.begin()+q));}
string canon(const K&k,int q){auto s=keystr(k,q),b=s;for(int j=1;j<q;j++)b=min(b,s.substr(j)+s.substr(0,j));return b;}
struct LM {
 array<float,A> u{}; array<float,A*A> b{}; array<float,A*A*A> t{};
 LM(const map<string,V>& data,const string& exclude){
   array<double,A> uc{};array<double,A*A> bc{};array<double,A*A*A> tc{};array<double,A> bn{};array<double,A*A> tn{};double n=0;
   for(auto&[name,p]:data)if(name!=exclude&&!original(name)){
    for(size_t i=0;i<p.size();i++){int z=p[i];uc[z]++;n++;if(i){bc[p[i-1]*A+z]++;bn[p[i-1]]++;}if(i>=2){int ab=p[i-2]*A+p[i-1];tc[ab*A+z]++;tn[ab]++;}}
   }
   array<double,A> up{};array<double,A*A> bp{};
   for(int z=0;z<A;z++){up[z]=(uc[z]+.5)/(n+.5*A);u[z]=log(up[z]);}
   for(int x=0;x<A;x++)for(int z=0;z<A;z++){int ix=x*A+z;bp[ix]=(bc[ix]+6*up[z])/(bn[x]+6);b[ix]=log(bp[ix]);}
   for(int a=0;a<A;a++)for(int b0=0;b0<A;b0++)for(int z=0;z<A;z++){int ab=a*A+b0;t[ab*A+z]=log((tc[ab*A+z]+8*bp[b0*A+z])/(tn[ab]+8));}
 }
};
struct Tape {V c;int q,n;const LM&lm;array<int,13> prev1{},prev2{},next1{},next2{};V delta;
 Tape(V c_,int q_,const LM&l):c(move(c_)),q(q_),n(int(c.size())),lm(l){for(int j=0;j<q;j++){prev1[j]=(j+q-1)%q;prev2[j]=(j+q-2)%q;next1[j]=(j+1)%q;next2[j]=(j+2)%q;}delta.resize(n);for(int i=1;i<n;i++)delta[i]=mod(c[i]-c[i-1]);}
 static constexpr float lognormal=-1.6094379124f, logskip=-.2231435513f;
 // Compact state (outgoing phase, last consumption minus one).
 template<bool trace=false> float solve(const K&k,int start,int end,int initial=-1,V* decoded=nullptr,V* skips=nullptr,int* endstate=nullptr)const{
   float cur[M],nxt[M];int diff[13],v0[13],v1[13],v2[13];
   vector<array<int8_t,M>> back;
   if constexpr(trace)back.resize(end-start);
   for(int j=0;j<q;j++)diff[j]=mod(k[next1[j]]-k[j]);
   fill(cur,cur+2*q,NEG);
   int from=start;
   if(start==0){for(int j=0;j<q;j++)cur[2*j]=lm.u[mod(c[0]-k[prev1[j]])];from=1;}
   else cur[initial]=0;
   if(from<end){for(int j=0;j<q;j++){v1[j]=mod(c[from-1]-k[prev1[j]]);if(from>=2)v2[j]=mod(c[from-2]-k[prev1[j]]);}}
   for(int i=from;i<end;i++){
     for(int j=0;j<q;j++)v0[j]=mod(c[i]-k[prev1[j]]);
     fill(nxt,nxt+2*q,NEG);
     const float penalty=delta[i]==0?lognormal:0;
     for(int j=0;j<q;j++){
       int j1=next1[j],j2=next2[j],z1=v0[j1],z2=v0[j2],b=v1[j];
       const bool can=delta[i]==diff[j];
       if(i==1){float s=cur[2*j]+lm.b[b*A+z1]+penalty;nxt[2*j1]=s;if constexpr(trace)back[i-start][2*j1]=2*j;
         if(can){nxt[2*j2+1]=cur[2*j]+lm.b[b*A+z2]+logskip;if constexpr(trace)back[i-start][2*j2+1]=2*j;}}
       else{
        int a1=v2[prev1[j]],a2=v2[prev2[j]];
        int idx1=(a1*A+b)*A,idx2=(a2*A+b)*A;
        float s1=cur[2*j]+lm.t[idx1+z1],s2=cur[2*j+1]+lm.t[idx2+z1];
        nxt[2*j1]=max(s1,s2)+penalty;if constexpr(trace)back[i-start][2*j1]=2*j+(s2>s1);
        if(can){s1=cur[2*j]+lm.t[idx1+z2];s2=cur[2*j+1]+lm.t[idx2+z2];nxt[2*j2+1]=max(s1,s2)+logskip;if constexpr(trace)back[i-start][2*j2+1]=2*j+(s2>s1);}
       }
     }
     copy(nxt,nxt+2*q,cur);copy(v1,v1+q,v2);copy(v0,v0+q,v1);
   }
   int best=int(max_element(cur,cur+2*q)-cur);if(endstate)*endstate=best;
   if constexpr(trace){decoded->resize(end-start);skips->resize(end-start);int s=best;
     for(int i=end-1;i>=start;i--){int j=s/2;(*decoded)[i-start]=mod(c[i]-k[prev1[j]]);(*skips)[i-start]=s%2;
       if(i>0)s=back[i-start][s];}
     int j=start?initial/2:prev1[s/2];
     for(int i=start;i<end;i++){int x=mod((*decoded)[i-start]+k[j]);j=next1[j];if((*skips)[i-start]){if(i==0||x!=c[i-1])throw runtime_error("illegal redraw");x=mod((*decoded)[i-start]+k[j]);j=next1[j];}if(x!=c[i])throw runtime_error("bad replay");}
     if(j!=best/2)throw runtime_error("bad final phase");
   }
   return cur[best];
 }
 float score(const K&k,int cut)const{return solve<false>(k,0,cut);}
};
V plant(const V&p,const K&k,int q){V c;int j=0;for(int i=0;i<int(p.size());i++){int z=mod(p[i]+k[j]);j=(j+1)%q;if(i&&z==c.back()&&i%5!=0){z=mod(p[i]+k[j]);j=(j+1)%q;}c.push_back(z);}return c;}
struct Candidate{K k{};float s=NEG;int evals=0;};
Candidate climb(const Tape&t,int cut,K k,mt19937&r,int maxSweeps){float s=t.score(k,cut);int ne=1,q=t.q;V ord(q);iota(ord.begin(),ord.end(),0);
 for(int sweep=0;sweep<maxSweeps;sweep++){bool changed=false;shuffle(ord.begin(),ord.end(),r);for(int j:ord){int old=k[j],best=old;float hi=s;
   for(int a=0;a<A;a++)if(a!=old){k[j]=a;float v=t.score(k,cut);ne++;if(v>hi+1e-4f){hi=v;best=a;}}
   k[j]=best;if(best!=old){s=hi;changed=true;}
 }if(!changed)break;}
 return {k,s,ne};}
struct SearchResult{Candidate best;int evals;int recovered;int restarts;};
SearchResult search(const Tape&t,int cut,int restarts,int workers,uint32_t seed,const K* truth=nullptr){
 vector<Candidate> bests(workers);vector<int> evals(workers),wins(workers),counts(workers);vector<thread> pool;
 for(int w=0;w<workers;w++)pool.emplace_back([&,w](){mt19937 r(seed+uint32_t(w)*0x9e3779b9u);uniform_int_distribution<int> uni(0,A-1);Candidate best;
  for(int ix=w;ix<restarts;ix+=workers){K k{};if(counts[w]%4==0||best.s==NEG){for(int j=0;j<t.q;j++)k[j]=uni(r);}else{k=best.k;int m=2+int(r()%3);for(int j=0;j<m;j++)k[r()%t.q]=uni(r);}
   auto z=climb(t,cut,k,r,12);evals[w]+=z.evals;counts[w]++;if(truth&&canon(z.k,t.q)==canon(*truth,t.q))wins[w]++;if(z.s>best.s)best=z;
  }bests[w]=best;});
 for(auto&th:pool)th.join();Candidate best=*max_element(bests.begin(),bests.end(),[](auto&a,auto&b){return a.s<b.s;});return {best,accumulate(evals.begin(),evals.end(),0),accumulate(wins.begin(),wins.end(),0),accumulate(counts.begin(),counts.end(),0)};
}
int main(int argc,char**argv){int restarts=argc>1?stoi(argv[1]):32,workers=argc>2?stoi(argv[2]):4;string which=argc>3?argv[3]:"all";map<string,V> data;string name,s;while(cin>>name>>s)data[name]=dec(s);
 vector<tuple<string,int,K,int>> cases;
 K k8a={17,8,3,27,11,24,6,1},k8b={3,8,12,4,15,22,19,0},k13a={9,23,14,2,12,6,28,17,8,16,3,25,11},k13b={3,8,12,4,15,22,19,0,7,14,23,5,26};
 cases.push_back({"0_welcome",8,k8a,365});cases.push_back({"0_loss_of_divinity",8,k8b,500});cases.push_back({"0_koan_1",13,k13a,500});cases.push_back({"0_loss_of_divinity",13,k13b,500});
 cases.push_back({"p0-2",8,K{},500});cases.push_back({"p0-2",13,K{},500});cases.push_back({"p54-55",8,K{},208});cases.push_back({"p54-55",13,K{},208});
 for(auto&[name,p]:data)if(original(name)&&name!="p0-2"&&name!="p54-55")for(int q:{8,13})cases.push_back({name,q,K{},int(p.size()*2/3)});
 cout<<fixed<<setprecision(6);
 for(int ix=0;ix<int(cases.size());ix++){auto [n,q,truth,cut]=cases[ix];bool orig=original(n);if(which=="controls"&&orig)continue;if(which=="original"&&!orig)continue;if(which!="all"&&which!="controls"&&which!="original"&&stoi(which)!=ix)continue;
  auto& p=data.at(n);V c=orig?p:plant(p,truth,q);LM lm(data,orig?"":n);Tape t(c,q,lm);auto begin=chrono::steady_clock::now();
  auto r=search(t,cut,restarts,workers,0x74cd53afu+ix*1234567u,orig?nullptr:&truth);V train,hold,sk1,sk2;int boundary;float a=t.solve<true>(r.best.k,0,cut,-1,&train,&sk1,&boundary),b=t.solve<true>(r.best.k,cut,t.n,boundary,&hold,&sk2);
  int ct=-1,ch=-1,oracleHold=-1;float oracle=0;if(!orig){ct=inner_product(train.begin(),train.end(),p.begin(),0,plus<>(),equal_to<>());ch=inner_product(hold.begin(),hold.end(),p.begin()+cut,0,plus<>(),equal_to<>());V x,y,z,w;int j;oracle=t.solve<true>(truth,0,cut,-1,&x,&z,&j);t.solve<true>(truth,cut,t.n,j,&y,&w);oracleHold=inner_product(y.begin(),y.end(),p.begin()+cut,0,plus<>(),equal_to<>());}
  cout<<"case "<<ix<<" "<<n<<" q="<<q<<" n="<<t.n<<" cut="<<cut<<" restarts="<<r.restarts<<" evals="<<r.evals<<" key="<<keystr(r.best.k,q)<<" canonical="<<canon(r.best.k,q)<<" truth="<<(orig?"NA":canon(truth,q))<<" correct_key="<<(!orig&&canon(r.best.k,q)==canon(truth,q))<<" key_hits="<<r.recovered<<" train="<<a/cut<<" hold="<<b/(t.n-cut)<<" correct_train="<<ct<<" correct_hold="<<ch<<" oracle_train="<<(orig?0:oracle/cut)<<" oracle_hold="<<oracleHold<<" redraw_train="<<accumulate(sk1.begin(),sk1.end(),0)<<" redraw_hold="<<accumulate(sk2.begin(),sk2.end(),0)<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-begin).count()<<"\n";cout<<"hold_preview="<<enc(V(hold.begin(),hold.begin()+min(100,int(hold.size()))))<<"\n"<<flush;
 }
}
