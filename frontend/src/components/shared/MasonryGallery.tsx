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
        className="d-flex gap-3 w-100"
        columnClassName="d-flex flex-column gap-3"
      >
        {fotos.map((foto) => (
          <button
            key={foto.id}
            onClick={() => openLightbox(foto)}
            className="d-block w-100 text-start bg-transparent border-0 p-0"
            style={{ cursor: 'pointer' }}
          >
            {foto.imagen ? (
              <div className="position-relative overflow-hidden rounded bg-elevated">
                <img
                  src={foto.imagen}
                  alt={foto.nombre_cliente ?? 'Cliente RC Estampa'}
                  className="w-100 object-fit-cover"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="position-absolute bottom-0 start-0 end-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="font-montserrat text-text" style={{ fontSize: '0.75rem' }}>{foto.nombre_cliente}</p>
                    <LineaBadge linea={foto.tipo === 'vajilla' ? 'drinkware' : 'urbana'} size="xs" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-elevated border border-border rounded p-4">
                <div className="d-flex mb-2" style={{ gap: '0.125rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-primary" style={{ fill: 'var(--rc-primary)' }} />
                  ))}
                </div>
                <p className="font-italiana fs-5 text-text fst-italic lh-sm mb-2">
                  "{foto.texto_review}"
                </p>
                <p className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>— {foto.nombre_cliente}</p>
              </div>
            )}
            {foto.imagen && foto.texto_review && (
              <div className="bg-elevated border border-border border-top-0 rounded-bottom px-3 py-2">
                <div className="d-flex" style={{ gap: '0.125rem', marginBottom: '0.375rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="text-primary" style={{ fill: 'var(--rc-primary)' }} />
                  ))}
                </div>
                <p className="font-montserrat text-muted fst-italic" style={{ fontSize: '0.75rem' }}>"{foto.texto_review}"</p>
                <p className="font-montserrat text-ghost mt-1" style={{ fontSize: '0.75rem' }}>— {foto.nombre_cliente}</p>
              </div>
            )}
          </button>
        ))}
      </Masonry>

      {/* Lightbox dialog */}
      <dialog
        ref={dialogRef}
        className="w-100 p-0 overflow-hidden"
        style={{ maxWidth: '42rem' }}
        onClick={(e) => e.target === dialogRef.current && closeLightbox()}
      >
        {selectedRef.current && (
          <div className="d-flex flex-column" style={{ maxHeight: '85vh' }}>
            {selectedRef.current.imagen && (
              <img
                src={selectedRef.current.imagen}
                alt={selectedRef.current.nombre_cliente ?? ''}
                className="w-100 object-fit-contain bg-surface"
                style={{ maxHeight: '60vh' }}
              />
            )}
            <div className="p-4">
              {selectedRef.current.texto_review && (
                <>
                  <div className="d-flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-primary" style={{ fill: 'var(--rc-primary)' }} />
                    ))}
                  </div>
                  <p className="font-italiana fs-4 text-text fst-italic mb-2">
                    "{selectedRef.current.texto_review}"
                  </p>
                </>
              )}
              {selectedRef.current.nombre_cliente && (
                <p className="font-montserrat small text-muted mb-3">
                  — {selectedRef.current.nombre_cliente}
                </p>
              )}
              <div className="d-flex gap-2">
                <button
                  onClick={() => {
                    const slug = selectedRef.current?.producto_ropa_slug || selectedRef.current?.producto_vajilla_slug;
                    const base = selectedRef.current?.producto_vajilla_slug ? '/drinkware' : '/catalogo';
                    closeLightbox();
                    navigate(slug ? `${base}/${slug}` : (base));
                  }}
                  className="btn btn-primary px-3 py-2 small"
                >
                  Ver este producto
                </button>
                <button onClick={closeLightbox} className="btn btn-secondary px-3 py-2 small">
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
