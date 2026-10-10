import { Provider } from '@/components/provider';
import type { Metadata } from 'next';
import './global.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://18794-group12.github.io/'),
  title: { default: 'MetaTrace · Group 12', template: '%s · Group 12' },
  description: 'AI image attribution: separating content cues from generator fingerprints. An 18-794 Group 12 project.',
  robots: { index: false, follow: false, nosnippet: true, noimageindex: true },
};
export default function Layout({ children }: LayoutProps<'/'>) {
  return <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
    <body className="flex flex-col min-h-screen"><Provider>{children}</Provider></body>
  </html>;
}
