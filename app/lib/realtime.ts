import { useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { Task } from './types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TaskChangeCallback = (
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  task: Task,
  oldTask?: Task
) => void;

/**
 * Hook to subscribe to real-time task changes
 * @param userId - The current user's ID
 * @param teamIds - Array of team IDs the user belongs to
 * @param onTaskChange - Callback when a task changes
 */
export function useTaskRealtime(
  userId: string | undefined,
  teamIds: string[],
  onTaskChange: TaskChangeCallback,
  includeAllTeamTasks: boolean = false
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onTaskChange);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onTaskChange;
  }, [onTaskChange]);

  useEffect(() => {
    if (!userId) return;

    // Create a unique channel name
    const channelName = `tasks-${userId}-${Date.now()}`;

    // Subscribe to task changes
    const channel = supabase
      .channel(channelName)
      .on<Task>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          const newTask = payload.new as Task;
          const oldTask = payload.old as Task | undefined;

          // Filter: only process tasks relevant to this user
          const isRelevant = isTaskRelevantToUser(
            newTask || oldTask,
            userId,
            teamIds,
            includeAllTeamTasks
          );

          if (!isRelevant) return;

          switch (payload.eventType) {
            case 'INSERT':
              callbackRef.current('INSERT', newTask);
              break;
            case 'UPDATE':
              callbackRef.current('UPDATE', newTask, oldTask);
              break;
            case 'DELETE':
              if (oldTask) {
                callbackRef.current('DELETE', oldTask as Task);
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime: Subscribed to task changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime: Channel error');
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        console.log('Realtime: Unsubscribing from task changes');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, teamIds.join(','), includeAllTeamTasks]); // Join teamIds to create stable dependency
}

/**
 * Check if a task is relevant to the current user
 */
function isTaskRelevantToUser(
  task: Task | undefined,
  userId: string,
  teamIds: string[],
  includeAllTeamTasks: boolean
): boolean {
  if (!task) return false;

  // Personal task created by user
  if (task.created_by === userId && !task.team_id) {
    return true;
  }

  // Team task in user's teams
  if (task.team_id && teamIds.includes(task.team_id)) {
    if (includeAllTeamTasks) {
      return true;
    }

    // Either assigned to user, unassigned, or created by user
    if (!task.assignee_id || task.assignee_id === userId || task.created_by === userId) {
      return true;
    }
  }

  // Task assigned to user
  if (task.assignee_id === userId) {
    return true;
  }

  return false;
}

/**
 * Hook to subscribe to team member changes (for business mode)
 */
export function useTeamMemberRealtime(
  companyId: string | undefined,
  onMemberChange: () => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`team-members-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
        },
        () => {
          // Trigger a refresh when team members change
          onMemberChange();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [companyId, onMemberChange]);
}

/**
 * Hook to subscribe to invite code changes (for business mode)
 */
export function useInviteCodeRealtime(
  companyId: string | undefined,
  onInviteChange: () => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`invite-codes-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invite_codes',
        },
        () => {
          onInviteChange();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [companyId, onInviteChange]);
}
