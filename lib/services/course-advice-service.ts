import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export class CourseAdviceService {
    private openai: OpenAI;
    private supabase;

    constructor() {
        try {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                throw new Error('Missing Supabase environment variables');
            }

            this.supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            );
        } catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }

    async getAdvice(courseId: number, userQuestion: string) {
        try {
            console.log('Starting getAdvice for courseId:', courseId);

            // Fetch reviews
            const { data: courseReviews, error: reviewsError } = await this.supabase
                .from('course_reviews')
                .select('*')
                .eq('course_id', courseId);

            if (reviewsError) {
                console.error('Reviews fetch error:', reviewsError);
                throw reviewsError;
            }
            console.log('Fetched reviews:', courseReviews?.length);

            // Fetch prerequisites
            const { data: prerequisites, error: prereqError } = await this.supabase
                .from('prerequisites')
                .select('*')
                .eq('course_id', courseId)
                .single();

            if (prereqError && prereqError.code !== 'PGRST116') {
                console.error('Prerequisites fetch error:', prereqError);
                throw prereqError;
            }
            console.log('Fetched prerequisites:', prerequisites);

            // Get course info
            const { data: courseInfo, error: courseError } = await this.supabase
                .from('courses')
                .select('title, description')
                .eq('id', courseId)
                .single();

            if (courseError) {
                console.error('Course info fetch error:', courseError);
                throw courseError;
            }
            console.log('Fetched course info:', courseInfo?.name);

            // Format prerequisites
            let prerequisiteText = 'No prerequisites required.\n\n';
            if (prerequisites) {
                const prereqList = [];
                for (let i = 1; i <= 4; i++) {
                    const prereqKey = `prereq${i}`;
                    if (prerequisites[prereqKey]) {
                        const options = prerequisites[prereqKey].split('/').map(p => p.trim());
                        if (options.length > 1) {
                            prereqList.push(`(${options.join(' OR ')})`);
                        } else {
                            prereqList.push(options[0]);
                        }
                    }
                }
                if (prereqList.length > 0) {
                    prerequisiteText = `Prerequisites required: ${prereqList.join(' AND ')}\n\n`;
                }
            }

            // Calculate stats
            const avgRating = courseReviews?.length > 0
                ? courseReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / courseReviews.length
                : 0;

            const avgDifficulty = courseReviews?.length > 0
                ? courseReviews.reduce((sum, r) => sum + (r.difficulty_rating || 0), 0) / courseReviews.length
                : 0;

            // Create prompt
            const prompt = `Course: ${courseInfo.name}
${courseInfo.description ? `Description: ${courseInfo.description}\n` : ''}
${prerequisiteText}
Average Rating: ${avgRating.toFixed(1)}/5
Average Difficulty: ${avgDifficulty.toFixed(1)}/5

Student Reviews and Comments:
${courseReviews?.map(r => `- ${r.comment}`).join('\n') || 'No reviews yet.'}

User Question: ${userQuestion}

Please provide detailed advice based on the above information. Consider the prerequisites, student experiences, and course details when answering the question. Be specific and practical in your response.`;

            console.log('Created prompt, calling OpenAI...');

            // Call OpenAI
            if (!this.openai) {
                throw new Error('OpenAI client not initialized');
            }

        // In your CourseAdviceService, update the OpenAI call:

                    const completion = await this.openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: `You are a helpful academic advisor with extensive knowledge about university courses. 
              When providing advice, always follow this format:
        
              1. Then provide a "Key Takeaways" section with 3-4 bullet points
              2. Finally, give detailed advice in these sections:
                 - "Course Overview" (2-3 sentences max)
                 - "Before Taking This Course"
                 - "During the Course"
                 - "Tips for Success"
              
              Format your response using markdown for better readability.
              Use emojis sparingly but effectively at the start of main sections.
              Keep paragraphs short and use bullet points for lists.
              Bold important terms or key phrases.`
                            },
                            {
                                role: "user",
                                content: `Based on this course information, provide advice about ${courseInfo.name}:
        
        Course Info:
        ${courseInfo.description ? `Description: ${courseInfo.description}\n` : ''}
        ${prerequisiteText}
        
        Stats:
        - Average Rating: ${avgRating.toFixed(1)}/5
        - Average Difficulty: ${avgDifficulty.toFixed(1)}/5
        - Total Reviews: ${courseReviews?.length || 0}
        
        Student Reviews:
        ${courseReviews?.map(r => `- ${r.comment}`).join('\n') || 'No reviews yet.'}
        
        Question: ${userQuestion}
        
        Remember to follow the formatting guidelines in the system message.`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    });

            console.log('Received OpenAI response');

            return {
                advice: completion.choices[0].message.content,
                metadata: {
                    avgRating,
                    avgDifficulty,
                    prerequisites: prerequisiteText,
                    totalReviews: courseReviews?.length || 0,
                    courseName: courseInfo.name
                }
            };

        } catch (error) {
            console.error('Error generating advice:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to generate course advice: ${error.message}`);
        }
    }
}
