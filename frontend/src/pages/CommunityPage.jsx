import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Input, Select, Textarea } from '../components/ui/FormComponents';
import { MessageSquare, GraduationCap, Plus, Eye, Play, User, Users } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function CommunityPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState('forum');

  const [forumPosts, setForumPosts] = useState([]);
  const [trainingCourses, setTrainingCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('কৃষি পরামর্শ');
  const [postContent, setPostContent] = useState('');
  const [postError, setPostError] = useState('');

  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchForumPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/forum/posts');
      if (res.ok) setForumPosts(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/training/courses');
      if (res.ok) setTrainingCourses(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'forum') fetchForumPosts();
    if (activeTab === 'training') fetchTrainingCourses();
  }, [activeTab]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    setPostError('');

    try {
      const res = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: postTitle,
          category: postCategory,
          content: postContent
        })
      });
      if (res.ok) {
        setIsNewPostModalOpen(false);
        setPostTitle('');
        setPostContent('');
        fetchForumPosts();
      } else {
        const data = await res.json();
        setPostError(data.detail || 'ফোরাম পোস্ট তৈরি করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setPostError('নেটওয়ার্ক ত্রুটি!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden shadow-card border border-emerald-900/20 bg-emerald-900 text-white min-h-[160px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80"
          alt="Bangladesh Rural Farmers Community"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="relative z-10 p-6 max-w-xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-100 border border-emerald-600/50 backdrop-blur-xs">
            <Users className="w-3.5 h-3.5" />
            <span>গ্রামীণ কৃষক কমিউনিটি ও দক্ষতা উন্নয়ন</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">ফোরাম ও ডিজিটাল প্রশিক্ষণ কেন্দ্র</h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
            অভিজ্ঞ কৃষকদের অভিজ্ঞতা বিনিময়, নতুন প্রযুক্তি প্রশিক্ষণ ও বিনামূল্যে কৃষি ভিডিও কোর্স।
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'forum'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>কৃষক ফোরাম</span>
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'training'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>ডিজিটাল প্রশিক্ষণ</span>
          </button>
        </div>

        {activeTab === 'forum' && (
          <button
            onClick={() => {
              if (!authToken) openAuthModal('login');
              else setIsNewPostModalOpen(true);
            }}
            type="button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পোস্ট লিখুন</span>
          </button>
        )}
      </div>

      {activeTab === 'forum' && (
        <div className="space-y-4">
          {loading ? (
            <LoadingState message="ফোরাম আলোচনা লোড হচ্ছে..." />
          ) : forumPosts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="কোন ফোরাম আলোচনা পাওয়া যায়নি"
              description="বর্তমানে ফোরামে নতুন কোন প্রশ্ন নেই।"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{post.views_count} দেখা হয়েছে</span>
                      </span>
                    </div>
                    <CardTitle className="pt-1">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{post.content}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3 h-3 text-emerald-600" />
                        <span>{post.author_name}</span>
                      </span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingCourses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between">
              <CardHeader>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit mb-1">
                  {course.category}
                </span>
                <CardTitle>{course.title_bn}</CardTitle>
                <CardDescription>প্রশিক্ষক: {course.instructor_bn} | সময়: {course.duration_hours} ঘণ্টা</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">{course.description_bn}</p>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>কোর্স বিবরণ ও ভিডিও</span>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        title="ফোরামে নতুন প্রশ্ন/পরামর্শ প্রকাশ করুন"
      >
        <form onSubmit={handlePostSubmit} className="space-y-4">
          {postError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {postError}
            </div>
          )}

          <FormField label="শিরোনাম" required>
            <Input
              placeholder="আপনার প্রশ্ন সংক্ষেপে লিখুন"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="ক্যাটাগরি">
            <Select value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
              <option value="কৃষি পরামর্শ">কৃষি পরামর্শ</option>
              <option value="পশু পালন">পশু পালন</option>
              <option value="মাছ চাষ">মাছ চাষ</option>
              <option value="সাধারণ প্রশ্ন">সাধারণ প্রশ্ন</option>
            </Select>
          </FormField>

          <FormField label="বিবরণ" required>
            <Textarea
              rows={4}
              placeholder="আপনার সমস্যা বা প্রশ্নের বিস্তারিত বিবরণ লিখুন..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
            />
          </FormField>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            ফোরামে প্রকাশ করুন
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title_bn || ''}
        subtitle={`প্রশিক্ষক: ${selectedCourse?.instructor_bn || ''}`}
      >
        {selectedCourse && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed font-normal">{selectedCourse.description_bn}</p>

            {selectedCourse.video_url ? (
              <a
                href={selectedCourse.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2 block text-center"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>টিউটোরিয়াল ভিডিও দেখুন ({selectedCourse.duration_hours} ঘণ্টা)</span>
              </a>
            ) : (
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-center">
                এই কোর্সের ভিডিও লেকচার শীঘ্রই আপলোড করা হবে।
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
