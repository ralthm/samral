import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cashbackBank, cashbackName, type CashbackProduct } from "@/data/cashbackCards";
import { completeCashbackTerms } from "@/lib/cashbackStrategy";

export default function CashbackCardPicker({ cards, value, onChange }: { cards: CashbackProduct[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = cards.find(c => c.id === value);
  const banks = [...new Set(cards.map(cashbackBank))];
  const choose = (id: string) => { onChange(id); setOpen(false); };
  return <div className="grid min-w-0 gap-2 text-sm">
    <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>
      <Button variant="outline" role="combobox" aria-label="Cashback card" aria-expanded={open} className="h-auto min-h-11 w-full justify-between whitespace-normal text-left">
        <span>{selected ? cashbackName(selected) : "Illustrative cashback · manual rate"}</span><ChevronsUpDown className="shrink-0" />
      </Button>
    </PopoverTrigger><PopoverContent align="start" className="w-[min(380px,calc(100vw-40px))] p-0">
      <Command><CommandInput placeholder="Search card or bank…" aria-label="Search cashback cards" /><CommandList>
        <CommandEmpty>No matching cards. Use manual terms.</CommandEmpty>
        <CommandGroup><CommandItem onSelect={() => choose("")}>Manual / unsupported card{!value && <Check className="ml-auto h-4 w-4" />}</CommandItem></CommandGroup>
        {banks.map(bank => <CommandGroup key={bank} heading={bank}>{cards.filter(c => cashbackBank(c) === bank).map(c => <CommandItem key={c.id} value={`${bank} ${cashbackName(c)}`} onSelect={() => choose(c.id)}>
          <span className="min-w-0">{cashbackName(c)}<span className="block text-xs text-muted-foreground">{completeCashbackTerms(c) ? "Verified ongoing-spend terms" : "Awaiting complete verification"}</span></span>{value === c.id && <Check className="ml-auto h-4 w-4 shrink-0" />}
        </CommandItem>)}</CommandGroup>)}
      </CommandList></Command>
    </PopoverContent></Popover>
  </div>;
}