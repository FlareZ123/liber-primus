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
struct Tape {
 V c;int q,n;const LM&lm;array<int,13> prev1{},prev2{},prev3{},next1{},next2{};V delta;
 Tape(V c_,int q_,const LM&l):c(move(c_)),q(q_),n(int(c.size())),lm(l){for(int j=0;j<q;j++){prev1[j]=(j+q-1)%q;prev2[j]=(j+q-2)%q;prev3[j]=(j+q-3)%q;next1[j]=(j+1)%q;next2[j]=(j+2)%q;}delta.resize(n);for(int i=1;i<n;i++)delta[i]=mod(c[i]-c[i-1]);}
 static constexpr float lognormal=-1.6094379124f, logskip=-.2231435513f;
 // Outgoing phase j, last consumption d=0/1/2, previous-previous hold h.
 // Last plaintext is zero if d=0; otherwise C[i]-K[j-1].
 // Penultimate plaintext is zero if h=1; otherwise C[i-1]-K[j-d-1].
 static int st(int j,int d,int h){return 6*j+2*d+h;}
 template<bool trace=false> float solve(const K&k,int start,int end,int initial=-1,V* decoded=nullptr,V* skips=nullptr,int* endstate=nullptr,bool relaxed=false)const{
   constexpr int MS=78;float cur[MS],nxt[MS];int diff[13],v0[13],v1[13],v2[13];vector<array<int8_t,MS>> back;if constexpr(trace)back.resize(end-start);
   for(int j=0;j<q;j++)diff[j]=mod(k[next1[j]]-k[j]);
   fill(cur,cur+6*q,NEG);int from=start;float invalid=relaxed?-12:NEG;
   if(start==0){for(int j=0;j<q;j++){int z=mod(c[0]-k[prev1[j]]);cur[st(j,1,0)]=lm.u[z]+(z==0?invalid:0);if(c[0]==0)cur[st(j,0,0)]=lm.u[0];}from=1;}else cur[initial]=0;
   if(from<end){for(int j=0;j<q;j++){v1[j]=mod(c[from-1]-k[prev1[j]]);if(from>=2)v2[j]=mod(c[from-2]-k[prev1[j]]);}}
   for(int i=from;i<end;i++){
     for(int j=0;j<q;j++)v0[j]=mod(c[i]-k[prev1[j]]);fill(nxt,nxt+6*q,NEG);
     const float penalty=delta[i]==0?lognormal:0;
     for(int j=0;j<q;j++){
       int js[3]={j,next1[j],next2[j]},zs[3]={0,v0[js[1]],v0[js[2]]};
       int backphase[3]={j,prev1[j],prev2[j]};
       float pen[3]={0,penalty+(zs[1]==0?invalid:0),logskip+(zs[2]==0?invalid:0)};
       bool allowed[3]={c[i]==0,true,delta[i]==diff[j]};
       for(int d=0;d<3;d++){
         if(!allowed[d])continue;
         for(int prevd=0;prevd<3;prevd++){
           int to=st(js[d],d,prevd==0),b=prevd==0?0:v1[j];float sc=NEG;int fr=-1;
           if(i==1){fr=st(j,prevd,0);sc=cur[fr]+lm.b[b*A+zs[d]];}
           else{int a=v2[backphase[prevd]];int i0=st(j,prevd,0),i1=i0+1;float s0=cur[i0]+lm.t[(a*A+b)*A+zs[d]],s1=cur[i1]+lm.t[b*A+zs[d]];fr=s1>s0?i1:i0;sc=max(s0,s1);}
           sc+=pen[d];if(sc>nxt[to]){nxt[to]=sc;if constexpr(trace)back[i-start][to]=fr;}
         }
       }
     }
     copy(nxt,nxt+6*q,cur);copy(v1,v1+q,v2);copy(v0,v0+q,v1);
   }
   int best=int(max_element(cur,cur+6*q)-cur);if(endstate)*endstate=best;
   if(cur[best]<NEG/2){if(endstate)*endstate=-1;return NEG;}
   if constexpr(trace){decoded->resize(end-start);skips->resize(end-start);int s=best;
     for(int i=end-1;i>=start;i--){int j=s/6,d=s%6/2;(*decoded)[i-start]=d==0?0:mod(c[i]-k[prev1[j]]);(*skips)[i-start]=d;if(i>0)s=back[i-start][s];}
     int j=start?initial/6:(s%6/2==0?s/6:prev1[s/6]);
     for(int i=start;i<end;i++){int p=(*decoded)[i-start],d=(*skips)[i-start],x=0;
       if(d==0){if(p!=0)throw runtime_error("bad hold");}
       else {if(p==0&&!relaxed)throw runtime_error("illegal consuming F");x=mod(p+k[j]);j=next1[j];if(d==2){if(i==0||x!=c[i-1])throw runtime_error("illegal redraw");x=mod(p+k[j]);j=next1[j];}}
       if(x!=c[i])throw runtime_error("bad replay");
     }
     if(j!=best/6)throw runtime_error("bad final phase");
   }
   return cur[best];
 }
 float score(const K&k,int cut)const{return solve<false>(k,0,cut,-1,nullptr,nullptr,nullptr,true);}
};
V plant(const V&p,const K&k,int q){V c;int j=0;for(int i=0;i<int(p.size());i++){if(p[i]==0){c.push_back(0);continue;}int z=mod(p[i]+k[j]);j=(j+1)%q;if(i&&z==c.back()&&i%5!=0){z=mod(p[i]+k[j]);j=(j+1)%q;}c.push_back(z);}return c;}
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
 for(int w=0;w<workers;w++)pool.emplace_back([&,w](){mt19937 r(seed+uint32_t(w)*0x9e3779b9u);uniform_int_distribution<int> uni(0,A-1);Candidate best,legal;K zero{};legal={zero,t.solve<false>(zero,0,cut),1};
  for(int ix=w;ix<restarts;ix+=workers){K k{};if(counts[w]%4==0||best.s==NEG){for(int j=0;j<t.q;j++)k[j]=uni(r);}else{k=best.k;int m=2+int(r()%3);for(int j=0;j<m;j++)k[r()%t.q]=uni(r);}
   auto z=climb(t,cut,k,r,12);evals[w]+=z.evals;counts[w]++;if(truth&&canon(z.k,t.q)==canon(*truth,t.q))wins[w]++;if(z.s>best.s)best=z;float exact=t.solve<false>(z.k,0,cut);evals[w]++;if(exact>legal.s)legal={z.k,exact,z.evals};
  }bests[w]=legal;});
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
  auto r=search(t,cut,restarts,workers,0x74cd53afu+ix*1234567u,orig?nullptr:&truth);V train,hold,sk1,sk2;int boundary;float a=t.solve<true>(r.best.k,0,cut,-1,&train,&sk1,&boundary);bool legalTrain=boundary>=0;float b=legalTrain?t.solve<true>(r.best.k,cut,t.n,boundary,&hold,&sk2):NEG;bool legalHold=b>NEG/2;
  int ct=-1,ch=-1,oracleHold=-1;float oracle=0;if(!orig&&legalTrain&&legalHold){ct=inner_product(train.begin(),train.end(),p.begin(),0,plus<>(),equal_to<>());ch=inner_product(hold.begin(),hold.end(),p.begin()+cut,0,plus<>(),equal_to<>());V x,y,z,w;int j;oracle=t.solve<true>(truth,0,cut,-1,&x,&z,&j);t.solve<true>(truth,cut,t.n,j,&y,&w);oracleHold=inner_product(y.begin(),y.end(),p.begin()+cut,0,plus<>(),equal_to<>());}
  cout<<"case "<<ix<<" "<<n<<" q="<<q<<" n="<<t.n<<" cut="<<cut<<" restarts="<<r.restarts<<" evals="<<r.evals<<" key="<<keystr(r.best.k,q)<<" canonical="<<canon(r.best.k,q)<<" truth="<<(orig?"NA":canon(truth,q))<<" correct_key="<<(!orig&&canon(r.best.k,q)==canon(truth,q))<<" key_hits="<<r.recovered<<" train="<<(legalTrain?a/cut:-999)<<" hold="<<(legalHold?b/(t.n-cut):-999)<<" correct_train="<<ct<<" correct_hold="<<ch<<" oracle_train="<<(orig?0:oracle/cut)<<" oracle_hold="<<oracleHold<<" legal_train="<<legalTrain<<" legal_hold="<<legalHold<<" F_train="<<count(sk1.begin(),sk1.end(),0)<<" F_hold="<<count(sk2.begin(),sk2.end(),0)<<" redraw_train="<<count(sk1.begin(),sk1.end(),2)<<" redraw_hold="<<count(sk2.begin(),sk2.end(),2)<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-begin).count()<<"\n";cout<<"hold_preview="<<enc(V(hold.begin(),hold.begin()+min(100,int(hold.size()))))<<"\n"<<flush;
 }
}
