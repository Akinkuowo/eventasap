// app/dashboard/layout.tsx
import DashboardLayout from '../components/dashboard/dashboardLayout';

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}