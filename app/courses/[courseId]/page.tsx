"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { createClient } from '@/utils/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Clock, Star, Dumbbell, MessageCircle } from 'lucide-react';
// import CourseAssistant from '@/components/CourseAssistant';
import {SupabaseClient} from "@supabase/supabase-js";

// Types remain similar but with added fields
type Course = {
  id: number;
  course_code: string;
  subject_code: string;
  title: string;
  description?: string;
  historical_average_grade: number | null;
  universities: {
    name: string;
  }[];
  course_professors: {
    professors: {
      full_name: string;
      id: number;
    }[];
  }[];
};

const supabase = createClient();

// Helper functions for styling
const getQualityColor = (rating: number) => {
  if (rating >= 4) return 'bg-rating-green text-white';
  if (rating >= 3) return 'bg-rating-yellow text-white';
  return 'bg-rating-red text-white';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

type Review = {
  id: number;
  course_id: number;
  rating: number;
  difficulty_rating: number;
  workload_hours: number;
  grade_received: string;
  attendance_mandatory: boolean;
  textbook_required: boolean;
  class_format: string;
  would_recommend: boolean;
  comment: string;
  created_at: string;
  helpful_count: number;
  unhelpful_count: number;
  professor_id: number;
  semester: string;
};

const SEMESTERS = [
  "Fall 2024",
  "Summer 2024",
  "Spring 2024",
  "Fall 2023",
  "Summer 2023",
  "Spring 2023"
];

function CourseDetailPage() {

  const params = useParams();
  const courseId = typeof params.courseId === "string" ? parseInt(params.courseId) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("Fall 2024");
  const [activeTab, setActiveTab] = useState("reviews");
  const [statistics, setStatistics] = useState({
    averageRating: 0,
    averageDifficulty: 0,
    averageWorkload: 0,
    recommendationRate: 0,
    totalReviews: 0
  });


  // Fetch course and review data
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select(`
            id,
            course_code,
            subject_code,
            title,
            description,
            historical_average_grade,
            universities ( name ),
            course_professors ( 
              professors ( id, full_name )
            )
          `)
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData as Course);

        // Fetch reviews
        const { data: reviewData, error: reviewError } = await supabase
          .from("course_reviews")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });

        if (reviewError) throw reviewError;

        const validReviews = reviewData as Review[];
        setReviews(validReviews);

        // Calculate statistics from valid reviews
        if (validReviews && validReviews.length > 0) {
          const stats = validReviews.reduce((acc, review) => ({
            averageRating: acc.averageRating + (review.rating || 0),
            averageDifficulty: acc.averageDifficulty + (review.difficulty_rating || 0),
            averageWorkload: acc.averageWorkload + (review.workload_hours || 0),
            recommendationRate: acc.recommendationRate + (review.would_recommend ? 1 : 0),
            totalReviews: acc.totalReviews + 1
          }), {
            averageRating: 0,
            averageDifficulty: 0,
            averageWorkload: 0,
            recommendationRate: 0,
            totalReviews: 0
          });

          const totalReviews = stats.totalReviews || 1; // Prevent division by zero
          setStatistics({
            averageRating: Number((stats.averageRating / totalReviews).toFixed(1)) || 0,
            averageDifficulty: Number((stats.averageDifficulty / totalReviews).toFixed(1)) || 0,
            averageWorkload: Number((stats.averageWorkload / totalReviews).toFixed(1)) || 0,
            recommendationRate: Number(((stats.recommendationRate / totalReviews) * 100).toFixed(0)) || 0,
            totalReviews: stats.totalReviews
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {course.subject_code} {course.course_code}
                </h1>
                {course.historical_average_grade && (
                  <Badge variant="secondary" className="text-lg">
                    Avg Grade: {course.historical_average_grade.toFixed(1)}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl text-gray-600 mb-4">{course.title}</h2>

              <div className="flex flex-wrap gap-4 mb-6">
                <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {course.course_professors?.flatMap((cp) => {
                      // Check if cp.professors is an array. If not, wrap it in an array.
                      const profArray = Array.isArray(cp.professors) ? cp.professors : cp.professors ? [cp.professors] : [];
                      return profArray.map((prof) => (
                        <SelectItem key={prof.id} value={prof.full_name}>
                          {prof.full_name}
                        </SelectItem>
                      ));
                    })}
                  </SelectContent>
                </Select>

                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Course Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Star className="h-5 w-5 text-rating-yellow" />}
                value={statistics.averageRating}
                label="Overall Rating"
                sublabel={`from ${statistics.totalReviews} reviews`}
              />
              <StatCard
                icon={<Dumbbell className="h-5 w-5 text-rating-red" />}
                value={statistics.averageDifficulty}
                label="Difficulty"
                sublabel="out of 5"
              />
              <StatCard
                icon={<Clock className="h-5 w-5 text-rating-blue" />}
                value={statistics.averageWorkload}
                label="Weekly Hours"
                sublabel="average workload"
              />
              <StatCard
                icon={<ThumbsUp className="h-5 w-5 text-rating-green" />}
                value={statistics.recommendationRate}
                label="Would Take Again"
                sublabel="% of students"
                isPercentage
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="reviews" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="advice">
              <MessageCircle className="h-4 w-4 mr-2" />
              Course Advice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Course Reviews</h3>
              <Link href={`/courses/${courseId}/review`}>
                <Button size="lg">+ Add Review</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} professors={course.course_professors}
                supabase={supabase}/>
              ))}
              {reviews.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg">No reviews yet. Be the first to review!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advice">
            {/*<CourseAssistant courseId={courseId} />*/}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

// Helper Components
function StatCard({ icon, value, label, sublabel, isPercentage = false }) {
  const displayValue = isNaN(value) ? '0' : isPercentage ? `${value}%` : value;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-2xl font-bold">{displayValue}</span>
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-gray-500">{sublabel}</div>
      </div>
    </Card>
  );
}

function ReviewCard({review, professors, supabase}) {

 // Flatten the nested array of professor objects
  const allProfessors = professors.flatMap(cp => cp.professors);
  // Find the matching professor by ID
  const professorObj = allProfessors.find(prof => prof.id === review.professor_id);
  const professorName = professors[0].professors.full_name;

  const title = review.title || 'Title';

  const [voteCount, setVoteCount] = useState({
    likes: review.helpful_count || 0,
    dislikes: review.unhelpful_count || 0
  });
  const [userVote, setUserVote] = useState<number | null>(null);

  const loadUserVote = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    // console.log('Session check:', { session, sessionError });
    if (!session?.user) return;

    const { data, error } = await supabase
        .from('review_votes')
        .select('vote')
        .eq('review_id', review.id)
        .eq('user_id', session.user.id)
    if (error) {
      console.log('Error loading user vote:', error);
      return;
    }
    if (data && data.length === 1) {
      setUserVote(data[0].vote);
    }
    else{
      setUserVote(null);
    }

    const { data: counts, error: countsError } = await supabase
        .from('review_votes')
        .select('vote')
        .eq('review_id', review.id);

    if (countsError) {
      console.log('Error loading vote counts:', countsError);
      return;
    }

    if (counts) {
      const likes = counts.filter(v => v.vote === 1).length;
      const dislikes = counts.filter(v => v.vote === -1).length;
      setVoteCount({ likes, dislikes });
    }
  };

  useEffect(() => {
    loadUserVote();
  }, [review.id]);


  const handleVote = async (newVote: number) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    // console.log('Session check:', { session, sessionError });
    if (!session?.user) return;  // early return if no session or user

    if (!session?.user) {
      alert('Please sign in to vote');
      return;
    }

    try {
      if (userVote === newVote) {
        // remove vote if clicking same button
        const { error } = await supabase
            .from('review_votes')
            .delete()
            .match({
              review_id: review.id,
              user_id: session.user.id
            });

        if (error) throw error;
        setUserVote(null);

      } else {
        // insert or update vote
        const { error } = await supabase
            .from('review_votes')
            .upsert({
              review_id: review.id,
              user_id: session.user.id,
              vote: newVote
            }, {
              onConflict: 'review_id, user_id'
            });

        if (error) throw error;
        setUserVote(newVote);
      }

      // get updated counts
      const { data: counts } = await supabase
          .from('review_votes')
          .select('vote')
          .eq('review_id', review.id);

      const likes = counts?.filter(v => v.vote === 1).length || 0;
      const dislikes = counts?.filter(v => v.vote === -1).length || 0;

      setVoteCount({ likes, dislikes });

    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to save vote');
    }
  };



  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span >{title}</span>
              {review.semester?
              <Badge variant="outline">{review.semester}</Badge>
                  : null}
            </CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                  onClick={() => handleVote(1)}  // 1 for like
                  className={`flex items-center gap-1 ${userVote === 1 ? 'text-grey-700' : ''}`}
              >
                <ThumbsUp className="h-4 w-4"/>
                <span>{voteCount.likes}</span>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                  onClick={() => handleVote(-1)}  // -1 for dislike
                  className={`flex items-center gap-1 ${userVote === -1 ? 'text-grey-700' : ''}`}
              >
                <ThumbsDown className="h-4 w-4"/>
                <span>{voteCount.dislikes}</span>
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{review.comment}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Quality:</span>
            <Badge className={`ml-2 ${getQualityColor(review.rating)}`}>
              {review.rating?.toFixed(1) || "N/A"}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500">Difficulty:</span>
            <Badge className={`ml-2 ${getQualityColor(review.difficulty_rating)}`}>
              {review.difficulty_rating?.toFixed(1) || "N/A"}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500">Workload:</span>
            <span className="font-medium ml-2">
              {review.workload_hours || 0}hrs/week
            </span>
          </div>
          <div>
            <span className="text-gray-500">Professor:</span>
            <span className="font-medium ml-2">
              {professorName || 'Not Specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Grade:</span>
            <span className="font-medium ml-2">{review.grade_received || "N/A"}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Badge
              variant="secondary"
              className={review.textbook_required ? 'bg-rating-red-faint text-black' : ''}
          >
            {review.textbook_required ? "Textbook Required" : "No Textbook"}
          </Badge>

          <Badge
              variant="secondary"
              className={review.attendance_mandatory ? 'bg-rating-red-faint text-black' : ''}
          >
            {review.attendance_mandatory ? "Attendance Required" : "Attendance Optional"}
          </Badge>

          <Badge variant="outline">
            {review.class_format || "Format Not Specified"}
          </Badge>

          <Badge
              variant="secondary"
              className={!review.would_recommend ? 'bg-rating-red-faint text-black' : ''}
          >
            {review.would_recommend ? "Would Take Again" : "Would Not Take Again"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseDetailPage;
