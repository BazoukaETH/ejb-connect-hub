import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { COMMITTEES } from "@/data/mock";

const MESSAGES = [
  { from: "Mona Allam", role: "Chair", text: "Reminder: agenda for next week's meeting goes out tomorrow.", ts: "10 min ago", hue: 220 },
  { from: "Tarek Mostafa", role: "Member", text: "Sharing the latest CBE circular on FX rules: link to PDF.", ts: "1 hour ago", hue: 30 },
  { from: "Yasmin Allam", role: "Member", text: "Excellent piece. Worth a working group discussion.", ts: "1 hour ago", hue: 320 },
  { from: "Karim Said", role: "Member", text: "Agreed. Shall we add to next month's agenda?", ts: "3 hours ago", hue: 200 },
];

export default function ChatModeration() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Chat moderation" description="Read-only operational view of committee chats" />
      <div className="grid grid-cols-[260px_1fr] gap-4">
        <aside className="ejb-card p-2 h-fit space-y-0.5">
          {COMMITTEES.map((c, i) => (
            <button key={c.id} className={`w-full text-left px-2.5 py-2 rounded text-xs ${i === 0 ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}>
              <div className="font-medium truncate">{c.name}</div>
              <div className="text-[10px] text-muted-foreground flex justify-between mt-0.5"><span>{Math.floor(5 + (i*11)%40)} msgs · 24h</span><span className="num">{c.memberCount}</span></div>
            </button>
          ))}
        </aside>
        <div>
          <div className="ejb-card p-4 mb-3 grid grid-cols-3 gap-3 text-xs">
            <div><div className="text-muted-foreground uppercase tracking-wider text-[10px]">Messages today</div><div className="text-xl font-bold num">42</div></div>
            <div><div className="text-muted-foreground uppercase tracking-wider text-[10px]">Active members</div><div className="text-xl font-bold num">14</div></div>
            <div><div className="text-muted-foreground uppercase tracking-wider text-[10px]">Top thread</div><div className="text-sm font-medium truncate">FX circular discussion</div></div>
          </div>
          <div className="ejb-card p-4 space-y-3">
            {MESSAGES.map((m, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <Avatar name={m.from} hue={m.hue} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.from}</span>
                    <span className="text-[10px] text-muted-foreground">{m.role} · {m.ts}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
