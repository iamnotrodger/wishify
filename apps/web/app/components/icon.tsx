import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export type IconName = keyof typeof dynamicIconImports;

export const iconNames: string[] = Object.keys(dynamicIconImports);

interface IconProps extends LucideProps {
  name: IconName;
}

const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name]);

  return <LucideIcon {...props} />;
};

export default Icon;
