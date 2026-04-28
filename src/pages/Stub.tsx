import { PageHeader } from "@/components/PageHeader";

export default function Stub({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <PageHeader title={title} description={description} />
      <div className="ejb-card ejb-grid-bg p-12 text-center border-dashed">
        <div className="text-sm font-semibold">Coming next iteration</div>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          The data model and audit hooks are wired in. The screen ships once we lock the workflow with the team.
        </p>
      </div>
    </div>
  );
}
