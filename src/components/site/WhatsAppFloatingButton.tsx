import { useLocation } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";
import { useWhatsAppSettings } from "@/hooks/useWhatsAppSettings";
import { buildWhatsAppHref, getWhatsAppMessage, trackWhatsAppClick } from "@/lib/whatsapp";

export const WhatsAppFloatingButton = () => {
  const location = useLocation();
  const { settings } = useWhatsAppSettings();
  const finalMessage = getWhatsAppMessage(settings?.message);
  const href = settings?.number ? buildWhatsAppHref(settings.number, finalMessage) : "";

  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  if (!settings?.enabled || !href) {
    return null;
  }

  const handleClick = () => {
    const currentPagePath = `${window.location.pathname}${window.location.hash}`;

    void trackWhatsAppClick({
      number: settings.number,
      message: finalMessage,
      pagePath: currentPagePath,
      buttonContext: "floating",
    });
  };

  return (
    <div className="fixed bottom-24 right-6 z-40 md:bottom-6">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        aria-label="Falar no WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-16px_rgba(37,211,102,0.6)] transition-transform hover:scale-105 hover:bg-[#1faa53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <MessageCircleMore className="h-6 w-6" />
      </a>
    </div>
  );
};