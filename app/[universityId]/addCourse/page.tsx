"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";

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
    const [open, setOpen] = useState(false);                                                          // If the popover is open                                 

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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
    }, []);

    // Fetch professors
    const fetchProfessors = async (query: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("professors")
            .select("id, full_name")
            .ilike("full_name", `%${query}%`)
            .limit(20);

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
                            className="min-h-16 bg-white"
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
                            className="min-h-16 bg-white"
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

                    <div className="space-y-2">
                        <Label>Professor</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                    {selected?.full_name || "Select Professor"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Search professor..."
                                        onValueChange={(value) => {
                                            if (value.trim().length > 0) debouncedFetch(value);
                                        }}
                                        disabled={loading}
                                    />
                                    <CommandEmpty>{loading ? "Searching..." : "No professor found."}</CommandEmpty>
                                    <CommandGroup>
                                        {professors.map((prof) => (
                                            <CommandItem
                                                key={prof.id}
                                                value={prof.full_name}
                                                onSelect={() => {
                                                    setFormData({ ...formData, professor: prof.id });
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        prof.id === formData.professor ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {prof.full_name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            className="min-h-16 bg-white"
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

    return (
        <>
            <div className="w-full border-t-2 py-8 px-4 rounded-b-2xl shadow-md flex justify-center items-center bg-gray-50">
                <div className="bg-md-purple w-full md:w-1/2 lg:w-1/4 rounded-2xl shadow-lg p-6 flex justify-center items-center">
                    <div className="w-full">
                        {renderAddCourseForm()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddCourseForm; 