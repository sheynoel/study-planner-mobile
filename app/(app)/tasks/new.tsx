import { Ionicons } from '@expo/vector-icons';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Keyboard, KeyboardAvoidingView, LayoutAnimation, PanResponder, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskCreateSheetForm } from '@/components/tasks/task-create-sheet-form';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { EMPTY_TASK_FORM, type TaskFormValues, toCreateTaskRequest } from '@/lib/tasks/task-form';

export default function AddTaskScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[] }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const { height } = useWindowDimensions();
  const { colors } = useAppearance();
  const navigation = useNavigation();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const { createTask } = useTasks();
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const allowClose = useRef(false);
  const translateY = useRef(new Animated.Value(640)).current;
  const initialValues = useMemo(() => ({ ...EMPTY_TASK_FORM, courseId: courseId ?? null }), [courseId]);
  const refreshCourses = useCallback(() => loadCourses(), [loadCourses]);

  useEffect(() => { void refreshCourses().catch(() => undefined); Animated.spring(translateY, { damping: 24, stiffness: 240, toValue: 0, useNativeDriver: true }).start(); }, [refreshCourses, translateY]);
  useEffect(() => { const show = Keyboard.addListener('keyboardDidShow', () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(true); }); return () => show.remove(); }, []);
  usePreventRemove(dirty && !allowClose.current, ({ data }) => { Alert.alert('Discard this task?', 'Your unsaved task will be lost.', [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]); });
  const close = useCallback(() => { if (!submitting) router.back(); }, [submitting]);
  const snap = useCallback((nextExpanded: boolean) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(nextExpanded); Animated.spring(translateY, { damping: 22, stiffness: 260, toValue: 0, useNativeDriver: true }).start(); }, [translateY]);
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => !submitting && Math.abs(gesture.dy) > 7 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_event, gesture) => translateY.setValue(Math.max(-48, gesture.dy)),
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy < -44 || gesture.vy < -0.8) { snap(true); return; }
      if (expanded && (gesture.dy > 46 || gesture.vy > 0.85)) { snap(false); return; }
      if (!expanded && (gesture.dy > 100 || gesture.vy > 1.2)) { translateY.setValue(0); close(); return; }
      snap(expanded);
    },
  }), [close, expanded, snap, submitting, translateY]);

  async function handleCreate(values: TaskFormValues) { await createTask(toCreateTaskRequest({ ...values, status: 'TODO' })); allowClose.current = true; setDirty(false); router.back(); }
  const sheetHeight = height * (expanded ? 0.96 : 0.75);

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}><Pressable accessibilityLabel="Close new task" onPress={close} style={StyleSheet.absoluteFill} /><Animated.View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, height: sheetHeight, transform: [{ translateY }] }, Shadows]}><SafeAreaView edges={['bottom']} style={styles.safeArea}><View {...panResponder.panHandlers} style={styles.dragArea}><View style={[styles.handle, { backgroundColor: colors.border }]} /></View><View style={styles.header}><ThemedText style={styles.title}>New Task</ThemedText><Pressable accessibilityLabel="Close new task" onPress={close} style={styles.close}><Ionicons color={colors.textSecondary} name="close" size={20} /></Pressable></View>
    {listStatus === 'idle' || listStatus === 'loading' ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><ThemedText style={{ color: colors.textSecondary }}>Loading courses…</ThemedText></View> : null}
    {listStatus === 'error' ? <View style={styles.loading}><ThemedText style={[styles.error, { color: colors.dangerText }]}>{listError ?? 'Courses could not be loaded.'}</ThemedText><Pressable onPress={() => void refreshCourses().catch(() => undefined)} style={styles.retry}><ThemedText style={{ color: colors.primary, fontWeight: '700' }}>Retry</ThemedText></Pressable></View> : null}
    {listStatus === 'success' ? <TaskCreateSheetForm courses={courses} initialValues={initialValues} onDirtyChange={setDirty} onSubmit={handleCreate} onSubmittingChange={setSubmitting} /> : null}
  </SafeAreaView></Animated.View></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ overlay: { backgroundColor: 'rgba(12,15,18,0.32)', flex: 1, justifyContent: 'flex-end' }, sheet: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' }, safeArea: { flex: 1 }, dragArea: { alignItems: 'center', height: 22, justifyContent: 'center' }, handle: { borderRadius: 999, height: 4, opacity: 0.6, width: 42 }, header: { alignItems: 'center', flexDirection: 'row', minHeight: 42, paddingHorizontal: DesignTokens.layout.screenPadding }, title: { flex: 1, fontSize: 18, fontWeight: '800', lineHeight: 23 }, close: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, loading: { alignItems: 'center', flex: 1, gap: DesignTokens.spacing.sm, justifyContent: 'center', padding: DesignTokens.layout.screenPadding }, error: { fontSize: 12, lineHeight: 17, textAlign: 'center' }, retry: { alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: DesignTokens.spacing.lg } });
