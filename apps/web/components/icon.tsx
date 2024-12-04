import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export type IconName = keyof typeof dynamicIconImports;
const iconNames = Object.keys(dynamicIconImports);

export const isValidIcon = (icon?: string | null): icon is IconName => {
  if (!icon) return false;
  return iconNames.includes(icon);
};

interface IconProps extends LucideProps {
  name: IconName;
}

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name]);
  return <LucideIcon {...props} />;
};

export default Icon;
