// Exact all-seed single/pair absence graph and integer clique covers.
// C++17. Input: one base36 (0..S) rune tape on stdin. Output:
// mode u v edges individually_avoidable pair_conflicts U_2 ... U_13
#include <array>
#include <bitset>
#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include <numeric>
#include <string>
using namespace std;
constexpr int Q=29,N=Q*Q;
using B=bitset<N>;
struct Edge {int s,t;B seen;};
struct Graph {vector<Edge>E;int off,n;};

Graph build(const vector<int>&t,const int*w,int u,int v){
    vector<int>states(Q);iota(states.begin(),states.end(),0);
    int off=0,n=Q;vector<Edge>E;
    for(int a=0;a<(int)t.size();){
        int b=a+1;while(b<(int)t.size()&&t[b])b++;
        vector<int>nxt;
        for(int z=0;z<(int)states.size();z++)for(int h=0;h<=!t[a];h++){
            int k=states[z];B seen;
            for(int i=a+h;i<b;i++){
                int c=t[i];seen.set(k*Q+c);k=(k*k+u*w[c]+v)%Q;
            }
            int j=find(nxt.begin(),nxt.end(),k)-nxt.begin();
            if(j==(int)nxt.size())nxt.push_back(k);
            E.push_back({off+z,n+j,seen});
        }
        off=n;n+=nxt.size();states=nxt;a=b;
    }
    return {E,off,n};
}

// Bit j is set iff a complete path avoids cell j (and forbidden if given).
B absent(const Graph&g,int forbidden=-1){
    vector<B>a(g.n);for(int i=0;i<Q;i++)a[i].set();
    for(auto&e:g.E)if(forbidden<0||!e.seen[forbidden])
        a[e.t]|=a[e.s]&~e.seen;
    B r;for(int i=g.off;i<g.n;i++)r|=a[i];
    return r;
}

// At every prefix of a disjoint clique partition, each used clique has
// capacity one, and each residual row has capacity min(k,remaining).
// The randomized ordering only chooses valid certificates; it is not
// a probabilistic estimate or a search for an encryption key.
array<int,12> cover(const B&valid,const array<B,N>&conf,mt19937&rng,int tries){
    array<int,12> best;for(int k=0;k<12;k++)best[k]=(k+2)*Q;
    vector<int>ids;for(int i=0;i<N;i++)if(valid[i])ids.push_back(i);
    for(int k=0;k<tries;k++){
        B left=valid;int cost=0;array<int,Q>counts{};
        for(int i:ids)counts[i/Q]++;
        while(left.any()){
            int s=-1,score=-1;
            for(int i:ids)if(left[i]){
                int x=(conf[i]&left).count()*8+(k?rng()%64:0);
                if(x>score)score=x,s=i;
            }
            B cand=left&conf[s];left.reset(s);counts[s/Q]--;
            while(cand.any()){
                int j=-1,sc=-1;
                for(int i:ids)if(cand[i]){
                    int x=(conf[i]&cand).count()*8+(k?rng()%32:0);
                    if(x>sc)sc=x,j=i;
                }
                left.reset(j);counts[j/Q]--;cand&=conf[j];
            }
            cost++;
            for(int i=0;i<12;i++){
                int rowcap=0;for(int n:counts)rowcap+=min(i+2,n);
                best[i]=min(best[i],cost+rowcap);
            }
        }
    }
    return best;
}

int main(int argc,char**argv){
    string st;if(!(cin>>st))return 1;
    vector<int>t;for(char c:st){
        int x=c>='A'?c-'A'+10:c-'0';if(x<0||x>=Q)return 2;t.push_back(x);
    }
    int w0[Q],w1[]={2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109};
    iota(w0,w0+Q,0);mt19937 rng(123);
    vector<vector<int>> pages;
    if(argc==2 && string(argv[1])=="--page-private"){
        size_t p=0;int n;
        while(cin>>n){
            if(n<=0||p+n>t.size())return 3;
            pages.emplace_back(t.begin()+p,t.begin()+p+n);p+=n;
        }
        if(p!=t.size())return 3;
    }else if(argc==1)pages.push_back(t);
    else return 3;
    for(int m=0;m<2;m++)for(int u=1;u<Q;u++)for(int v=0;v<Q;v++){
        vector<Graph> gs;B valid;valid.set();int ec=0;
        for(auto&page:pages){gs.push_back(build(page,m?w1:w0,u,v));valid&=absent(gs.back());ec+=gs.back().E.size();}
        array<B,N>conf;int edges=0;
        for(int i=0;i<N;i++)if(valid[i]){
            B avail=valid;for(auto&g:gs)avail&=absent(g,i);
            conf[i]=valid&~avail;edges+=conf[i].count();
        }
        auto ub=cover(valid,conf,rng,10);
        cout<<m<<' '<<u<<' '<<v<<' '<<ec<<' '<<valid.count()<<' '<<edges/2;
        for(int z:ub)cout<<' '<<z;
        cout<<'\n';
    }
}
