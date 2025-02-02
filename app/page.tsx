"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type University = {
  id: number;
  name: string;
  location?: string;
  course_count?: number;
};

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUniversities = async (search?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("universities")
        .select(`
          id,
          name,
          location,
          courses(count)
        `)
        .limit(100);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching universities:", error);
        return;
      }

      const universitiesWithCounts = data?.map(uni => ({
        ...uni,
        course_count: uni.courses?.[0]?.count || 0
      })) || [];

      setUniversities(universitiesWithCounts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!open) setOpen(true);
    fetchUniversities(value);
  };

  // Handle click on the input container to maintain focus
  const handleContainerClick = () => {
    inputRef.current?.focus();
    setOpen(true);
  };

  return (
      <div className="min-h-screen relative">
        <div className="absolute top-0 left-0 right-0 z-0 ">
          <Image
              src="/bg-landing.svg"
              alt="Background Image"
              height={80}
              width={1920}
              priority
              className="w-full"
          />
        </div>
        <main className="relative z-10 container mx-auto py-6 space-y-8">

          <div className="flex justify-center">
            <Image
                src="/mainlogo.svg"
                height={70}
                width={450}
                alt="CourseChecker main logo"
                priority
            />
          </div>

          <div className="flex justify-center w-full">
            <Popover open={open} onOpenChange={setOpen}>
              <div className="relative w-96" onClick={handleContainerClick}>
                <PopoverTrigger asChild>
                  <div className="relative w-full" onClick={(e) => {
                    e.preventDefault();
                    inputRef.current?.focus();
                    setOpen(true);
                  }}>
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none z-10"/>
                    <Input
                        ref={inputRef}
                        placeholder="Search for your university..."
                        className="w-full pl-9 pr-4 h-10 bg-white/80 backdrop-blur-sm"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => setOpen(true)}
                    />
                  </div>
                </PopoverTrigger>
              </div>
              <PopoverContent
                  className="w-96 p-0"
                  align="start"
                  onInteractOutside={(e) => {
                    // Only close if clicking outside the popover and input
                    if (!(e.target as HTMLElement).closest('.search-container')) {
                      setOpen(false);
                    }
                  }}
              >
                <Command>
                  <CommandEmpty>No university found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {universities.map((university) => (
                        <CommandItem
                            key={university.id}
                            value={university.name}
                            onSelect={() => {
                              setSelectedUniversity(university);
                              setSearchQuery(university.name);
                              setOpen(false);
                              router.push(`/${university.id}`);
                            }}
                            className="cursor-pointer"
                        >
                          <Check
                              className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUniversity?.id === university.id ? "opacity-100" : "opacity-0"
                              )}
                          />
                          <div>
                            <div>{university.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {university.location} • {university.course_count} courses
                            </div>
                          </div>
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </main>
      </div>
  );
}
