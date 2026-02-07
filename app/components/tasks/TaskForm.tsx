import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { Task, TaskPriority, Team, TeamMemberWithProfile, TaskStatus, TaskType } from '@/lib/types';
import { formatDate } from '@/lib/tasks';
import { useAppTheme } from '@/lib/theme';

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onDelete?: () => void;
  submitLabel: string;
  isLoading?: boolean;
  // Business mode props
  isBusinessMode?: boolean;
  teams?: Team[];
  assignableMembers?: TeamMemberWithProfile[];
}

export interface TaskFormValues {
  title: string;
  description: string;
  due_date: string;
  end_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskType;
  team_id: string | null;
  assignee_id: string | null;
}

export default function TaskForm({
  initialValues,
  onSubmit,
  onDelete,
  submitLabel,
  isLoading = false,
  isBusinessMode = false,
  teams = [],
  assignableMembers = [],
}: TaskFormProps) {
  const { colors, spacing, radius, typography } = useAppTheme();

  const priorityOptions = useMemo(
    () =>
      [
        { value: 'low' as const, label: 'Low', color: colors.textSubtle },
        { value: 'medium' as const, label: 'Medium', color: colors.textMuted },
        { value: 'high' as const, label: 'High', color: colors.danger },
      ] satisfies { value: TaskPriority; label: string; color: string }[],
    [colors.danger, colors.textMuted, colors.textSubtle]
  );

  const webStyles = useMemo(() => {
    const input: React.CSSProperties = {
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      border: `1px solid ${colors.border}`,
      padding: `${spacing.md}px`,
      fontSize: typography.body,
      color: colors.text,
    };

    const calendarWrapper: React.CSSProperties = {
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      border: `1px solid ${colors.border}`,
      padding: `${spacing.md}px`,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
      width: '100%',
      maxWidth: '340px',
    };

    const calendarHeader: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: `${spacing.md}px`,
      gap: `${spacing.sm}px`,
    };

    const calendarNavButton: React.CSSProperties = {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
      fontSize: '18px',
      color: colors.primary,
      cursor: 'pointer',
      padding: '6px 10px',
      lineHeight: '18px',
    };

    const calendarMonthLabel: React.CSSProperties = {
      fontSize: `${typography.subtext}px`,
      fontWeight: 700,
      color: colors.text,
      textAlign: 'center',
      flex: 1,
    };

    const calendarTable: React.CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
    };

    const calendarTh: React.CSSProperties = {
      padding: '8px 4px',
      fontSize: `${typography.caption}px`,
      fontWeight: 700,
      color: colors.textMuted,
      textAlign: 'center',
    };

    const calendarTd: React.CSSProperties = {
      padding: '4px',
      textAlign: 'center',
    };

    const calendarDayButton: React.CSSProperties = {
      width: '100%',
      padding: '8px',
      backgroundColor: 'transparent',
      border: `1px solid transparent`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: `${typography.subtext}px`,
      color: colors.text,
      transition: 'background-color 0.15s ease, border-color 0.15s ease',
    };

    const calendarDaySelected: React.CSSProperties = {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: colors.onPrimary,
      fontWeight: 700,
    };

    const calendarOtherMonthDay: React.CSSProperties = {
      color: colors.textSubtle,
      cursor: 'default',
    };

    const calendarDayDisabled: React.CSSProperties = {
      opacity: 0.45,
      cursor: 'not-allowed',
    };

    return {
      input,
      calendarWrapper,
      calendarHeader,
      calendarNavButton,
      calendarMonthLabel,
      calendarTable,
      calendarTh,
      calendarTd,
      calendarDayButton,
      calendarDaySelected,
      calendarOtherMonthDay,
      calendarDayDisabled,
    } as const;
  }, [colors, radius.sm, spacing.md, spacing.sm, typography.body, typography.caption, typography.subtext]);

  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [dueDate, setDueDate] = useState<Date>(
    initialValues?.due_date ? new Date(initialValues.due_date + 'T00:00:00') : new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialValues?.end_date ? new Date(initialValues.end_date + 'T00:00:00') : null
  );
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status || 'new');
  const [isMultiDay, setIsMultiDay] = useState(!!initialValues?.end_date);
  
  // Business mode state
  const [taskType, setTaskType] = useState<TaskType>(initialValues?.task_type || 'personal');
  const [teamId, setTeamId] = useState<string | null>(initialValues?.team_id || null);
  const [assigneeId, setAssigneeId] = useState<string | null>(initialValues?.assignee_id || null);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  // Date picker visibility states
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Simple inline calendar component for web
  const InlineCalendar = ({
    selected,
    onSelect,
    minDate,
  }: {
    selected: Date;
    onSelect: (d: Date) => void;
    minDate?: Date;
  }) => {
    const [viewDate, setViewDate] = useState<Date>(() => new Date(selected));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const weeks = useMemo(() => {
      const weeks: Date[][] = [];
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      let currentWeek: Date[] = [];
      // fill prev month
      const startDayOfWeek = firstDay.getDay();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        currentWeek.push(new Date(year, month, -i));
      }

      for (let d = 1; d <= lastDay.getDate(); d++) {
        currentWeek.push(new Date(year, month, d));
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      if (currentWeek.length > 0) {
        let nd = 1;
        while (currentWeek.length < 7) {
          currentWeek.push(new Date(year, month + 1, nd));
          nd++;
        }
        weeks.push(currentWeek);
      }

      return weeks;
    }, [year, month]);

    const isSameDay = (a: Date, b: Date) => {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    };

    return (
      <div style={webStyles.calendarWrapper}>
        <div style={webStyles.calendarHeader}>
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            style={webStyles.calendarNavButton}
          >‹</button>
          <div style={webStyles.calendarMonthLabel}>
            {viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
            style={webStyles.calendarNavButton}
          >›</button>
        </div>

        <table style={webStyles.calendarTable}>
          <thead>
            <tr>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <th key={d} style={webStyles.calendarTh}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((date, di) => {
                  const disabled = minDate ? date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;
                  return (
                    <td key={di} style={webStyles.calendarTd}>
                      <button
                        onClick={() => !disabled && onSelect(new Date(date.getFullYear(), date.getMonth(), date.getDate()))}
                        disabled={disabled}
                        style={{
                          ...webStyles.calendarDayButton,
                          ...(isSameDay(date, selected) ? webStyles.calendarDaySelected : {}),
                          ...(date.getMonth() !== month ? webStyles.calendarOtherMonthDay : {}),
                          ...(disabled ? webStyles.calendarDayDisabled : {}),
                        }}
                      >
                        {date.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Validation errors
  const [errors, setErrors] = useState<{ title?: string; endDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get filtered assignable members for selected team
  const filteredMembers = teamId 
    ? assignableMembers.filter(m => m.team_id === teamId)
    : assignableMembers;

  // Get selected team and assignee for display
  const selectedTeam = teams.find(t => t.id === teamId);
  const selectedAssignee = assignableMembers.find(m => m.user_id === assigneeId);

  const validate = (): boolean => {
    const newErrors: { title?: string; endDate?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (isMultiDay && endDate && endDate < dueDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting || isLoading) {
      return;
    }
    
    const isValid = validate();
    if (!isValid) return;

    setIsSubmitting(true);
    
    const values: TaskFormValues = {
      title: title.trim(),
      description: description.trim(),
      due_date: formatDate(dueDate),
      end_date: isMultiDay && endDate ? formatDate(endDate) : null,
      status,
      priority,
      task_type: isBusinessMode && teamId ? 'business' : 'personal',
      team_id: isBusinessMode ? teamId : null,
      assignee_id: isBusinessMode ? assigneeId : null,
    };

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      // Re-throw so parent screens can show user-visible errors (Alert/toast)
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onDueDateChange = (_: any, selectedDate?: Date) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
      // If end date is before new due date, reset it
      if (endDate && endDate < selectedDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (_: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title Input */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: radius.sm,
            },
            errors.title && { borderColor: colors.danger },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.textSubtle}
          autoFocus
        />
        {errors.title && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.title}</Text>}
      </View>

      {/* Status Selector */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Status</Text>
        <View style={styles.chipRow}>
          {([
            { value: 'new' as const, label: 'New' },
            { value: 'in_progress' as const, label: 'In Progress' },
            { value: 'completed' as const, label: 'Completed' },
          ] satisfies { value: TaskStatus; label: string }[]).map((opt) => {
            const selected = status === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setStatus(opt.value)}
                style={({ pressed, hovered }) => [
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: radius.pill,
                  },
                  (hovered || pressed) && !selected && { borderColor: colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={{
                    color: selected ? colors.onPrimary : colors.text,
                    fontWeight: selected ? '700' : '600',
                    fontSize: typography.caption,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: radius.sm,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          placeholderTextColor={colors.textSubtle}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Due Date Picker */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Due Date *</Text>
          {Platform.OS === 'web' ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                style={{ ...webStyles.input, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                role="button"
                tabIndex={0}
                aria-label="Due date"
              >
                <FontAwesome name="calendar" size={16} color={colors.primary} />
                <span style={{ marginLeft: 10, color: colors.text }}>{formatDisplayDate(dueDate)}</span>
              </div>

              {showDueDatePicker && (
                <div style={{ marginTop: 8, zIndex: 40 }}>
                  <InlineCalendar
                    selected={dueDate}
                    onSelect={(d: Date) => {
                      setDueDate(d);
                      setShowDueDatePicker(false);
                      if (endDate && endDate < d) setEndDate(d);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}
              onPress={() => setShowDueDatePicker(true)}
            >
              <FontAwesome name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDisplayDate(dueDate)}</Text>
            </TouchableOpacity>
          )}
          {Platform.OS !== 'web' && showDueDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={onDueDateChange}
            />
          )}
      </View>

      {/* Multi-day Toggle */}
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => {
          setIsMultiDay(!isMultiDay);
          if (!isMultiDay && !endDate) {
            // Set default end date to day after due date
            const nextDay = new Date(dueDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setEndDate(nextDay);
          }
        }}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.primary },
            isMultiDay && styles.checkboxChecked,
            isMultiDay && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          {isMultiDay && <FontAwesome name="check" size={12} color={colors.onPrimary} />}
        </View>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>Multi-day task</Text>
      </TouchableOpacity>

      {/* End Date Picker (if multi-day) */}
      {isMultiDay && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
          {Platform.OS === 'web' ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                style={{ ...webStyles.input, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                role="button"
                tabIndex={0}
                aria-label="End date"
              >
                <FontAwesome name="calendar" size={16} color={colors.primary} />
                <span style={{ marginLeft: 10, color: colors.text }}>
                  {endDate ? formatDisplayDate(endDate) : formatDisplayDate(dueDate)}
                </span>
              </div>

              {showEndDatePicker && (
                <div style={{ marginTop: 8, zIndex: 40 }}>
                  <InlineCalendar
                    selected={endDate || dueDate}
                    minDate={dueDate}
                    onSelect={(d: Date) => {
                      setEndDate(d);
                      setShowEndDatePicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <FontAwesome name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {endDate ? formatDisplayDate(endDate) : 'Select end date'}
              </Text>
            </TouchableOpacity>
          )}
          {errors.endDate && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.endDate}</Text>}
          {Platform.OS !== 'web' && showEndDatePicker && (
            <DateTimePicker
              value={endDate || dueDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
              minimumDate={dueDate}
            />
          )}
        </View>
      )}

      {/* Team Selector (Business Mode Only) */}
      {isBusinessMode && teams.length > 0 && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Team (Optional)</Text>
          <TouchableOpacity
            style={[styles.selectorButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}
            onPress={() => setShowTeamPicker(!showTeamPicker)}
          >
            <FontAwesome name="users" size={16} color={colors.primary} />
            <Text style={[styles.selectorText, { color: colors.text }]}>
              {selectedTeam ? selectedTeam.name : 'Personal Task'}
            </Text>
            <FontAwesome 
              name={showTeamPicker ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={colors.textMuted} 
            />
          </TouchableOpacity>
          
          {showTeamPicker && (
            <View style={[styles.pickerOptions, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.border },
                  !teamId && { backgroundColor: `${colors.primary}14` },
                ]}
                onPress={() => {
                  setTeamId(null);
                  setAssigneeId(null);
                  setShowTeamPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  { color: colors.text },
                  !teamId && { color: colors.primary, fontWeight: '600' },
                ]}>Personal Task</Text>
              </TouchableOpacity>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.pickerOption,
                    { borderBottomColor: colors.border },
                    teamId === team.id && { backgroundColor: `${colors.primary}14` },
                  ]}
                  onPress={() => {
                    setTeamId(team.id);
                    setAssigneeId(null); // Reset assignee when team changes
                    setShowTeamPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    { color: colors.text },
                    teamId === team.id && { color: colors.primary, fontWeight: '600' },
                  ]}>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Assignee Selector (Business Mode Only, when team selected) */}
      {isBusinessMode && teamId && filteredMembers.length > 0 && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Assign To (Optional)</Text>
          <TouchableOpacity
            style={[styles.selectorButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}
            onPress={() => setShowAssigneePicker(!showAssigneePicker)}
          >
            <FontAwesome name="user" size={16} color={colors.primary} />
            <Text style={[styles.selectorText, { color: colors.text }]}>
              {selectedAssignee?.profile 
                ? (selectedAssignee.profile.full_name || selectedAssignee.profile.email || 'Team Member')
                : 'Unassigned'}
            </Text>
            <FontAwesome 
              name={showAssigneePicker ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={colors.textMuted} 
            />
          </TouchableOpacity>
          
          {showAssigneePicker && (
            <View style={[styles.pickerOptions, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.border },
                  !assigneeId && { backgroundColor: `${colors.primary}14` },
                ]}
                onPress={() => {
                  setAssigneeId(null);
                  setShowAssigneePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  { color: colors.text },
                  !assigneeId && { color: colors.primary, fontWeight: '600' },
                ]}>Unassigned</Text>
              </TouchableOpacity>
              {filteredMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.pickerOption,
                    { borderBottomColor: colors.border },
                    assigneeId === member.user_id && { backgroundColor: `${colors.primary}14` },
                  ]}
                  onPress={() => {
                    setAssigneeId(member.user_id);
                    setShowAssigneePicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    { color: colors.text },
                    assigneeId === member.user_id && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {member.profile?.full_name || member.profile?.email || 'Team Member'}
                    {member.role === 'admin' ? ' (Admin)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Priority Selector */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {priorityOptions.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.priorityButton,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm },
                priority === p.value && { backgroundColor: p.color, borderColor: p.color },
              ]}
              onPress={() => setPriority(p.value)}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: colors.textMuted },
                  priority === p.value && { color: colors.onPrimary },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: colors.primary, borderRadius: radius.sm },
          (isLoading || isSubmitting) && styles.submitButtonDisabled,
          (isLoading || isSubmitting) && { backgroundColor: colors.border },
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleSubmit}
        disabled={isLoading || isSubmitting}
      >
        <Text
          style={[
            styles.submitButtonText,
            { color: isLoading || isSubmitting ? colors.textMuted : colors.onPrimary },
          ]}
        >
          {isLoading || isSubmitting ? 'Saving...' : submitLabel}
        </Text>
      </Pressable>

      {/* Delete Button (for edit mode) */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
        >
          <FontAwesome name="trash" size={16} color={colors.danger} />
          <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Delete Task</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
  },
  toggleLabel: {
    fontSize: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityTextSelected: {},
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  // Selector styles for team and assignee
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  pickerOptionSelected: {
  },
  pickerOptionText: {
    fontSize: 16,
  },
  pickerOptionTextSelected: {
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
