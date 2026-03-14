'use client';

import { Suspense } from 'react';
import ReviewPageContent from './review-content';

function ReviewPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading review queue...</div>
        </div>
      </main>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}

export default ReviewPageWrapper;
