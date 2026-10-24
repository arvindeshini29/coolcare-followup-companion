import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATES, fillTemplate, whatsappUrl, type Lead, type Profile } from "@/lib/crm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Prepares a message and opens WhatsApp. The technician presses Send themselves. */
export function WhatsAppComposer({ lead, profile }: { lead: Lead; profile: Profile | null }) {
  const [tpl, setTpl] = useState<string>(TEMPLATES[0]!.id);
  const [text, setText] = useState("");

  useEffect(() => {
    const t = TEMPLATES.find((x) => x.id === tpl)!;
    setText(fillTemplate(t.body, lead, profile));
  }, [tpl, lead, profile]);

  function open() {
    const url = whatsappUrl(lead.phone, text);
    if (!url) {
      toast.error("This phone number isn't a valid Indian mobile number");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Message template">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tpl === t.id}
            onClick={() => setTpl(t.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-semibold",
              tpl === t.id
                ? "border-primary bg-primary-soft text-accent-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wa-msg" className="font-semibold">
          Message (you can edit before opening)
        </Label>
        <Textarea
          id="wa-msg"
          rows={5}
          className="text-base"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1500}
        />
      </div>
      <Button
        variant="whatsapp"
        size="lg"
        className="w-full sm:w-auto"
        onClick={open}
        disabled={!text.trim()}
      >
        <MessageCircle /> Open in WhatsApp
      </Button>
      <p className="text-xs text-muted-foreground">
        Nothing is sent automatically — WhatsApp opens with the message ready, and you tap Send.
      </p>
    </div>
  );
}
