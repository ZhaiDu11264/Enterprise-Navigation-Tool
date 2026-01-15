import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WebsiteLink } from '../../types';
import { LinkCard } from './LinkCard';

interface DraggableLinkCardProps {
  link: WebsiteLink;
  onClick: (link: WebsiteLink) => void;
  onEdit?: (link: WebsiteLink) => void;
  onDelete?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  listLayout?: boolean;
  disabled?: boolean;
  allowSystemEdit?: boolean;
  compactMode?: boolean;
  showActions?: boolean;
}

export function DraggableLinkCard({
  link,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  listLayout = false,
  disabled = false,
  allowSystemEdit = false,
  compactMode = false,
  showActions = false
}: DraggableLinkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: link.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandleProps = disabled ? {} : {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  };

  return (
    <LinkCard
      link={link}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleFavorite={onToggleFavorite}
      isDragging={isDragging}
      dragHandleProps={dragHandleProps}
      listLayout={listLayout}
      allowSystemEdit={allowSystemEdit}
      compactMode={compactMode}
      showActions={showActions}
    />
  );
}
