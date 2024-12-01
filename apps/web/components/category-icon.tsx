import { Box } from 'lucide-react';
import Icon, { isValidIcon } from './icon';
import { memo } from 'react';

interface CategoryIconProps {
  icon?: string | null;
}

const CategoryIcon = memo(({ icon }: CategoryIconProps) => {
  if (isEmoji(icon)) {
    return <div className='text-lg'>{icon}</div>;
  }

  if (isValidIcon(icon)) {
    return <Icon name={icon} className='h-4 w-4' />;
  }

  return <Box className='h-4 w-4' />;
});

export { CategoryIcon };

const isEmoji = (icon?: string | null) => {
  if (!icon) return false;
  const regex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
  return regex.test(icon);
};
