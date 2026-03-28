import { type ReactNode } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

/* ============================================================
   Reusable dashboard shell — sidebar + main area
   Provides consistent premium layout for all 3 dashboards.
   ============================================================ */

export interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  variant?: 'default' | 'danger';
}

interface DashboardShellProps {
  /** Page title */
  title: string;
  /** Subtitle / description */
  subtitle: string;
  /** Sidebar navigation items */
  navItems: SidebarItem[];
  /** Currently active tab id */
  activeTab: string;
  /** Called when a nav item is clicked */
  onTabChange: (tabId: string) => void;
  /** Optional header with avatar + name for profile-based dashboards */
  sidebarHeader?: ReactNode;
  /** Optional action buttons in the page header (e.g. logout) */
  headerActions?: ReactNode;
  /** Main content */
  children: ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
  sidebarHeader,
  headerActions,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h2 className="text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 animate-fade-in-up stagger-1">
            <Card className="p-5 sticky top-24">
              {sidebarHeader && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  {sidebarHeader}
                </div>
              )}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isDanger = item.variant === 'danger';
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isDanger
                          ? 'text-red-600 hover:bg-red-50'
                          : isActive
                            ? 'bg-ocean-50 text-ocean-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className={`shrink-0 ${isActive && !isDanger ? 'text-ocean-600' : ''}`}>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && (
                        <Badge variant={item.badgeVariant || 'warning'} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 animate-fade-in-up stagger-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Stat Card — for dashboard overview sections
   ============================================================ */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  subtitle?: string;
  subtitleColor?: string;
}

export function StatCard({ label, value, icon, iconBg = 'bg-ocean-100', subtitle, subtitleColor = 'text-gray-500' }: StatCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold text-gray-900 truncate">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
          {subtitle && <div className={`text-xs mt-0.5 ${subtitleColor}`}>{subtitle}</div>}
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   Section Title — consistent heading for dashboard sections
   ============================================================ */

interface SectionTitleProps {
  title: string;
  action?: ReactNode;
}

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-gray-900 font-semibold">{title}</h3>
      {action}
    </div>
  );
}
