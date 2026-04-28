import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { COMMITTEES, getMember, MEMBERS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Committees() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Committees" description="Drives Network → Committees in the app"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> New committee</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {COMMITTEES.map((c) => {
          const chair = MEMBERS.find((m) => m.id === c.chairId) ?? MEMBERS[0];
          return (
            <div key={c.id} className="ejb-card p-4 ejb-card-hover">
              <h3 className="font-semibold text-sm leading-tight">{c.name}</h3>
              <p lang="ar" dir="rtl" className="text-xs text-muted-foreground">{c.nameAr}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Avatar name={chair.name} hue={chair.avatarHue} size="sm" />
                  <div><div className="text-xs font-medium">{chair.name}</div><div className="text-[10px] text-muted-foreground">Chair</div></div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold num">{c.memberCount}</div>
                  <div className="text-[10px] text-muted-foreground">members</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Last activity {c.lastActivity}</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">Manage →</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
