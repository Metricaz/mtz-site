/** Small line under the forms that collect personal data (contact, lead, newsletter). */
export const PrivacyNotice = ({ className = "" }: { className?: string }) => (
  <p className={`text-xs text-muted-foreground ${className}`}>
    Ao enviar, você concorda com a{" "}
    <a href="/politica-de-privacidade" className="underline underline-offset-2 hover:text-primary transition-colors">
      Política de Privacidade
    </a>
    .
  </p>
);
