import { NextResponse } from 'next/server'
import { doc, getDoc, collectionGroup, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch from all 'topics' subcollections since the actual topic might be nested
    const snap = await getDocs(collectionGroup(db, 'topics'));
    const targetDoc = snap.docs.find(d => d.id === id);
    
    if (!targetDoc) {
      // Fallback to checking lessons collection just in case
      const lessonDoc = await getDoc(doc(db, 'lessons', id));
      if (!lessonDoc.exists()) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }
      return NextResponse.json({ id: lessonDoc.id, ...lessonDoc.data() });
    }

    const pathSegments = targetDoc.ref.path.split('/');
    let sectionId = '';
    let chapterId = '';
    
    // Path should be like: sections/{sectionId}/chapters/{chapterId}/topics/{topicId}
    if (pathSegments.length >= 6) {
      sectionId = pathSegments[1];
      chapterId = pathSegments[3];
    }

    return NextResponse.json({ 
      id: targetDoc.id, 
      sectionId,
      chapterId,
      ...targetDoc.data() 
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
