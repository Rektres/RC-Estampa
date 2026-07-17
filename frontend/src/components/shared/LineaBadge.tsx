import { getLinaLabel, getLineaBadgeClass } from '../../utils';

interface Props {
  linea: string;
  size?: 'sm' | 'xs';
}

export default function LineaBadge({ linea, size = 'sm' }: Props) {
  return (
    <span
      className={`line-badge font-montserrat ${getLineaBadgeClass(linea)}`}
      style={{ fontSize: size === 'xs' ? '0.625rem' : '0.75rem' }}
    >
      {getLinaLabel(linea)}
    </span>
  );
}
