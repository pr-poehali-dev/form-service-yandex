import { useState } from "react";
import Icon from "@/components/ui/icon";

interface ShareModalProps {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

export default function ShareModal({ open, url, title, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=0c0602&color=ffffff&margin=10&data=${encodeURIComponent(url)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "Форма", url });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const shareLinks = [
    { name: "Telegram", icon: "Send", color: "text-sky-400", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || "Заполните форму")}` },
    { name: "WhatsApp", icon: "MessageCircle", color: "text-green-400", href: `https://wa.me/?text=${encodeURIComponent((title ? title + " — " : "") + url)}` },
    { name: "Email", icon: "Mail", color: "text-amber-400", href: `mailto:?subject=${encodeURIComponent(title || "Форма")}&body=${encodeURIComponent(url)}` },
    { name: "VK", icon: "Share2", color: "text-blue-400", href: `https://vk.com/share.php?url=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="rounded-3xl p-8 w-full max-w-md animate-scale-in relative"
        style={{ background: "rgba(12,6,2,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,81,30,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition"
        >
          <Icon name="X" size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl gradient-primary mb-3 glow-orange">
            <Icon name="Share2" size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Форма опубликована!</h2>
          {title && <p className="text-sm text-muted-foreground mt-1">{title}</p>}
        </div>

        {/* QR */}
        <div className="flex justify-center mb-5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <img src={qrUrl} alt="QR" className="w-44 h-44 rounded-lg" />
          </div>
        </div>

        {/* URL field */}
        <div className="flex items-center gap-2 p-2 rounded-2xl glass mb-3">
          <Icon name="Link" size={14} className="ml-2 text-foreground/40 flex-shrink-0" />
          <input
            readOnly
            value={url}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 bg-transparent text-sm text-foreground focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              copied ? "bg-green-400/15 text-green-400" : "gradient-primary text-white hover:opacity-90"
            }`}
          >
            <Icon name={copied ? "Check" : "Copy"} size={13} />
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>

        {/* Open in new tab + native share */}
        <div className="flex gap-2 mb-5">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium glass text-foreground/70 hover:text-foreground transition"
          >
            <Icon name="ExternalLink" size={13} />
            Открыть
          </a>
          <button
            onClick={handleNativeShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium glass text-foreground/70 hover:text-foreground transition"
          >
            <Icon name="Share2" size={13} />
            Поделиться
          </button>
        </div>

        {/* Social */}
        <div className="grid grid-cols-4 gap-2">
          {shareLinks.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl glass hover:bg-white/5 transition"
            >
              <Icon name={s.icon} fallback="Share2" size={18} className={s.color} />
              <span className="text-[10px] text-foreground/60">{s.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
