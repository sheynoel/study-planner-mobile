import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type TextInputProps } from 'react-native';

import { FormField } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';

export function AppTextInput(props: TextInputProps & { error?: string; label: string }) { return <FormField {...props} />; }
export function AppSelectField({ children, label }: PropsWithChildren<{ label: string }>) { return <View style={styles.field}><ThemedText type="defaultSemiBold">{label}</ThemedText><View style={styles.options}>{children}</View></View>; }
export const FilterChip = ChoiceChip;
const styles = StyleSheet.create({ field: { gap: DesignTokens.spacing.sm }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm } });
