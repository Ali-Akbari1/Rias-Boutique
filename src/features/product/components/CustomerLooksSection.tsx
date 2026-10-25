import { ExternalLink, Instagram, MapPin } from "lucide-react";
import type { CustomerLook } from "@/features/catalog/data/products";

interface CustomerLooksSectionProps {
  productName: string;
  looks?: CustomerLook[];
}

const INSTAGRAM_HANDLE = "@riasboutique__";

const CustomerLooksSection = ({ productName, looks = [] }: CustomerLooksSectionProps) => {
  if (looks.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="customer-looks-heading" className="border-t border-border pt-10 sm:pt-14">
      <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-9">
        <p className="mb-2 text-xs font-body uppercase tracking-[0.24em] text-gold">From our community</p>
        <h2 id="customer-looks-heading" className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Real Customers, Real Looks
        </h2>
        <p className="mt-3 font-body text-base text-muted-foreground sm:text-lg">
          See how {productName} looks beyond the studio, and tap a photo to view it on our Instagram, @riasboutique__.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {looks.map((look) => {
          const displayName = look.customerName || "Our Lovely Client";
          const imageAlt = look.altText || `${displayName} wearing ${productName}`;

          return (
            <article
              key={look.id}
              className="group w-[calc((100%-0.75rem)/2)] overflow-hidden rounded-md border border-border bg-card shadow-boutique transition-shadow duration-300 hover:shadow-card-hover sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:max-w-[28rem]"
            >
              <a
                href={look.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-[4/5] overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`View ${displayName}'s ${productName} look on Instagram`}
              >
                <img
                  src={look.image}
                  alt={imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-foreground/80 px-3 py-2 text-sm font-semibold text-primary-foreground transition-transform duration-300 motion-safe:group-hover:translate-y-0 motion-reduce:translate-y-0">
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                  View on Instagram
                </span>
              </a>

              <div className="space-y-3 border-t border-border px-3 py-3 sm:px-4">
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{INSTAGRAM_HANDLE}</p>
                {look.location ? (
                  <p className="flex items-center gap-1.5 truncate font-body text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {look.location}
                  </p>
                ) : null}
                <a
                  href={look.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Open on Instagram
                  <ExternalLink
                    className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover/link:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-5 text-center font-body text-sm text-muted-foreground">
        Thank you to our community for sharing their beautiful looks.
      </p>
    </section>
  );
};

export default CustomerLooksSection;
