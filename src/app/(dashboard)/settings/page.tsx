import type { Metadata } from 'next';
import { SettingsClientView } from './SettingsClientView';

export const metadata: Metadata = {
  title: 'Settings | GASH Dashboard',
  description: 'Manage staff account credentials, security settings, and view system diagnostics.',
};

export default function SettingsPage() {
  return <SettingsClientView />;
}
