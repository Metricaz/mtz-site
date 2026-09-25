import { Fragment, ReactNode } from 'react';

/** "*destaque*" → accent span, line break → <br />. */
export const renderRichText = (text: string, accentClassName?: string): ReactNode =>
  text.split('\n').map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 && <br />}
      {line.split(/(\*[^*]+\*)/).map((part, partIndex) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <span key={partIndex} className={accentClassName}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </Fragment>
  ));
