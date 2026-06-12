import { getLinaLabel, getLineaBadgeClass } from '../../utils';

interface Props {
  linea: string;
  size?: 'sm' | 'xs';
}

export default function LineaBadge({ linea, size = 'sm' }: Props) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`font-montserrat font-700 uppercase tracking-wider rounded-full ${sizeClass} ${getLineaBadgeClass(linea)}`}>
      {getLinaLabel(linea)}
    </span>
  );
}
