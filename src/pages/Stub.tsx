import { PageHeader } from "@/components/PageHeader";

export default function Stub({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <PageHeader title={title} description={description} />
      <div className="ejb-card p-12 text-center">
        <div className="text-sm text-muted-foreground">This screen ships in the next iteration. The data model and audit hooks are already wired in.</div>
      </div>
    </div>
  );
}
