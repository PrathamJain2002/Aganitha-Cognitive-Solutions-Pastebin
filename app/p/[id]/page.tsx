import { headers } from 'next/headers';
import { getPasteContent } from '@/lib/paste';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;
  
  // Get request headers for test mode support
  const headersList = await headers();
  const content = await getPasteContent(id, headersList);

  if (!content) {
    notFound();
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const escapedContent = escapeHtml(content);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Paste Content</h1>
          <pre className="whitespace-pre-wrap break-words font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
            {escapedContent}
          </pre>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Paste ${id}`,
  };
}

