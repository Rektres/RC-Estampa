export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function getLinaLabel(linea: string): string {
  const map: Record<string, string> = {
    urbana: 'Urbana',
    formal: 'Formal',
    drinkware: 'Drinkware',
  };
  return map[linea] ?? linea;
}

export function getLineaBadgeClass(linea: string): string {
  const normalized = (linea || '').toLowerCase().trim();
  const map: Record<string, string> = {
    urbana: 'badge-linea-urbana',
    formal: 'badge-linea-formal',
    drinkware: 'badge-linea-drinkware',
  };
  return map[normalized] ?? 'badge-linea-custom';
}

export function useIntersectionObserver() {
  return (el: Element | null) => {
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  };
}
