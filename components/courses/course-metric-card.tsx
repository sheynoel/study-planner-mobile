import type { ComponentProps } from 'react';

import { MetricCard } from '@/components/ui/metric-card';

export function CourseMetricCard(props: ComponentProps<typeof MetricCard>) { return <MetricCard {...props} />; }
