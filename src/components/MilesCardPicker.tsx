import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { comparisonCards, milesEarningTerms, type ComparisonCountry } from "@/data/rewardComparison";

export default function MilesCardPicker({ country, value, onChange, rate }: { country: ComparisonCountry; value: string; onChange: (id: string) => void; rate?: number }) {
  const [open, setOpen] = useState(false);
  const cards = comparisonCards(country);
  const choose = (id: string) => { onChange(id); setOpen(false); };
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-label="Miles card" aria-expanded={open} className="h-auto min-h-11 w-full justify-between whitespace-normal text-left"><span>{cards.find(c => c.id === value)?.name ?? `Illustrative miles · ${rate ?? "—"} per dollar`}</span><ChevronsUpDown className="shrink-0" /></Button>
  </PopoverTrigger><PopoverContent align="start" className="w-[min(380px,calc(100vw-40px))] p-0"><Command><CommandInput placeholder="Search card…" aria-label="Search miles cards" /><CommandList><CommandEmpty>No matching cards.</CommandEmpty><CommandGroup>
    <CommandItem onSelect={() => choose("")}>Illustrative miles · manual assumptions{!value && <Check className="ml-auto h-4 w-4" />}</CommandItem>
    {cards.map(c => <CommandItem key={c.id} value={c.name} onSelect={() => choose(c.id)}><span>{c.name}<span className="block text-xs text-muted-foreground">{milesEarningTerms.some(t => t.cardId === c.id && t.status === "verified") ? "Verified earning terms" : "Earning terms needed · no verified estimate"}</span></span>{value === c.id && <Check className="ml-auto h-4 w-4 shrink-0" />}</CommandItem>)}
  </CommandGroup></CommandList></Command></PopoverContent></Popover>;
}