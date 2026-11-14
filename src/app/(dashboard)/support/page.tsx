import React from 'react';
import type { Metadata } from 'next';
import { SupportClientView } from './SupportClientView';

export const metadata: Metadata = {
  title: 'Live Support & Chat Queue | GASH Dashboard',
  description: 'Real-time customer support desk, ticket claims, and live chat management.',
};

export default function SupportPage() {
  return <SupportClientView />;
}
