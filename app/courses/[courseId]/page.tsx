"use client";
import React from 'react'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Type definitions remain the same
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
    };
  }[];
};

type Review = {
  id: number;
  course_id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export default function CourseDetailPage() {
  // Initialize Supabase client with the new approach
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const params = useParams();
  const courseId = typeof params.courseId === "string" ? parseInt(params.courseId) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const [newRating, setNewRating] = useState<string>("0");
  const [newComment, setNewComment] = useState<string>("");

  // Set up auth listener with the new approach
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Get initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          course_code,
          subject_code,
          title,
          description,
          historical_average_grade,
          universities!inner (
            name
          ),
          course_professors!inner (
            professors!inner (
              full_name
            )
          )
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;
      setCourse(data as unknown as Course);
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data as Review[]);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchReviews();
    }
  }, [courseId]);

  const validateReview = () => {
    const rating = parseFloat(newRating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      setError("Rating must be a number between 0 and 5");
      return false;
    }
    if (!newComment.trim()) {
      setError("Please provide a comment");
      return false;
    }
    return true;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !validateReview()) return;

    if (!user) {
      setError("Please sign in to submit a review");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const ratingValue = parseFloat(newRating);
      const { error } = await supabase.from("course_reviews").insert({
        course_id: courseId,
        rating: ratingValue,
        comment: newComment.trim(),
        user_id: user.id,
      });

      if (error) throw error;

      setSuccess("Review submitted successfully!");
      await fetchReviews();

      setNewRating("0");
      setNewComment("");
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !course) {
    return <div className="container mx-auto py-6">Loading course details...</div>;
  }

  const instructor = course.course_professors?.[0]?.professors?.full_name || "Unknown Instructor";
  const universityName = course.universities?.[0]?.name || "Unknown University";

  return (
    <main className="mx-auto w-full">

      <div className="bg-md-purple w-full border-t-2 border-purple-600/20 py-8 rounded-b-2xl shadow-md">

        <div className="px-4 flex justify-between items-start">
          {/* Left side - University Info */}
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold text-rbc-purple">{course.subject_code} {course.course_code} </h1>
            <p className="text-lg text-white font-semibold py-2">{course.title}</p>
          </div>
          {/* Right side - Statistics */}
          <div className="flex-1">
            {/* Student Count & Acceptance Rate */}
            <div className="flex justify-left gap-4 mb-2">
              <div className="text-left">
                <div className="text-4xl text-white font-bold">Average Grade</div>
                <div className="text-3xl font-extrabold text-rbc-purple p-4 rounded-2xl w-16h-16 text-center bg-white/20">3.3</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="px-8 bg-slight-purple">

        <h1 className="text-4xl font-bold py-8 text-rbc-purple">Reviews</h1>
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Review</CardTitle>
            {!user && (
              <CardDescription className="text-red-500">
                Please sign in to submit a review
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block mb-1">Rating (0-5):</label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={newRating}
                  onChange={(e) => {
                    setError(null);
                    setNewRating(e.target.value);
                  }}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Comment:</label>
                <Textarea
                  value={newComment}
                  onChange={(e) => {
                    setError(null);
                    setNewComment(e.target.value);
                  }}
                  className="w-full"
                  rows={4}
                  placeholder="Write your review here..."
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {reviews.length > 0 ? (
          <div className="space-y-4 pb-24 mt-8">
            {reviews.map((review) => (
              <Card className="bg-white rounded-3xl px-4 mx-4 my-2 shadow-md border-none" key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                  {/*<CardTitle>Rating: {review.rating.toFixed(1)}</CardTitle> */}
                  <CardTitle className="text-2xl">Professor <span className="text-glow-purple">{instructor} </span> <span className="text-sm font-semibold mx-2 text-rpc-purple">FALL 2024</span></CardTitle>
                    <CardDescription>
                      {new Date(review.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}

      </div>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      </div>
    </main>
  );
}
