"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
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
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  Star,
  Dumbbell,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import CourseAssistant from "@/components/CourseAssistant";
import { SupabaseClient } from "@supabase/supabase-js";

// ----- Types -----
// Updated review type to match desired fields
type Course = {
  id: number;
  course_code: string;
  subject_code: string;
  title: string;
  description?: string;
  historical_average_grade: number | null;
  universities: { name: string }[];
  course_professors: {
    professors: { full_name: string; id: number }[];
  }[];
};

type Review = {
  id: number;
  course_id: number;
  rating: number;
  study_material_usefulness: number;
  assignment_difficulty: number;
  hours_per_week: number;
  grading_fairness: string;
  class_format: string;
  advice: string;
  grade_received: string;
  comment: string;
  created_at: string;
  helpful_count: number;
  unhelpful_count: number;
  professor_id: number;
  semester: string;
  textbook_required: boolean;
  mandatory_attendance: boolean;
};

const SEMESTERS = [
  "Fall 2024",
  "Summer 2024",
  "Spring 2024",
  "Fall 2023",
  "Summer 2023",
  "Spring 2023",
];

// ----- Supabase Client -----
const supabase = createClient();

// ----- Helper Functions -----
const getQualityColor = (rating: number) => {
  if (rating >= 4) return "bg-rating-red text-white";
  if (rating >= 3) return "bg-rating-yellow text-white";
  return "bg-rating-green text-white";
};

// ----- Main Component -----
function CourseDetailPage() {
  const params = useParams();
  const courseId =
    typeof params.courseId === "string" ? parseInt(params.courseId) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("Fall 2024");
  const [activeTab, setActiveTab] = useState("reviews");
  const [statistics, setStatistics] = useState({
    averageRating: 0,
    averageAssignmentDifficulty: 0,
    averageStudyMaterialUsefulness: 0,
    averageWorkload: 0,
    totalReviews: 0,
  });

  // Fetch course details and reviews
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select(
            `
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
          `
          )
          .eq("id", courseId)
          .single();
        if (courseError) throw courseError;
        setCourse(courseData as Course);

        // Fetch reviews for the course
        const { data: reviewData, error: reviewError } = await supabase
          .from("course_reviews")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });
        if (reviewError) throw reviewError;
        const validReviews = reviewData as Review[];
        setReviews(validReviews);

        // Calculate statistics based on reviews
        if (validReviews && validReviews.length > 0) {
          const stats = validReviews.reduce(
            (acc, review) => ({
              averageRating: acc.averageRating + (review.rating || 0),
              averageAssignmentDifficulty:
                acc.averageAssignmentDifficulty +
                (review.assignment_difficulty || 0),
              averageStudyMaterialUsefulness:
                acc.averageStudyMaterialUsefulness +
                (review.study_material_usefulness || 0),
              averageWorkload: acc.averageWorkload + (review.hours_per_week || 0),
              totalReviews: acc.totalReviews + 1,
            }),
            {
              averageRating: 0,
              averageAssignmentDifficulty: 0,
              averageStudyMaterialUsefulness: 0,
              averageWorkload: 0,
              totalReviews: 0,
            }
          );
          const total = stats.totalReviews || 1;
          setStatistics({
            averageRating: Number((stats.averageRating / total).toFixed(1)) || 0,
            averageAssignmentDifficulty:
              Number((stats.averageAssignmentDifficulty / total).toFixed(1)) || 0,
            averageStudyMaterialUsefulness:
              Number((stats.averageStudyMaterialUsefulness / total).toFixed(1)) || 0,
            averageWorkload: Number((stats.averageWorkload / total).toFixed(1)) || 0,
            totalReviews: stats.totalReviews,
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

              {/*<div className="flex flex-wrap gap-4 mb-6">*/}
              {/*  <Select*/}
              {/*    value={selectedProfessor}*/}
              {/*    onValueChange={setSelectedProfessor}*/}
              {/*  >*/}
              {/*    <SelectTrigger className="w-[200px]">*/}
              {/*      <SelectValue placeholder="Select Professor" />*/}
              {/*    </SelectTrigger>*/}
              {/*    <SelectContent>*/}
              {/*      {course.course_professors?.flatMap((cp) => {*/}
              {/*        const profArray = Array.isArray(cp.professors)*/}
              {/*          ? cp.professors*/}
              {/*          : cp.professors*/}
              {/*          ? [cp.professors]*/}
              {/*          : [];*/}
              {/*        return profArray.map((prof) => (*/}
              {/*          <SelectItem key={prof.id} value={prof.full_name}>*/}
              {/*            {prof.full_name}*/}
              {/*          </SelectItem>*/}
              {/*        ));*/}
              {/*      })}*/}
              {/*    </SelectContent>*/}
              {/*  </Select>*/}

              {/*  <Select*/}
              {/*    value={selectedSemester}*/}
              {/*    onValueChange={setSelectedSemester}*/}
              {/*  >*/}
              {/*    <SelectTrigger className="w-[200px]">*/}
              {/*      <SelectValue placeholder="Select Semester" />*/}
              {/*    </SelectTrigger>*/}
              {/*    <SelectContent>*/}
              {/*      {SEMESTERS.map((semester) => (*/}
              {/*        <SelectItem key={semester} value={semester}>*/}
              {/*          {semester}*/}
              {/*        </SelectItem>*/}
              {/*      ))}*/}
              {/*    </SelectContent>*/}
              {/*  </Select>*/}
              {/*</div>*/}
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
                value={statistics.averageAssignmentDifficulty}
                label="Assignment Diff."
                sublabel="out of 5"
              />
              <StatCard
                icon={<BookOpen className="h-5 w-5 text-rating-green" />}
                value={statistics.averageStudyMaterialUsefulness}
                label="Study Material"
                sublabel="out of 5"
              />
              <StatCard
                icon={<Clock className="h-5 w-5 text-rating-blue" />}
                value={statistics.averageWorkload}
                label="Weekly Hours"
                sublabel="average workload"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue="reviews"
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/*<TabsList className="grid w-full md:w-[400px] grid-cols-2">*/}
          {/*  <TabsTrigger value="reviews">Reviews</TabsTrigger>*/}
          {/*  <TabsTrigger value="advice">*/}
          {/*    <MessageCircle className="h-4 w-4 mr-2" />*/}
          {/*    Course Advice*/}
          {/*  </TabsTrigger>*/}
          {/*</TabsList>*/}

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Course Reviews</h3>
              <Link href={`/courses/${courseId}/review`}>
                <Button size="lg">+ Add Review</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  professors={course.course_professors}
                  supabase={supabase}
                />
              ))}
              {reviews.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg">
                      No reviews yet. Be the first to review!
                    </p>
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

// ----- Helper Components -----
function StatCard({
  icon,
  value,
  label,
  sublabel,
  isPercentage = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  sublabel: string;
  isPercentage?: boolean;
}) {
  const displayValue = isNaN(value)
    ? "0"
    : isPercentage
    ? `${value}%`
    : value;
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

function ReviewCard({
  review,
  professors,
  supabase,
}: {
  review: Review;
  professors: { professors: { full_name: string; id: number }[] }[];
  supabase: SupabaseClient;
}) {
  // Flatten professor arrays and look up the professor using review.professor_id
  const allProfessors = professors.flatMap((cp) => cp.professors);
  const professorObj = allProfessors.find(
    (prof) => prof.id === review.professor_id
  );
  // const professorName = professorObj ? professorObj.full_name : "Not Specified";

  const [voteCount, setVoteCount] = useState({
    likes: review.helpful_count || 0,
    dislikes: review.unhelpful_count || 0,
  });
  const [userVote, setUserVote] = useState<number | null>(null);

  const loadUserVote = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("review_votes")
      .select("vote")
      .eq("review_id", review.id)
      .eq("user_id", session.user.id);
    if (error) {
      console.log("Error loading user vote:", error);
      return;
    }
    if (data && data.length === 1) {
      setUserVote(data[0].vote);
    } else {
      setUserVote(null);
    }

    const { data: counts, error: countsError } = await supabase
      .from("review_votes")
      .select("vote")
      .eq("review_id", review.id);
    if (countsError) {
      console.log("Error loading vote counts:", countsError);
      return;
    }
    if (counts) {
      const likes = counts.filter((v) => v.vote === 1).length;
      const dislikes = counts.filter((v) => v.vote === -1).length;
      setVoteCount({ likes, dislikes });
    }
  };

  useEffect(() => {
    loadUserVote();
  }, [review.id]);

  const handleVote = async (newVote: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      if (userVote === newVote) {
        // Remove vote if clicking the same button
        const { error } = await supabase
          .from("review_votes")
          .delete()
          .match({
            review_id: review.id,
            user_id: session.user.id,
          });
        if (error) throw error;
        setUserVote(null);
      } else {
        // Upsert vote
        const { error } = await supabase
          .from("review_votes")
          .upsert(
            {
              review_id: review.id,
              user_id: session.user.id,
              vote: newVote,
            },
            {
              onConflict: "review_id, user_id",
            }
          );
        if (error) throw error;
        setUserVote(newVote);
      }

      // Refresh vote counts
      const { data: counts } = await supabase
        .from("review_votes")
        .select("vote")
        .eq("review_id", review.id);
      const likes = counts?.filter((v) => v.vote === 1).length || 0;
      const dislikes = counts?.filter((v) => v.vote === -1).length || 0;
      setVoteCount({ likes, dislikes });
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to save vote");
    }
  };
  console.log(review);
  console.log(review.textbook_required);
  console.log(review.mandatory_attendance);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/*<h3 className="font-semibold">{professorName}</h3>*/}
              {review.semester && (
                <Badge variant="outline" className="text-xs">{review.semester}</Badge>
              )}
            </div>
            {/* Overall Rating Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`text-lg py-0.5 px-3 ${getQualityColor(review.rating)}`}>
                {review.rating.toFixed(1)}
              </Badge>
              <span className="text-gray-500 text-xs">Overall Rating</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                userVote === 1 ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">{voteCount.likes}</span>
            </button>
            <button
              onClick={() => handleVote(-1)}
              className={`flex items-center gap-1 hover:text-red-600 transition-colors ${
                userVote === -1 ? "text-red-600" : "text-gray-500"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-sm">{voteCount.dislikes}</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Main Comment */}
        <div className="pt-1">
          <span className="text-gray-500 text-sm">Review:</span>
          <p className="text-sm text-gray-700 mt-0.5">{review.comment}</p>
        </div>
        {/* Advice - Only shown if present */}
        {review.advice && (
            <div className="pt-1">
              <span className="text-gray-500 text-sm">Advice:</span>
              <p className="text-sm text-gray-700 mt-0.5">{review.advice}</p>
            </div>
        )}
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Difficulty:</span>
            <Badge className={`text-sm ${getQualityColor(review.assignment_difficulty)}`}>
              {review.assignment_difficulty.toFixed(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Relevance:</span>
            <Badge className="text-sm">
              {review.study_material_usefulness.toFixed(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Workload:</span>
            <span className="text-sm">{review.hours_per_week} hrs/week</span>
          </div>
          {/*           <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Grade:</span>
            <span className="text-sm">{review.grade_received || "N/A"}</span>
          </div>
*/}

          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Grading Fairness:</span>
            <span className="text-sm">{review.grading_fairness || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Mandatory Attendance:</span>
            <span className="text-sm">{review.mandatory_attendance !== undefined
                ? review.mandatory_attendance === true
                    ? 'Yes'
                    : 'No' : "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Required Textbook:</span>
            <span className="text-sm">{review.textbook_required !== undefined
                ? review.textbook_required === true
                    ? 'Yes'
                    : 'No' : "N/A"}</span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

export default CourseDetailPage;
