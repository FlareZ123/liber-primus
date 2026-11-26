#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <iostream>
#include <set>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;
using Vec=vector<int>;
using Eq=array<int,3>;
const string A="0123456789abcdefghijklmnopqrs";
int mod(int a){a%=29;return a<0?a+29:a;}
int inv[29];
Vec decode(const string&s){Vec v;for(char c:s)v.push_back(A.find(c));return v;}
struct Forms{
    array<array<uint8_t,29>,29> f{};
    uint32_t free=(1u<<29)-2;
    Forms(){for(int i=1;i<29;i++)f[i][i]=1;}
    bool add(const Eq&e){
        int q[29]{};uint32_t bits=free;int pivot=0;
        while(bits){int j=__builtin_ctz(bits);bits&=bits-1;q[j]=mod(f[e[0]][j]-f[e[1]][j]-f[e[2]][j]);if(q[j]&&!pivot)pivot=j;}
        if(!pivot)return true;
        free&=~(1u<<pivot);int iv=inv[q[pivot]];
        for(int a=1;a<29;a++)if(f[a][pivot]){
            int mul=f[a][pivot]*iv%29;f[a][pivot]=0;bits=free;
            while(bits){int j=__builtin_ctz(bits);bits&=bits-1;f[a][j]=mod(f[a][j]-mul*q[j]);}
        }
        return true;
    }
    bool distinct()const{
        uint64_t h[29]{};
        for(int i=1;i<29;i++){uint32_t b=free;while(b){int j=__builtin_ctz(b);b&=b-1;h[i]=h[i]*31+f[i][j];}}
        for(int a=1;a<29;a++)for(int b=0;b<a;b++)if(h[a]==h[b]&&f[a]==f[b])return false;
        return true;
    }
    int dim()const{return __builtin_popcount(free);}
};
struct Cand{string p;int start,end;vector<Eq> eq;};
struct Anchor{int idx,offset,len;vector<Cand> c;};
vector<Anchor> anchors;vector<int> order;vector<const Cand*> selected;
Vec key,allc;vector<Vec> cw;unordered_set<string> dict,seen;
array<uint64_t,5> tries{},survive{};array<uint64_t,29> dims{};uint64_t maps=0,fit=0,leafcaps=0,enumNodes=0;bool timeoutFlag=false;double limit=60;
auto started=chrono::steady_clock::now();
bool timed(){return chrono::duration<double>(chrono::steady_clock::now()-started).count()>limit;}
int trainWords=56;
uint16_t reach(int lo,int hi,int start){uint16_t m=1u<<start;for(int t=lo;t<hi;t++){uint16_t n=0;for(int j=0;j<13;j++)if(m&(1u<<j)){if(allc[t]==0)n|=1u<<j;if(allc[t]!=0||key[j]!=0)n|=1u<<((j+1)%13);}m=n;}return m;}
array<array<array<uint16_t,13>,4>,4> reachCache;
void options(const Vec& c,int t,int phase,const array<int,29>& pi,const array<int,29>& ip,string &p,vector<pair<int,string>>&out){
    if(t==(int)c.size()){out.push_back({phase,p});return;}
    int v=c[t];if(v==0){p.push_back('0');options(c,t+1,phase,pi,ip,p,out);p.pop_back();}
    int x=ip[(pi[v]+pi[key[phase]])%29];if(x){p.push_back(A[x]);options(c,t+1,(phase+1)%13,pi,ip,p,out);p.pop_back();}
}
struct Path{int cost=1000000,init=-1;string plain;};
array<Path,13> scan(const array<int,29>&pi,int first,int end,array<Path,13> dp,int cap){
    array<int,29> ip{};for(int i=0;i<29;i++)ip[pi[i]]=i;
    for(int w=first;w<end;w++){
        array<Path,13> nx;
        for(int j=0;j<13;j++)if(dp[j].cost<=cap){string p;vector<pair<int,string>> opts;options(cw[w],0,j,pi,ip,p,opts);
            for(auto &[k,s]:opts){int cost=dp[j].cost+!dict.count(s);if(cost<nx[k].cost){nx[k].cost=cost;nx[k].init=dp[j].init;nx[k].plain=dp[j].plain+(dp[j].plain.empty()?"":" ")+s;}}
        }dp=move(nx);
        if(none_of(dp.begin(),dp.end(),[&](auto&p){return p.cost<=cap;}))break;
    }return dp;
}
void evaluate(const array<int,29>&pi){
    string m;for(int i:pi)m.push_back(A[i]);if(!seen.insert(m).second)return;maps++;
    array<Path,13> dp;for(int j=0;j<13;j++){dp[j].cost=0;dp[j].init=j;}
    auto res=scan(pi,0,trainWords,dp,3);int j=min_element(res.begin(),res.end(),[](const Path&a,const Path&b){return a.cost<b.cost;})-res.begin();
    if(res[j].cost>3)return;fit++;array<Path,13> hd;hd[j].cost=0;hd[j].init=j;auto ho=scan(pi,trainWords,cw.size(),hd,1000000);int z=min_element(ho.begin(),ho.end(),[](const Path&a,const Path&b){return a.cost<b.cost;})-ho.begin();
    cout<<"FIT map="<<m<<" start="<<res[j].init<<" end="<<j<<" train_oov="<<res[j].cost<<" holdout_oov="<<ho[z].cost<<"\nTRAIN "<<res[j].plain<<"\nHOLDOUT "<<ho[z].plain<<endl;
}
// Exact affine all-different enumeration with MRV and unary disequality propagation.
void enum_maps(const Forms&f){
    vector<int> free;for(int j=1;j<29;j++)if(f.free&(1u<<j))free.push_back(j);
    int pivot=-1;for(int j:free)if(f.f[15][j]){pivot=j;break;}assert(pivot>0);free.erase(find(free.begin(),free.end(),pivot));
    int d=free.size();int co[29][29]{};int con[29]{};int iv=inv[f.f[15][pivot]];
    for(int a=1;a<29;a++){con[a]=f.f[a][pivot]*iv%29;for(int j=0;j<d;j++)co[a][j]=mod(f.f[a][free[j]]-con[a]*f.f[15][free[j]]);}
    struct Rel{uint32_t mask;int c;array<uint8_t,29> a;};vector<Rel> rel;vector<vector<int>> incident(d);
    for(int a=1;a<29;a++)for(int b=0;b<a;b++){
        Rel r{};r.c=mod(con[a]-con[b]);for(int j=0;j<d;j++)if((r.a[j]=mod(co[a][j]-co[b][j])))r.mask|=1u<<j;
        if(!r.mask){if(!r.c)return;continue;}
        int i=rel.size();for(int j=0;j<d;j++)if(r.mask&(1u<<j))incident[j].push_back(i);rel.push_back(r);
    }
    vector<int> rem(rel.size()),value(rel.size());for(int i=0;i<(int)rel.size();i++){rem[i]=__builtin_popcount(rel[i].mask);value[i]=rel[i].c;}
    array<int,29> v{},pi{};uint64_t local=0;
    auto rec=[&](auto&&self,uint32_t unassigned)->void{
        if(timeoutFlag||local>=20000000)return;local++;enumNodes++;if((enumNodes&65535)==0&&timed()){timeoutFlag=true;return;}
        if(!unassigned){uint32_t got=1;for(int a=1;a<29;a++){int x=con[a];for(int j=0;j<d;j++)x+=co[a][j]*v[j];pi[a]=x%29;assert(!(got&(1u<<pi[a])));got|=1u<<pi[a];}assert(pi[15]==1);evaluate(pi);return;}
        uint32_t choices[29]{};for(int j=0;j<d;j++)if(unassigned&(1u<<j))choices[j]=(1u<<29)-2;
        for(int i=0;i<(int)rel.size();i++)if(rem[i]==1){int j=__builtin_ctz(rel[i].mask&unassigned);int forbidden=mod(-value[i]*inv[rel[i].a[j]]);choices[j]&=~(1u<<forbidden);}
        int var=-1,best=30;for(int j=0;j<d;j++)if(unassigned&(1u<<j)){int n=__builtin_popcount(choices[j]);if(n<best){best=n;var=j;}}if(!best)return;assert(var>=0);
        uint32_t bits=choices[var];while(bits){int x=__builtin_ctz(bits);bits&=bits-1;v[var]=x;bool ok=true;
            for(int i:incident[var]){rem[i]--;value[i]=mod(value[i]+rel[i].a[var]*x);if(!rem[i]&&!value[i])ok=false;}
            if(ok)self(self,unassigned&~(1u<<var));
            for(int i:incident[var]){rem[i]++;value[i]=mod(value[i]-rel[i].a[var]*x);}
            if(timeoutFlag||local>=20000000)return;
        }
    };rec(rec,(1u<<d)-1);if(local>=20000000)leafcaps++;
}
void search(int depth,const Forms&f){
    if(timeoutFlag)return;
    if(depth==4){dims[f.dim()]++;enum_maps(f);return;}
    int i=order[depth];auto &a=anchors[i];
    for(auto &c:a.c){
        if((++tries[depth]&8191)==0&&timed()){timeoutFlag=true;return;}
        bool ok=true;
        for(int j=0;j<4;j++)if(selected[j]){auto &d=*selected[j];if(anchors[j].offset<a.offset){if(!(reachCache[j][i][d.end]&(1u<<c.start))){ok=false;break;}}else if(!(reachCache[i][j][c.end]&(1u<<d.start))){ok=false;break;}}
        if(!ok)continue;
        Forms g=f;for(auto &e:c.eq)g.add(e);if(!g.distinct())continue;survive[depth]++;selected[i]=&c;search(depth+1,g);selected[i]=nullptr;if(timeoutFlag)return;
    }
}
int main(int argc,char**argv){assert(argc==6);limit=stod(argv[4]);for(int i=1;i<29;i++)for(int j=1;j<29;j++)if(i*j%29==1)inv[i]=j;
    ifstream din(argv[1]);string w;long freq;while(din>>w>>freq)if(w.size()!=1||w=="3"||w=="a"||w=="o")dict.insert(w);
    ifstream ci(argv[2]);string h1,h2;ci>>h1>>h2;key=decode(h1+h2);while(ci>>w){auto v=decode(w);cw.push_back(v);allc.insert(allc.end(),v.begin(),v.end());}
    ifstream d(argv[3]);string line;int idx=0;set<int>want;string ss=argv[5];size_t pos=0;while(pos<ss.size()){size_t end=ss.find(',',pos);if(end==string::npos)end=ss.size();want.insert(stoi(ss.substr(pos,end-pos)));pos=end+1;}assert(want.size()==4);while(getline(d,line)){
        if(want.count(idx)){size_t a=line.find('\t'),b=line.find('\t',a+1);int off=stoi(line.substr(0,a));string ctext=line.substr(a+1,b-a-1);Anchor anc{idx,off,(int)ctext.size(),{}};Vec c=decode(ctext);assert(c==cw[idx]);size_t k=b+1;while(k<line.size()){size_t j=line.find(':',k),l=line.find(',',j);string p=line.substr(k,j-k);int mask=stoi(line.substr(j+1,l-j-1));Vec v=decode(p);for(int start=0;start<13;start++)if(mask&(1<<start)){Cand ca{p,start,start,{}};for(size_t t=0;t<c.size();t++)if(v[t]){int z=key[ca.end];ca.eq.push_back({v[t],c[t],z});ca.end=(ca.end+1)%13;}anc.c.push_back(move(ca));}k=l+1;}anchors.push_back(move(anc));}idx++;
    }
    assert(anchors.size()==4);selected.resize(4,nullptr);order={0,1,2,3};sort(order.begin(),order.end(),[](int a,int b){return anchors[a].c.size()<anchors[b].c.size();});
    for(int i=0;i<4;i++)for(int j=i+1;j<4;j++)for(int phase=0;phase<13;phase++)reachCache[i][j][phase]=reach(anchors[i].offset+anchors[i].len,anchors[j].offset,phase);
    for(int i:order)cerr<<"anchor "<<anchors[i].idx<<" @"<<anchors[i].offset<<" len="<<anchors[i].len<<" candidates="<<anchors[i].c.size()<<endl;
    started=chrono::steady_clock::now();search(0,Forms{});cout<<"STATS timeout="<<timeoutFlag<<" leafcaps="<<leafcaps<<" maps="<<maps<<" fit="<<fit<<" enum="<<enumNodes<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-started).count()<<"\n";for(int i=0;i<4;i++)cout<<"depth "<<i<<" tries="<<tries[i]<<" survive="<<survive[i]<<"\n";for(int i=0;i<29;i++)if(dims[i])cout<<"dimension "<<i<<" leaves="<<dims[i]<<"\n";
}
