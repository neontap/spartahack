"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";
import { sendCustomVerificationAction } from "@/app/actions";
import Link from "next/link"

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AddCourseForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);                                                     // If the page is loading
    const [user, setUser] = useState<any>(null);                                                      // Current user
    const [submissionError, setSubmissionError] = useState<string | null>(null);                      // Error message for submission
    const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);                  // Success message for submission
    const [professors, setProfessors] = useState([]);                                                 // List of professors
    const [searchQuery, setSearchQuery] = useState("");                                               // Search query for professors
    const [verified, setVerified] = useState<boolean | null>(null);

    // Get university ID from URL
    const params = useParams();
    const universityId =
        typeof params.universityId === "string" ? parseInt(params.universityId) : null;

    // Form data
    const [formData, setFormData] = useState({
        universityId: universityId,
        subjectCode: "",
        courseCode: "",
        title: "",
        professor: ""
    });

    const selected = professors.find((p) => p.id === formData.professor);

    // Check auth session
    useEffect(() => {
        const fetchUserAndVerification = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("verified_at")
                    .eq("id", currentUser.id)
                    .maybeSingle();

                if (error) {
                    console.error("Unexpected error fetching profile:", error);
                    setVerified(false);
                } else if (!profile) {
                    console.warn("No profile found for user.");
                    setVerified(false);
                } else {
                    setVerified(!!profile.verified_at); 
                }
            } else {
                setVerified(false); 
            }

            setLoading(false);
        };

        fetchUserAndVerification();
    }, []);

    useEffect(() => {
        return () => {
            debouncedFetch.cancel();
        };
    }, []);

    // Fetch professors
    const fetchProfessors = async (query: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("professors")
            .select("id, full_name")
            .eq("university_id", universityId)
            .ilike("full_name", `%${query}%`)
            .limit(10);

        if (!error && data) setProfessors(data);
        setLoading(false);
    };

    const debouncedFetch = debounce(fetchProfessors, 300);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            console.error("User not signed in");
            setSubmissionError("Please sign in to submit a review.");
            return;
        }

        const { error } = await supabase.from("courses").insert({
            university_id: universityId,
            subject_code: formData.subjectCode,
            course_code: formData.courseCode,
            title: formData.title
        });

        if (error) {
            console.error("Error adding course:", error);
            setSubmissionError("Failed to add course. Please try again.");
        } else {
            setSubmissionSuccess("Course Added successfully!");
            router.push(`/${universityId}`);
            // Push to course page vs back to university page (?)
            // router.push(`/courses/${courseId}`);
        }
    };

    const canProceed = () => {
        return formData.subjectCode && formData.courseCode && formData.title && formData.professor;
    };

    const renderAddCourseForm = () => {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-purple-800">Fill Course Details</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Subject Code</Label>
                        <Input
                            className="min-h-8 bg-white"
                            value={`${formData.subjectCode}`}
                            onChange={(e) => {
                                const value = e.target.value;
                                if ((value.length <= 5 && (value === "" || /^[a-zA-Z]*$/.test(value)))) {
                                    setFormData({ ...formData, subjectCode: value });
                                }
                            }}
                            placeholder="Enter Subject Code (e.g. ISS)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Course Code</Label>
                        <Input
                            className="min-h-8 bg-white"
                            value={`${formData.courseCode}`}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 5 && !isNaN(Number(value))) {
                                    setFormData({ ...formData, courseCode: value });
                                }
                            }}
                            placeholder="Enter Course Code (e.g. 210)"
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <Label>Professor</Label>
                        <Input
                            className="min-h-8 bg-white"
                            placeholder="Search professor..."
                            value={searchQuery}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchQuery(value);

                                if (value.trim().length >= 2) {
                                    debouncedFetch(value);
                                } else {
                                    setProfessors([]);
                                }

                                setFormData({ ...formData, professor: "" });
                            }}
                        />

                        {professors.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
                                {professors.map((prof) => (
                                    <div
                                        key={prof.id}
                                        onClick={() => {
                                            setFormData({ ...formData, professor: prof.id });
                                            setSearchQuery(prof.full_name);
                                            setProfessors([]);
                                        }}
                                        className={cn(
                                            "cursor-pointer px-4 py-2 hover:bg-gray-100",
                                            formData.professor === prof.id && "bg-gray-100 font-medium"
                                        )}
                                    >
                                        {prof.full_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            className="min-h-8 bg-white"
                            value={formData.title}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 50) {
                                    setFormData({ ...formData, title: value });
                                }
                            }}
                        />
                        <p className="text-sm text-gray-500">
                            {formData.title.length}/50 characters
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={(e) => handleSubmit(e)}
                        disabled={!canProceed()}
                        className="bg-purple-700 hover:bg-purple-800 text-white ml-auto"
                    >
                        Submit
                    </Button>

                </div>
            </div>
        );
    }

    // Only render the form if not loading and the user is logged in
    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>You must be logged in to submit a review. Please <Link className="font-bold underline" href="/sign-in"> sign in</Link>.</p>
            </div>
        );
    }

    if (!verified) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <p className="mb-4 text-gray-700">
                    You must verify your email to submit a review.
                </p>
                <form action={sendCustomVerificationAction}>
                    <Button
                        type="submit"
                        className="text-white ml-auto">
                        Send verification email
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <>
            <div className="w-full border-t-2 py-8 px-4 rounded-b-2xl shadow-md flex justify-center items-center bg-gray-50">
                <div className="w-full md:w-1/2 lg:w-1/4 rounded-2xl shadow-lg p-6 flex justify-center items-center border">
                    <div className="w-full">
                        {renderAddCourseForm()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddCourseForm; 