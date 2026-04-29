import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Building2, Palette, RefreshCcw, BellRing, Plug, Shield, Globe } from "lucide-react";

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <div className="ejb-card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 items-start py-2 border-b border-border/60 last:border-0">
      <div>
        <div className="text-xs font-medium">{label}</div>
        {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function Settings() {
  const [twoFa, setTwoFa] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <PageHeader title="Settings" description="Workspace, branding, cycle, notifications, integrations, security" />

      <Tabs defaultValue="workspace">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-5">
          {[
            ["workspace","Workspace"],["branding","Branding"],["cycle","Cycle"],
            ["notifications","Notifications"],["integrations","Integrations"],["security","Security"],
          ].map(([v,l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="workspace">
          <Section icon={Building2} title="Workspace" desc="Organization details used throughout the app and in receipts">
            <Field label="Organization name"><Input defaultValue="Egyptian Junior Businessmen Association" className="h-9 max-w-md" /></Field>
            <Field label="Legal name (Arabic)" hint="Used on official communications">
              <Input defaultValue="جمعية رجال الأعمال المصريين الشباب" lang="ar" dir="rtl" className="h-9 max-w-md" />
            </Field>
            <Field label="Fiscal year">
              <select className="h-9 px-3 border border-input rounded-md bg-background text-sm"><option>1 Aug - 31 Jul</option><option>1 Jan - 31 Dec</option></select>
            </Field>
            <Field label="Currency"><select className="h-9 px-3 border border-input rounded-md bg-background text-sm"><option>EGP</option><option>USD</option></select></Field>
            <Field label="Timezone"><select className="h-9 px-3 border border-input rounded-md bg-background text-sm"><option>Africa/Cairo (GMT+2)</option></select></Field>
            <Field label="Languages" hint="Available in app and dashboard"><div className="flex gap-2"><span className="chip chip-brand">English</span><span className="chip chip-brand">العربية</span></div></Field>
          </Section>
        </TabsContent>

        <TabsContent value="branding">
          <Section icon={Palette} title="Branding" desc="Logo, primary color override, email sender">
            <Field label="Monogram">
              <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-md flex items-center justify-center text-white font-bold" style={{ background: "hsl(var(--ejb-blue))" }}>E</div><Button variant="outline" size="sm">Replace SVG</Button></div>
            </Field>
            <Field label="Primary color"><div className="flex items-center gap-2"><div className="h-9 w-9 rounded-md border border-border" style={{ background: "hsl(var(--ejb-blue))" }} /><Input defaultValue="#485CF0" className="h-9 max-w-[120px] num" /></div></Field>
            <Field label="Email sender"><Input defaultValue="EJB Admin <admin@ejb.org.eg>" className="h-9 max-w-md" /></Field>
            <Field label="Email domain (verified)"><span className="chip chip-paid" style={{ marginRight: 8 }}>Verified</span><span className="text-xs text-muted-foreground num">ejb.org.eg via SPF + DKIM</span></Field>
          </Section>
        </TabsContent>

        <TabsContent value="cycle">
          <Section icon={RefreshCcw} title="Cycle defaults" desc="Dues, reminders, and grace period">
            <Field label="Default dues (EGP)" hint="Used when opening a new cycle"><Input defaultValue="15000" className="h-9 max-w-[160px] num" /></Field>
            <Field label="Cycle window"><div className="flex items-center gap-2 text-xs"><Input defaultValue="01 Aug" className="h-9 max-w-[110px]" /><span>to</span><Input defaultValue="31 Jul" className="h-9 max-w-[110px]" /></div></Field>
            <Field label="Reminder cadence" hint="Days before due date">
              <div className="flex items-center gap-2 text-xs">{[30, 15, 7].map((d) => (<span key={d} className="chip chip-info num">T-{d}d</span>))}<Button variant="ghost" size="sm" className="h-7 text-xs">Add stage</Button></div>
            </Field>
            <Field label="Grace period"><Input defaultValue="14" className="h-9 max-w-[80px] num" /><span className="text-xs text-muted-foreground ml-2">days after due before Lapsed</span></Field>
            <Field label="Auto-close behaviour"><label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked /> Move unpaid members to Lapsed automatically when cycle closes</label></Field>
          </Section>
        </TabsContent>

        <TabsContent value="notifications">
          <Section icon={BellRing} title="Notifications" desc="Which events email which roles">
            <Field label="Daily digest"><label className="flex items-center gap-2 text-xs"><Switch checked={reminders} onCheckedChange={setReminders} /> Email daily summary at 08:00</label></Field>
            <Field label="Sponsor renewal alerts"><span className="text-xs">90, 60, 30, 7 days before contract end → Finance + Comms</span></Field>
            <Field label="Lapsed member alerts"><span className="text-xs">30, 60, 90 days overdue → Membership Officer</span></Field>
            <Field label="Application aging"><span className="text-xs">14d in stage → Membership Officer · 30d → Super Admin</span></Field>
          </Section>
        </TabsContent>

        <TabsContent value="integrations">
          <Section icon={Plug} title="Integrations" desc="Email, SMS, payment gateway, accounting">
            <Field label="Email provider"><div className="flex items-center gap-2"><span className="chip chip-paid">Connected</span><span className="text-xs">Resend</span></div></Field>
            <Field label="WhatsApp Business"><div className="flex items-center gap-2"><span className="chip chip-pending">Setup</span><Button variant="outline" size="sm" className="h-7 text-xs">Connect</Button></div></Field>
            <Field label="SMS"><div className="flex items-center gap-2"><span className="chip chip-paid">Connected</span><span className="text-xs">Twilio</span></div></Field>
            <Field label="Payment gateway"><div className="flex items-center gap-2"><span className="chip chip-paid">Connected</span><span className="text-xs">Paymob (cards)</span></div></Field>
            <Field label="Accounting"><div className="flex items-center gap-2"><span className="chip chip-pending">Setup</span><Button variant="outline" size="sm" className="h-7 text-xs">Connect Xero</Button></div></Field>
            <Field label="Bank feeds"><div className="flex items-center gap-2"><span className="chip chip-neutral">Manual CSV</span><Button variant="outline" size="sm" className="h-7 text-xs">Upload CIB statement</Button></div></Field>
          </Section>
        </TabsContent>

        <TabsContent value="security">
          <Section icon={Shield} title="Security" desc="2FA, sessions, audit retention">
            <Field label="2FA enforcement"><label className="flex items-center gap-2 text-xs"><Switch checked={twoFa} onCheckedChange={setTwoFa} /> Require all admins to enable 2FA</label></Field>
            <Field label="Session timeout"><Input defaultValue="60" className="h-9 max-w-[80px] num" /><span className="text-xs text-muted-foreground ml-2">minutes of inactivity</span></Field>
            <Field label="IP allowlist (optional)"><Input placeholder="156.193.44.0/24" className="h-9 max-w-md num" /></Field>
            <Field label="Audit log retention" hint="EJB legal recommendation: 7 years"><span className="text-xs num">7 years</span></Field>
          </Section>
          <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1.5"><Globe className="h-3 w-3" /> Hosted in Frankfurt (eu-central-1) for EU + EG data proximity.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
