import { useState, useEffect, useRef } from 'react';
import { fetchGroupMembers } from '../utils/api';
import type { GroupMember, Contact } from '../types/chat';

export function useGroupMembers(groupId: string | null, isGroup?: boolean) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Track the last successfully loaded groupId to avoid clearing data prematurely
  const lastLoadedGroupId = useRef<string | null>(null);

  useEffect(() => {
    // Don't do anything if isGroup is undefined (still loading contact info)
    if (isGroup === undefined) {
      return;
    }

    // Clear members if not a group or no groupId
    if (!groupId || !isGroup) {
      setMembers([]);
      lastLoadedGroupId.current = null;
      return;
    }

    // Skip if already loaded for this groupId
    if (lastLoadedGroupId.current === groupId && members.length > 0) {
      return;
    }

    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGroupMembers(groupId);
        // Transform API response to frontend types
        const transformedMembers: GroupMember[] = data.map((m) => ({
          groupId: m.group_id,
          memberId: m.member_id,
          isAdmin: m.is_admin === 1,
          member: {
            id: m.id || m.member_id,
            name: m.name,
            phone: m.phone || undefined,
            avatarUrl: m.avatar_url || undefined,
            about: m.about || undefined,
            isGroup: m.is_group === 1,
            language: m.language || 'en',
            personaPrompt: m.persona_prompt || undefined,
            createdAt: m.created_at || new Date().toISOString(),
          } as Contact,
        }));
        setMembers(transformedMembers);
        lastLoadedGroupId.current = groupId;
      } catch (error) {
        console.error('Failed to fetch group members:', error);
        setMembers([]);
        lastLoadedGroupId.current = null;
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [groupId, isGroup]);

  // Calculate member count: members + 1 for "You", but only if we have members loaded
  const memberCount = isGroup && members.length > 0 ? members.length + 1 : (isGroup ? 1 : 0);

  return {
    members,
    memberCount,
    isLoading,
  };
}
