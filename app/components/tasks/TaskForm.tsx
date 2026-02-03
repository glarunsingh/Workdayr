import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { Task, TaskPriority, Team, TeamMemberWithProfile, TaskType } from '@/lib/types';
import { formatDate } from '@/lib/tasks';

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
  priority: TaskPriority;
  task_type: TaskType;
  team_id: string | null;
  assignee_id: string | null;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#999' },
  { value: 'medium', label: 'Medium', color: '#666' },
  { value: 'high', label: 'High', color: '#FF3B30' },
];

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
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [dueDate, setDueDate] = useState<Date>(
    initialValues?.due_date ? new Date(initialValues.due_date + 'T00:00:00') : new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialValues?.end_date ? new Date(initialValues.end_date + 'T00:00:00') : null
  );
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority || 'medium');
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
    if (isSubmitting || isLoading) return;
    if (!validate()) return;

    setIsSubmitting(true);
    
    const values: TaskFormValues = {
      title: title.trim(),
      description: description.trim(),
      due_date: formatDate(dueDate),
      end_date: isMultiDay && endDate ? formatDate(endDate) : null,
      priority,
      task_type: isBusinessMode && teamId ? 'business' : 'personal',
      team_id: isBusinessMode ? teamId : null,
      assignee_id: isBusinessMode ? assigneeId : null,
    };

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Title Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor="#999"
          autoFocus
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      {/* Description Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Due Date Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Due Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDueDatePicker(true)}
        >
          <FontAwesome name="calendar" size={16} color="#007AFF" />
          <Text style={styles.dateText}>{formatDisplayDate(dueDate)}</Text>
        </TouchableOpacity>
        {showDueDatePicker && (
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
        <View style={[styles.checkbox, isMultiDay && styles.checkboxChecked]}>
          {isMultiDay && <FontAwesome name="check" size={12} color="#fff" />}
        </View>
        <Text style={styles.toggleLabel}>Multi-day task</Text>
      </TouchableOpacity>

      {/* End Date Picker (if multi-day) */}
      {isMultiDay && (
        <View style={styles.field}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <FontAwesome name="calendar" size={16} color="#007AFF" />
            <Text style={styles.dateText}>
              {endDate ? formatDisplayDate(endDate) : 'Select end date'}
            </Text>
          </TouchableOpacity>
          {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
          {showEndDatePicker && (
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
          <Text style={styles.label}>Team (Optional)</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowTeamPicker(!showTeamPicker)}
          >
            <FontAwesome name="users" size={16} color="#007AFF" />
            <Text style={styles.selectorText}>
              {selectedTeam ? selectedTeam.name : 'Personal Task'}
            </Text>
            <FontAwesome 
              name={showTeamPicker ? "chevron-up" : "chevron-down"} 
              size={12} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showTeamPicker && (
            <View style={styles.pickerOptions}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  !teamId && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setTeamId(null);
                  setAssigneeId(null);
                  setShowTeamPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  !teamId && styles.pickerOptionTextSelected,
                ]}>Personal Task</Text>
              </TouchableOpacity>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.pickerOption,
                    teamId === team.id && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setTeamId(team.id);
                    setAssigneeId(null); // Reset assignee when team changes
                    setShowTeamPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    teamId === team.id && styles.pickerOptionTextSelected,
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
          <Text style={styles.label}>Assign To (Optional)</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowAssigneePicker(!showAssigneePicker)}
          >
            <FontAwesome name="user" size={16} color="#007AFF" />
            <Text style={styles.selectorText}>
              {selectedAssignee?.profile 
                ? (selectedAssignee.profile.full_name || selectedAssignee.profile.email || 'Team Member')
                : 'Unassigned'}
            </Text>
            <FontAwesome 
              name={showAssigneePicker ? "chevron-up" : "chevron-down"} 
              size={12} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showAssigneePicker && (
            <View style={styles.pickerOptions}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  !assigneeId && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setAssigneeId(null);
                  setShowAssigneePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  !assigneeId && styles.pickerOptionTextSelected,
                ]}>Unassigned</Text>
              </TouchableOpacity>
              {filteredMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.pickerOption,
                    assigneeId === member.user_id && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setAssigneeId(member.user_id);
                    setShowAssigneePicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    assigneeId === member.user_id && styles.pickerOptionTextSelected,
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
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.priorityButton,
                priority === p.value && { backgroundColor: p.color },
              ]}
              onPress={() => setPriority(p.value)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === p.value && styles.priorityTextSelected,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (isLoading || isSubmitting) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isLoading || isSubmitting ? 'Saving...' : submitLabel}
        </Text>
      </TouchableOpacity>

      {/* Delete Button (for edit mode) */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
        >
          <FontAwesome name="trash" size={16} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
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
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  // Selector styles for team and assignee
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF10',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
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
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
