import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { DOCUMENTS, RESOURCES } from "@/data/mock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Link2, Video, Folder } from "lucide-react";

export default function Library() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Library" description="Documents and resources surfaced in the app's Hub"
        actions={<Button size="sm" className="h-9"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</Button>} />

      <Tabs defaultValue="documents">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1">
          {[["documents","Documents"],["resources","Resources"],["templates","Templates"]].map(([v,l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <aside className="ejb-card p-3 text-sm space-y-1 h-fit">
              {["All", "Governance", "Member benefit", "Reports", "Briefings"].map((f, i) => (
                <button key={f} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs ${i === 0 ? "bg-accent text-accent-foreground font-medium" : "hover:bg-secondary"}`}>
                  <Folder className="h-3.5 w-3.5" /> {f}
                </button>
              ))}
            </aside>
            <div className="ejb-card overflow-hidden">
              <table className="w-full data-table">
                <thead className="bg-secondary/50"><tr><th>Name</th><th>Category</th><th>Size</th><th>Visibility</th><th>Uploaded</th><th>Downloads</th></tr></thead>
                <tbody>
                  {DOCUMENTS.map((d) => (
                    <tr key={d.id}>
                      <td><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-destructive" /><span className="font-medium text-sm">{d.name}</span></div></td>
                      <td><StatusChip variant="info" label={d.category} /></td>
                      <td className="num text-xs text-muted-foreground">{d.size}</td>
                      <td className="text-xs">{d.visibility}</td>
                      <td className="text-xs text-muted-foreground"><div>{d.uploadedAt}</div><div className="text-[10px]">by {d.uploadedBy}</div></td>
                      <td className="num text-xs">{d.downloads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50"><tr><th>Name</th><th>Type</th><th>Detail</th></tr></thead>
              <tbody>
                {RESOURCES.map((r) => {
                  const Icon = r.type === "link" ? Link2 : r.type === "Video" ? Video : FileText;
                  return (
                    <tr key={r.id}>
                      <td><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-sm">{r.name}</span></div></td>
                      <td><StatusChip variant="neutral" label={r.type} /></td>
                      <td className="text-xs text-muted-foreground">{(r as any).url || (r as any).size || (r as any).duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="ejb-card p-8 text-center text-sm text-muted-foreground">Internal admin templates: offer letters, comms drafts, run sheets.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
