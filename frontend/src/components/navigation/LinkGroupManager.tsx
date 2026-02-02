import React, { useState } from 'react';
import { WebsiteLink, Group, CreateLinkRequest, UpdateLinkRequest, CreateGroupRequest, UpdateGroupRequest } from '../../types';
import { LinkModal } from './LinkModal';
import { GroupModal } from './GroupModal';
import { ConfirmDialog } from './ConfirmDialog';
import './LinkGroupManager.css';

interface LinkGroupManagerProps {
  groups: Group[];
  links: WebsiteLink[];
  onCreateLink: (linkData: CreateLinkRequest) => Promise<void>;
  onUpdateLink: (id: number, linkData: UpdateLinkRequest) => Promise<void>;
  onDeleteLink: (id: number) => Promise<void>;
  onCreateGroup: (groupData: CreateGroupRequest) => Promise<void>;
  onUpdateGroup: (id: number, groupData: UpdateGroupRequest) => Promise<void>;
  onDeleteGroup: (id: number) => Promise<void>;
  allowSystemGroup?: boolean;
}

export function LinkGroupManager({
  groups,
  links,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  allowSystemGroup = false
}: LinkGroupManagerProps) {
  // Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalMode, setLinkModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLink, setSelectedLink] = useState<WebsiteLink | null>(null);

  // Group modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'link' | 'group';
    item: WebsiteLink | Group | null;
    loading: boolean;
  }>({
    isOpen: false,
    type: 'link',
    item: null,
    loading: false
  });

  const handleLinkSave = async (linkData: CreateLinkRequest | UpdateLinkRequest) => {
    if (linkModalMode === 'create') {
      await onCreateLink(linkData as CreateLinkRequest);
    } else if (selectedLink) {
      await onUpdateLink(selectedLink.id, linkData as UpdateLinkRequest);
    }
  };

  const handleGroupSave = async (groupData: CreateGroupRequest | UpdateGroupRequest) => {
    if (groupModalMode === 'create') {
      await onCreateGroup(groupData as CreateGroupRequest);
    } else if (selectedGroup) {
      await onUpdateGroup(selectedGroup.id, groupData as UpdateGroupRequest);
    }
  };

  // Confirm dialog functions
  const handleConfirmDelete = async () => {
    if (!confirmDialog.item) return;

    setConfirmDialog(prev => ({ ...prev, loading: true }));

    try {
      if (confirmDialog.type === 'link') {
        await onDeleteLink(confirmDialog.item.id);
      } else {
        await onDeleteGroup(confirmDialog.item.id);
      }
      setConfirmDialog({ isOpen: false, type: 'link', item: null, loading: false });
    } catch (error) {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      // Error handling is done by parent component
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialog({ isOpen: false, type: 'link', item: null, loading: false });
  };

  // Get confirmation dialog content
  const getConfirmContent = () => {
    if (!confirmDialog.item) return { title: '', message: '' };

    if (confirmDialog.type === 'link') {
      const link = confirmDialog.item as WebsiteLink;
      return {
        title: 'Delete Link',
        message: `Are you sure you want to delete "${link.name}"? This action cannot be undone.`
      };
    } else {
      const group = confirmDialog.item as Group;
      const linkCount = links.filter(link => link.groupId === group.id).length;
      return {
        title: 'Delete Group',
        message: linkCount > 0 
          ? `Are you sure you want to delete "${group.name}"? This will also delete ${linkCount} link${linkCount === 1 ? '' : 's'} in this group. This action cannot be undone.`
          : `Are you sure you want to delete "${group.name}"? This action cannot be undone.`
      };
    }
  };

  const confirmContent = getConfirmContent();

  return (
    <>
      {/* Link Modal */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleLinkSave}
        link={selectedLink}
        groups={groups}
        mode={linkModalMode}
      />

      {/* Group Modal */}
      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleGroupSave}
        group={selectedGroup}
        mode={groupModalMode}
        existingGroups={groups}
        allowSystemGroup={allowSystemGroup}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleConfirmCancel}
        onConfirm={handleConfirmDelete}
        title={confirmContent.title}
        message={confirmContent.message}
        confirmText="Delete"
        type="danger"
        loading={confirmDialog.loading}
      />
    </>
  );
}
