import { NextRequest, NextResponse } from 'next/server';
import { CourseAdviceService } from '@/lib/services/course-advice-service';

export async function POST(req: NextRequest) {
    try {
        const { courseId, question } = await req.json();

        if (!courseId || !question) {
            return NextResponse.json(
                { error: 'Course ID and question are required' },
                { status: 400 }
            );
        }

        const adviceService = new CourseAdviceService();
        const response = await adviceService.getAdvice(courseId, question);

        return NextResponse.json(response);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate advice' },
            { status: 500 }
        );
    }
}