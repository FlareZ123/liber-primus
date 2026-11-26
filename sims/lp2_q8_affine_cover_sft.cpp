#include "lp2_q8_affine_cover.hpp"
#include <chrono>
#include <fstream>
#include <iostream>
#include <random>
using namespace lp2_affine_cover;
Result oracle(int d,const std::vector<Direction>&dirs){
    Result out;int n=1;for(int i=0;i<d;++i)n*=P;
    for(int id=0;id<n;++id){
        Params p{};int v=id;for(int j=d-1;j>=0;--j){p[j]=v%P;v/=P;}
        bool good=true;
        for(const auto&t:dirs){int s=0;for(int j=0;j<d;++j)s+=p[j]*t.a[j];if(t.forbidden_rhs&(1u<<(s%P))){good=false;break;}}
        if(good){if(!out.count)out.first=p;++out.count;}
    }
    return out;
}
void check(int d,const std::vector<Direction>&dirs,unsigned expected){
    auto a=solve(d,dirs,1000000),b=oracle(d,dirs),c=solve(d,dirs);
    if(a.count!=expected||a.count!=b.count||c.count!=std::min(2u,expected)||(expected&&(a.first!=b.first||c.first!=b.first)))throw std::runtime_error("cover mismatch");
}
int main(){
    std::ifstream f("im-results/lp2-q8-graph-hyperplane-cover-fixture.txt");
    if(!f)throw std::runtime_error("missing fixture");
    int d,n;unsigned count;int states=0,empty=0,unique=0;
    std::vector<std::pair<int,std::vector<Direction>>> fixtures;
    while(f>>d>>count>>n){
        std::vector<Direction> dirs(n);
        for(auto&v:dirs){for(int i=0;i<d;++i)if(!(f>>v.a[i]))throw std::runtime_error("bad direction");if(!(f>>v.forbidden_rhs))throw std::runtime_error("bad mask");}
        check(d,dirs,count);fixtures.emplace_back(d,dirs);++states;empty+=count==0;unique+=count==1;
    }
    if(states!=17||empty!=16||unique!=1)throw std::runtime_error("source fixture count changed");
    std::mt19937 rng(0x291145);int tested=0;
    for(int k=1;k<=3;++k)for(int i=0;i<40;++i){
        std::vector<Direction> dirs(12);
        for(auto&v:dirs){for(int j=0;j<k;++j)v.a[j]=rng()%P;for(int j=0;j<9;++j)v.forbidden_rhs|=1u<<(rng()%P);}
        check(k,dirs,oracle(k,dirs).count);++tested;
    }
    std::vector<Direction> forced{{{1,0,0},ALL^1u},{{0,1,0},ALL^1u}};
    check(2,forced,1);forced.push_back({{1,1,0},1});check(2,forced,0);
    auto start=std::chrono::steady_clock::now();uint64_t sum=0;
    for(int i=0;i<100;++i)for(auto&[k,dirs]:fixtures)sum+=solve(k,dirs).count;
    auto fast=std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-start).count();
    start=std::chrono::steady_clock::now();uint64_t ref=0;
    for(int i=0;i<100;++i)for(auto&[k,dirs]:fixtures)ref+=oracle(k,dirs).count;
    auto slow=std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-start).count();
    if(sum!=100||ref!=100)throw std::runtime_error("benchmark mismatch");
    std::cout<<"PASS original="<<states<<" empty="<<empty<<" unique="<<unique<<" generated="<<tested<<" row_ms="<<fast<<" brute_ms="<<slow<<"\n";
}
