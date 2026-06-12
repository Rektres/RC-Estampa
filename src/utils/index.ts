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
  const map: Record<string, string> = {
    urbana: 'bg-urban/20 text-urban border border-urban/30',
    formal: 'bg-primary/20 text-primary border border-primary/30',
    drinkware: 'bg-drinkware/20 text-drinkware border border-drinkware/30',
  };
  return map[linea] ?? 'bg-ghost/20 text-muted border border-border';
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
