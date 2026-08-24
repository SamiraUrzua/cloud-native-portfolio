'use client';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const blocks = content
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim() !== '');

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, blockIndex) => {
        const trimmedBlock = block.trim();

        const attributes: Record<string, string> = {};
        for (const attributeMatch of trimmedBlock.matchAll(/(\w+)="([^"]*)"/g)) {
          attributes[attributeMatch[1]] = attributeMatch[2];
        }

        const captionElement = attributes.caption && (
          <figcaption className="text-body-muted text-xl text-center">
            {attributes.caption}
          </figcaption>
        );

        if (trimmedBlock.startsWith('<Pullquote>')) {
          return (
            <blockquote
              key={blockIndex}
              className="border-l-2 border-accent pl-6 py-2 my-4"
            >
              <p className="text-heading text-accent">
                {trimmedBlock.replace(/^<Pullquote>|<\/Pullquote>$/g, '').trim()}
              </p>
            </blockquote>
          );
        }

        if (trimmedBlock.startsWith('<Figure ')) {
          if (!attributes.src) return null;

          return (
            <figure
              key={blockIndex}
              className={`mx-auto flex flex-col items-center gap-2 py-8 ${
                attributes.size === 'large' ? 'max-w-2xl' : 'max-w-md'
              }`}
            >
              <img
                src={attributes.src}
                alt={attributes.caption ?? ''}
                className="w-full rounded-lg"
              />

              {captionElement}
            </figure>
          );
        }

        if (trimmedBlock.startsWith('<Video ')) {
          const allVideoAttributes: Record<string, string> = {};
          for (const videoAttributeMatch of trimmedBlock
            .slice('<Video'.length)
            .matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
            if (videoAttributeMatch[1] === 'caption') continue;
            allVideoAttributes[videoAttributeMatch[1]] = videoAttributeMatch[2] ?? '';
          }

          const { class: videoClassName = '', ...videoAttributes } = allVideoAttributes;

          if (!videoAttributes.src) return null;

          return (
            <figure key={blockIndex} className="flex flex-col items-center gap-2 py-8">
              <video
                ref={(videoElement) => {
                  if (!videoElement) return;

                  for (const [attributeName, attributeValue] of Object.entries(videoAttributes)) {
                    videoElement.setAttribute(attributeName, attributeValue);
                  }

                  videoElement.muted = videoElement.hasAttribute('muted');

                  if (videoElement.hasAttribute('autoplay')) {
                    videoElement.play().catch(() => {});
                  }
                }}
                className={`w-full rounded-lg ${videoClassName}`}
              />

              {captionElement}
            </figure>
          );
        }

        if (trimmedBlock.startsWith('## ')) {
          return (
            <h2 key={blockIndex} className="text-heading pb-2">
              {trimmedBlock.slice(3)}
            </h2>
          );
        }

        const segments = trimmedBlock.split(/<Accent>([\s\S]*?)<\/Accent>/);

        return (
          <p key={blockIndex} className="text-body">
            {segments.map((segment, segmentIndex) =>
              segmentIndex % 2 === 1 ? (
                <span key={segmentIndex} className="text-accent">
                  {segment}
                </span>
              ) : (
                segment
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}