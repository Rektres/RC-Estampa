import { useRef } from 'react';
import Masonry from 'react-masonry-css';
import { Star } from 'lucide-react';
import LineaBadge from './LineaBadge';
import type { FotoCliente } from '../../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  fotos: FotoCliente[];
}

export default function MasonryGallery({ fotos }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedRef = useRef<FotoCliente | null>(null);
  const navigate = useNavigate();

  function openLightbox(foto: FotoCliente) {
    selectedRef.current = foto;
    dialogRef.current?.showModal();
  }

  function closeLightbox() {
    dialogRef.current?.close();
  }

  const breakpoints = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpoints}
        className="flex gap-4 w-full"
        columnClassName="flex flex-col gap-4"
      >
        {fotos.map((foto) => (
          <button
            key={foto.id}
            onClick={() => openLightbox(foto)}
            className="block w-full text-left group cursor-pointer focus:outline-none"
          >
            {foto.imagen ? (
              <div className="relative overflow-hidden rounded-sm bg-elevated">
                <img
                  src={foto.imagen}
                  alt={foto.nombre_cliente ?? 'Cliente RC Estampa'}
                  className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                  <div className="flex items-center justify-between">
                    <p className="font-montserrat text-xs text-text">{foto.nombre_cliente}</p>
                    <LineaBadge linea={foto.tipo === 'vajilla' ? 'drinkware' : 'urbana'} size="xs" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-elevated border border-border rounded-sm p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-italiana text-lg text-text italic leading-snug mb-3">
                  "{foto.texto_review}"
                </p>
                <p className="font-montserrat text-xs text-muted">— {foto.nombre_cliente}</p>
              </div>
            )}
            {foto.imagen && foto.texto_review && (
              <div className="bg-elevated border border-border border-t-0 rounded-b-sm px-4 py-3">
                <div className="flex gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-montserrat text-xs text-muted italic">"{foto.texto_review}"</p>
                <p className="font-montserrat text-xs text-ghost mt-1">— {foto.nombre_cliente}</p>
              </div>
            )}
          </button>
        ))}
      </Masonry>

      {/* Lightbox dialog */}
      <dialog
        ref={dialogRef}
        className="w-full max-w-2xl p-0 overflow-hidden"
        onClick={(e) => e.target === dialogRef.current && closeLightbox()}
      >
        {selectedRef.current && (
          <div className="flex flex-col max-h-[85vh]">
            {selectedRef.current.imagen && (
              <img
                src={selectedRef.current.imagen}
                alt={selectedRef.current.nombre_cliente ?? ''}
                className="w-full max-h-[60vh] object-contain bg-surface"
              />
            )}
            <div className="p-6">
              {selectedRef.current.texto_review && (
                <>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-italiana text-xl text-text italic mb-3">
                    "{selectedRef.current.texto_review}"
                  </p>
                </>
              )}
              {selectedRef.current.nombre_cliente && (
                <p className="font-montserrat text-sm text-muted mb-4">
                  — {selectedRef.current.nombre_cliente}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const slug = selectedRef.current?.producto_ropa_slug || selectedRef.current?.producto_vajilla_slug;
                    const base = selectedRef.current?.producto_vajilla_slug ? '/drinkware' : '/catalogo';
                    closeLightbox();
                    navigate(slug ? `${base}/${slug}` : (base));
                  }}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Ver este producto
                </button>
                <button onClick={closeLightbox} className="btn-secondary text-sm px-4 py-2">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
