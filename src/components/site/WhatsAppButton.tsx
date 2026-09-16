import { MouseEvent } from "react";
import { MessageCircleMore } from "lucide-react";
import { buildWhatsAppHref, getWhatsAppMessage, trackWhatsAppClick } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  number?: string | null;
  enabled?: boolean;
  label?: string;
  className?: string;
  message?: string | null;
  buttonContext?: string;
  pagePath?: string;
}

export const WhatsAppButton = ({
  number,
  enabled = true,
  label = "Falar no WhatsApp",
  className = "",
  message,
  buttonContext = "cta",
  pagePath,
}: WhatsAppButtonProps) => {
  const finalMessage = getWhatsAppMessage(message);
  const href = number ? buildWhatsAppHref(number, finalMessage) : "";

  if (!enabled || !href) {
    return null;
  }

  const handleClick = (_event: MouseEvent<HTMLAnchorElement>) => {
    const currentPagePath = pagePath || `${window.location.pathname}${window.location.hash}`;
    void trackWhatsAppClick({
      number: number || "",
      message: finalMessage,
      pagePath: currentPagePath,
      buttonContext,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1faa53] ${className}`}
    >
      <MessageCircleMore className="h-4 w-4" />
      {label}
    </a>
  );
};