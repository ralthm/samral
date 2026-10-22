import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { comparisonCards, usableMilesCards, type ComparisonCountry } from "@/data/rewardComparison";

export default function MilesCardPicker({ country, value, onChange, rate }: { country: ComparisonCountry; value: string; onChange: (id: string) => void; rate?: number }) {
  const [open, setOpen] = useState(false);
  const [other, setOther] = useState(false);
  const cards = comparisonCards(country);
  const usable = usableMilesCards(country);
  const choose = (id: string) => { onChange(id); setOpen(false); };
  return <Popover open={open} onOpenChange={v => { setOpen(v); if (v) setOther(false); }}><PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-label="Miles card" aria-expanded={open} className="h-auto min-h-11 w-full justify-between gap-2 whitespace-normal text-left"><span className="min-w-0 break-words">{cards.find(c => c.id === value)?.name ?? (value === "manual" ? "Other card · manual miles rate" : `Illustrative miles · ${rate ?? "—"} per dollar`)}</span><ChevronsUpDown className="shrink-0" /></Button>
  </PopoverTrigger><PopoverContent align="start" collisionPadding={20} className="w-[min(380px,calc(100vw-40px))] max-h-[var(--radix-popover-content-available-height)] overflow-hidden p-0"><Command key={other ? "other" : "main"}><CommandInput placeholder={other ? "Search other cards…" : "Search card…"} aria-label="Search miles cards" /><CommandList className="max-h-[min(280px,calc(var(--radix-popover-content-available-height)-52px))] overscroll-contain"><CommandEmpty>No matching cards.</CommandEmpty>{other ? <CommandGroup heading="Other cards · manual earning terms">
    <CommandItem onSelect={() => setOther(false)}>← Back to supported cards</CommandItem>
    <CommandItem onSelect={() => choose("manual")}>Card not listed · enter miles rate</CommandItem>
    {cards.filter(c => !usable.some(u => u.id === c.id)).map(c => <CommandItem key={c.id} value={c.name} onSelect={() => choose(c.id)} className="gap-2"><span className="min-w-0 break-words">{c.name}</span>{value === c.id && <Check className="ml-auto h-4 w-4 shrink-0" />}</CommandItem>)}
  </CommandGroup> : <CommandGroup>
    <CommandItem onSelect={() => choose("")}>Illustrative miles · manual assumptions{!value && <Check className="ml-auto h-4 w-4" />}</CommandItem>
    {usable.map(c => <CommandItem key={c.id} value={c.name} onSelect={() => choose(c.id)} className="gap-2"><span className="min-w-0 break-words">{c.name}</span>{value === c.id && <Check className="ml-auto h-4 w-4 shrink-0" />}</CommandItem>)}
    <CommandItem onSelect={() => setOther(true)}>Other cards · enter my rate</CommandItem>
  </CommandGroup>}</CommandList></Command></PopoverContent></Popover>;
}