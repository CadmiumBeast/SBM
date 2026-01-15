import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, X, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface ContentCalendarProps {
    companies?: Array<{ id: number; name: string }>;
    existingContent?: Array<{
        id: number;
        date: string;
        title: string;
        description: string;
        content_link: string;
        company_id: number;
        type?: string;
        company?: { id: number; name: string };
        feedbacks?: Array<{
            id: number;
            feedback: string;
            user_id: number;
            created_at: string;
            user?: { id: number; name: string; email: string };
        }>;
    }>;
}

const ContentCalendar = ({ companies = [], existingContent = [] }: ContentCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'form'>('calendar');
    const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
    const [selectedContent, setSelectedContent] = useState<{
        id: number;
        date: string;
        title: string;
        description: string;
        content_link: string;
        company_id: number;
        type?: string;
        company?: { id: number; name: string };
        feedbacks?: Array<{
            id: number;
            feedback: string;
            user_id: number;
            created_at: string;
            user?: { id: number; name: string; email: string };
        }>;
    } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        company_id: '',
        date: '',
        title: '',
        description: '',
        content_link: '',
        type: 'Poster',
    });

    const { 
        data: feedbackData, 
        setData: setFeedbackData, 
        post: postFeedback, 
        processing: feedbackProcessing, 
        errors: feedbackErrors, 
        reset: resetFeedback 
    } = useForm({
        feedback: '',
    });

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Get content for a specific date
    const getContentForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return existingContent.filter(
        (content) => content.date === dateStr
    );
};

    // Navigate months
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    // Handle date selection
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setData('date', date.toISOString().split('T')[0]);
        setShowForm(true);
        setViewMode('form');
    };

    // Handle form submission
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/content-calendar', {
            onSuccess: () => {
                reset();
                setShowForm(false);
                setSelectedDate(null);
                setViewMode('calendar');
            },
            preserveScroll: true,
        });
    };

    // Generate calendar days
    const calendarDays = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        calendarDays.push(date);
    }

    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isToday = (date: Date) => {
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <div className="max-w-full p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Content Calendar
                </h2>
                <button
                    onClick={() => {
                        setViewMode('form');
                        setShowForm(true);
                        setSelectedDate(null);
                        setData('date', '');
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all
                        bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200
                        dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                </button>
            </div>

            {viewMode === 'calendar' ? (
                /* Calendar View */
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                                text-gray-700 dark:text-gray-300"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {monthName}
                            </h3>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1 text-sm rounded-lg font-medium transition-all
                                    bg-gray-100 text-gray-700 hover:bg-gray-200
                                    dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Today
                            </button>
                        </div>

                        <button
                            onClick={goToNextMonth}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                                text-gray-700 dark:text-gray-300"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {daysOfWeek.map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-semibold py-2 text-gray-600 dark:text-gray-400"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {calendarDays.map((date, index) => {
                            if (!date) {
                                return <div key={`empty-${index}`} className="min-h-[120px]" />;
                            }

                            const contentForDate = getContentForDate(date);
                            const hasContent = contentForDate.length > 0;
                            const isCurrentDay = isToday(date);

                            return (
                                <div
                                    key={date.toISOString()}
                                    className={`min-h-[120px] p-2 rounded-lg border transition-all relative flex flex-col
                                        ${isCurrentDay
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                        }
                                        ${hasContent
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                            : 'bg-white dark:bg-gray-800'
                                        }
                                        hover:shadow-md`}
                                >
                                    <button
                                        onClick={() => handleDateClick(date)}
                                        className={`text-sm font-medium mb-1 text-left flex-shrink-0
                                            ${isCurrentDay
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : 'text-gray-900 dark:text-gray-100'
                                            }`}
                                    >
                                        {date.getDate()}
                                    </button>
                                    {hasContent && (
                                        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                                            {contentForDate.map((content) => (
                                                <div
                                                    key={content.id}
                                                    className="text-[10px] leading-tight p-1 rounded bg-white dark:bg-gray-800 
                                                        border border-green-200 dark:border-green-700
                                                        text-gray-800 dark:text-gray-200
                                                        hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors cursor-pointer"
                                                    title={`${content.title} - ${content.type || 'Poster'} - ${content.description}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedContent(content);
                                                    }}
                                                >
                                                    <div className="font-semibold text-green-700 dark:text-green-300 truncate">
                                                        {content.title}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-[9px] truncate">
                                                        {content.type || 'Poster'}
                                                    </div>
                                                    <div className="text-gray-600 dark:text-gray-400 truncate">
                                                        - {content.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Form View */
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {selectedDate
                                    ? `Add Content for ${selectedDate.toLocaleDateString()}`
                                    : 'Add New Content'}
                            </h3>
                            <button
                                onClick={() => {
                                    setViewMode('calendar');
                                    setShowForm(false);
                                    setSelectedDate(null);
                                    reset();
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                                    text-gray-700 dark:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Company Selection */}
                            <div>
                                <label
                                    htmlFor="company_id"
                                    className="block text-sm font-semibold mb-2 transition-colors
                                        text-gray-900 dark:text-gray-100"
                                >
                                    Company <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="company_id"
                                    value={data.company_id}
                                    onChange={(e) => setData('company_id', e.target.value)}
                                    className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                        bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                                        dark:focus:ring-blue-400 dark:focus:border-blue-400
                                        ${errors.company_id ? 'border-red-500 dark:border-red-400' : ''}`}
                                >
                                    <option value="">Select a company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.company_id && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.company_id}
                                    </p>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-semibold mb-2 transition-colors
                                        text-gray-900 dark:text-gray-100"
                                >
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                        bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                                        dark:focus:ring-blue-400 dark:focus:border-blue-400
                                        ${errors.date ? 'border-red-500 dark:border-red-400' : ''}`}
                                />
                                {errors.date && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label
                                    htmlFor="type"
                                    className="block text-sm font-semibold mb-2 transition-colors
                                        text-gray-900 dark:text-gray-100"
                                >
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                        bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                                        dark:focus:ring-blue-400 dark:focus:border-blue-400
                                        ${errors.type ? 'border-red-500 dark:border-red-400' : ''}`}
                                >
                                    <option value="Poster">Poster</option>
                                    <option value="Blog">Blog</option>
                                    <option value="Video">Video</option>
                                    <option value="Infographic">Infographic</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Email">Email</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-semibold mb-2 transition-colors
                                        text-gray-900 dark:text-gray-100"
                                >
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter content title..."
                                    className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                        bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500
                                        dark:focus:ring-blue-400 dark:focus:border-blue-400
                                        ${errors.title ? 'border-red-500 dark:border-red-400' : ''}`}
                                />
                                {errors.title && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-semibold mb-2 transition-colors
                                        text-gray-900 dark:text-gray-100"
                                >
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Enter content description..."
                                    className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                        bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500
                                        dark:focus:ring-blue-400 dark:focus:border-blue-400
                                        ${errors.description ? 'border-red-500 dark:border-red-400' : ''}`}
                                />
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Content Link */}
                            <div>
                                <label
                                    htmlFor="content_link"
                                    className="block text-sm font-semibold mb-2 transition-colors
                                        text-gray-900 dark:text-gray-100"
                                >
                                    Content Link <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="content_link"
                                    value={data.content_link}
                                    onChange={(e) => setData('content_link', e.target.value)}
                                    placeholder="https://example.com/content"
                                    className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                        bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500
                                        dark:focus:ring-blue-400 dark:focus:border-blue-400
                                        ${errors.content_link ? 'border-red-500 dark:border-red-400' : ''}`}
                                />
                                {errors.content_link && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.content_link}
                                    </p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewMode('calendar');
                                        setShowForm(false);
                                        setSelectedDate(null);
                                        reset();
                                    }}
                                    className="inline-flex items-center px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                                        bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200
                                        dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                                        bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200
                                        dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Saving...' : 'Save Content'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Details Dialog */}
            <Dialog open={!!selectedContent} onOpenChange={(open) => {
                if (!open) {
                    setSelectedContent(null);
                    setShowAllFeedbacks(false);
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {selectedContent?.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Content Details
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto pr-2 mt-4
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-track]:dark:bg-gray-800
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        [&::-webkit-scrollbar-thumb]:dark:bg-gray-600
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
                        [&::-webkit-scrollbar-thumb]:dark:hover:bg-gray-500">
                    {selectedContent && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Type
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {selectedContent.type || 'Poster'}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Date
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(selectedContent.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Company
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {selectedContent.company?.name || 
                                     companies.find(c => c.id === selectedContent.company_id)?.name || 
                                     'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {selectedContent.description}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Content Link
                                </label>
                                <a
                                    href={selectedContent.content_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 
                                        hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                                >
                                    {selectedContent.content_link}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Existing Feedbacks */}
                    {selectedContent && selectedContent.feedbacks && selectedContent.feedbacks.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Feedbacks ({selectedContent.feedbacks.length})
                            </h3>
                            <div className={`space-y-4 ${showAllFeedbacks ? 'max-h-80 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:dark:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 [&::-webkit-scrollbar-thumb]:dark:hover:bg-gray-500' : ''}`}>
                                {(showAllFeedbacks ? selectedContent.feedbacks : selectedContent.feedbacks.slice(0, 2)).map((feedback) => (
                                    <div
                                        key={feedback.id}
                                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {feedback.user?.name || 'Anonymous User'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                            {feedback.feedback}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {selectedContent.feedbacks.length > 2 && (
                                <button
                                    onClick={() => setShowAllFeedbacks(!showAllFeedbacks)}
                                    className="mt-4 w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 
                                        hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                        rounded-lg transition-colors"
                                >
                                    {showAllFeedbacks 
                                        ? `Show Less (${selectedContent.feedbacks.length - 2} hidden)`
                                        : `Show All Feedbacks (${selectedContent.feedbacks.length - 2} more)`
                                    }
                                </button>
                            )}
                        </div>
                    )}

                    {/* Feedback Form */}
                    {selectedContent && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Add Feedback
                            </h3>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    postFeedback(`/content-feedback/${selectedContent.id}`, {
                                        onSuccess: () => {
                                            resetFeedback('feedback');
                                            // Reload the page to get updated feedbacks
                                            router.reload({ only: ['contentCalendar'] });
                                        },
                                        preserveScroll: true,
                                    });
                                }} 
                                className="space-y-4"
                            >
                                <div>
                                    <label 
                                        htmlFor="feedback" 
                                        className="block text-sm font-semibold mb-2 transition-colors
                                            text-gray-900 dark:text-gray-100"
                                    >
                                        Content Feedback
                                    </label>
                                    
                                    <textarea
                                        id="feedback"
                                        value={feedbackData.feedback}
                                        onChange={(e) => setFeedbackData('feedback', e.target.value)}
                                        rows={4}
                                        placeholder="Provide feedback on this content..."
                                        className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm transition-all
                                            bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500
                                            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500
                                            dark:focus:ring-blue-400 dark:focus:border-blue-400
                                            ${feedbackErrors.feedback ? 'border-red-500 dark:border-red-400' : ''}`}
                                    />

                                    {feedbackErrors.feedback && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {feedbackErrors.feedback}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={feedbackProcessing}
                                        className="inline-flex items-center px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                                            bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200
                                            dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {feedbackProcessing ? 'Sending...' : 'Submit Feedback'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContentCalendar;
