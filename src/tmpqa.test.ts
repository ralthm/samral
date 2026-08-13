import {describe,it,expect} from "vitest";
import {runCalculation} from "@/lib/calculatorPipeline";
import {loyaltyProgrammes} from "@/data/milesCalculator";
describe("qa",()=>{it("merges",()=>{
 const s=runCalculation([{id:"e1",bankId:"maybank",cardId:"",cardGroupId:"cg-mbb-treats-standard",notFound:false,nickname:"",rawInput:"250,000"}],[{id:"x",programmeId:"enrich",rawInput:"60,000"}]);
 console.log(s.portfolio.find(p=>p.programmeId==="enrich"));
 console.log(loyaltyProgrammes.filter(p=>p.active).map(p=>p.id).join(","));
})});
