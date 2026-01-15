import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ContentCalendar from '@/components/content-calender';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    companies?: Array<{ id: number; name: string }>;
    contentCalendar?: Array<{
        id: number;
        date: string;
        title: string;
        description: string;
        content_link: string;
        company_id: number;
        type?: string;
        company?: { id: number; name: string };
        feedbacks?: Array<{
            id: number;
            feedback: string;
            user_id: number;
            created_at: string;
            user?: { id: number; name: string; email: string };
        }>;
    }>;
}

export default function Dashboard({ companies = [], contentCalendar = [] }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <ContentCalendar companies={companies} existingContent={contentCalendar} />
        </AppLayout>
    );
}
