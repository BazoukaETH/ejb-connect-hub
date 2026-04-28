import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { ONBOARDING } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Mail, AlertTriangle } from "lucide-react";

const STEPS: { key: keyof typeof ONBOARDING[number]["steps"]; label: string }[] = [
  { key: "profile", label: "Profile complete" },
  { key: "payment", label: "First payment" },
  { key: "intro", label: "Welcome call" },
  { key: "firstEvent", label: "First event RSVP" },
];

export default function Onboarding() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Onboarding queue"
        description={`${ONBOARDING.length} new members in their first 30 days`}
      />

      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50">
            <tr>
              <th>Member</th>
              <th>Joined</th>
              {STEPS.map((s) => <th key={s.key} className="text-center">{s.label}</th>)}
              <th>Owner</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING.map((o) => {
              const done = STEPS.filter((s) => o.steps[s.key]).length;
              const stalled = o.joinedDays > 7 && done < 2;
              return (
                <tr key={o.memberId} className="hover:bg-secondary/40">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={o.memberName} hue={o.hue} size="sm" />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1.5">
                          {o.memberName}
                          {stalled && <AlertTriangle className="h-3 w-3 text-[hsl(var(--ejb-amber))]" aria-label="Stalled" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{o.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num text-xs text-muted-foreground">{o.joinedDays}d ago</td>
                  {STEPS.map((s) => (
                    <td key={s.key} className="text-center">
                      {o.steps[s.key]
                        ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] inline" />
                        : <Circle className="h-4 w-4 text-muted-foreground/40 inline" />}
                    </td>
                  ))}
                  <td className="text-xs">{o.owner}</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs"><Mail className="h-3 w-3 mr-1" /> Nudge</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
