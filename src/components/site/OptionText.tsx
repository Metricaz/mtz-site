import { ElementType } from 'react';
import { useSiteOptions } from '@/hooks/useSiteOptions';
import { renderRichText } from '@/lib/rich-text';

interface OptionTextProps {
  /** SiteOption key (Django admin → "Opções do site") */
  k: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  /** classes for the *destaque* parts */
  accentClassName?: string;
}

/** Renders a SiteOption as the given element; renders nothing when the key has no value. */
export const OptionText = ({ k, as: Tag = 'span', className, style, accentClassName }: OptionTextProps) => {
  const { options } = useSiteOptions();
  const value = options[k];
  if (!value) return null;
  return (
    <Tag className={className} style={style}>
      {renderRichText(value, accentClassName)}
    </Tag>
  );
};
