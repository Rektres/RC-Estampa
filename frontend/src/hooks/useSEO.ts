import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'RC Estampa — Ropa Urbana & Drinkware Estampado | RC Estampa Chile';
const DEFAULT_DESC = 'RC Estampa de estampado escénico en Santiago de Chile. DTF Textil Ultra HD, serigrafía y sublimación en poleras, polerones y drinkware personalizado con despacho nacional.';
const DEFAULT_IMAGE = '/Logo_RCEstampa.png';

export function useSEO({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema,
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    const finalTitle = title ? `${title} | RC Estampa` : DEFAULT_TITLE;
    document.title = finalTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // 3. Open Graph
    setMeta('og:title', finalTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    setMeta('og:image', image.startsWith('http') ? image : `${window.location.origin}${image}`, true);
    setMeta('og:url', window.location.href, true);
    setMeta('og:site_name', 'RC Estampa', true);

    // 4. Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', finalTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image.startsWith('http') ? image : `${window.location.origin}${image}`);

    // 5. Canonical Link
    const finalCanonical = canonical || window.location.href.split('?')[0];
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', finalCanonical);

    // 6. JSON-LD Schema
    const schemaId = 'seo-dynamic-jsonld';
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = schemaId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      // Limpieza de schema dinámico al desmontar
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [title, description, keywords, canonical, image, type, schema]);
}
