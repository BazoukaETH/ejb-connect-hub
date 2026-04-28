import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AREAS_OF_FOCUS, PRODUCTS_SERVICES } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function TaxList({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="ejb-card overflow-hidden">
      <table className="w-full data-table">
        <thead className="bg-secondary/50"><tr><th>{label}</th><th>Members using</th><th></th></tr></thead>
        <tbody>
          {items.map((t, i) => (
            <tr key={t}>
              <td className="font-medium text-sm">{t}</td>
              <td className="num text-xs text-muted-foreground">{Math.floor(15 + (i * 7) % 80)}</td>
              <td className="text-right"><Button variant="ghost" size="sm" className="h-7 text-xs">Rename</Button><Button variant="ghost" size="sm" className="h-7 text-xs">Merge</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Taxonomies() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Taxonomies" description="Master lists that drive every dropdown and chip in the app"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add</Button>} />
      <Tabs defaultValue="aof">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1">
          {[["aof","Areas of Focus"],["ps","Products & Services"],["dir","Directory chips"],["cat","Announcement categories"],["evt","Event types"]].map(([v,l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="aof" className="mt-4"><TaxList items={AREAS_OF_FOCUS} label="Tag" /></TabsContent>
        <TabsContent value="ps" className="mt-4"><TaxList items={PRODUCTS_SERVICES} label="Service" /></TabsContent>
        <TabsContent value="dir" className="mt-4"><TaxList items={["All", "Leadership", "Finance", "Operations", "Tech", "Real Estate"]} label="Chip" /></TabsContent>
        <TabsContent value="cat" className="mt-4"><TaxList items={["General", "Event", "Member benefit", "Policy", "Press", "Partner news"]} label="Category" /></TabsContent>
        <TabsContent value="evt" className="mt-4"><TaxList items={["Conference", "Workshop", "Sohour", "Networking", "Board meeting"]} label="Type" /></TabsContent>
      </Tabs>
    </div>
  );
}
