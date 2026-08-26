import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Textarea } from '../components/ui/FormComponents';
import { MessageSquare, Video, Eye, User, PlusCircle, ExternalLink, Play } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function CommunityPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();
  const [commTab, setCommTab] = useState('forum');

  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('কৃষি পরামর্শ');
  const [postContent, setPostContent] = useState('');
  const [postSuccessMsg, setPostSuccessMsg] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/community/forum/posts');
      if (res.ok) setPosts(await res.json());
    } catch (e) {}
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/community/training/courses');
      if (res.ok) setCourses(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchPosts();
    fetchCourses();
  }, []);

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    setPostSuccessMsg('');
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
        setPostSuccessMsg('আপনার ফোরাম পোস্টটি সফলভাবে প্রকাশিত হয়েছে!');
        setTimeout(() => {
          setIsNewPostModalOpen(false);
          setPostSuccessMsg('');
          setPostTitle('');
          setPostContent('');
          fetchPosts();
        }, 1200);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden shadow-card border border-emerald-900/20 bg-emerald-900 text-white min-h-[160px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80"
          alt="Rural Agricultural Training Bangladesh"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="relative z-10 p-6 max-w-xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-100 border border-emerald-600/50 backdrop-blur-xs">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>কৃষক ফোরাম ও ডিজিটাল দক্ষতা ডিরেক্টরি</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">গ্রামীণ ফোরাম ও প্রশিক্ষণ কেন্দ্র</h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
            কৃষকদের পারস্পরিক অভিজ্ঞতা বিনিময় এবং কার্যকরী ভিডিও টিউটোরিয়াল সম্বলিত ট্রেনিং।
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCommTab('forum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            commTab === 'forum'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>কৃষক ফোরাম (Q&A)</span>
        </button>

        <button
          onClick={() => setCommTab('training')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            commTab === 'training'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Video className="w-4 h-4 text-emerald-600" />
          <span>ডিজিটাল ট্রেনিং কোর্স (YouTube)</span>
        </button>
      </div>

      {commTab === 'forum' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক প্রশ্ন ও পরামর্শ</h3>
            <button
              onClick={() => {
                if (!authToken) {
                  openAuthModal('login');
                  return;
                }
                setIsNewPostModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নতুন প্রশ্ন পোস্ট করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      {post.views_count} ভিউ
                    </span>
                  </div>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3 h-3 text-slate-500" />
                      {post.author_name}
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Modal
            isOpen={isNewPostModalOpen}
            onClose={() => setIsNewPostModalOpen(false)}
            title="নতুন প্রশ্ন বা পরামর্শ পোস্ট করুন"
          >
            {postSuccessMsg ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg text-center">
                {postSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleCreatePostSubmit} className="space-y-3">
                <FormField label="শিরোনাম">
                  <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="আপনার প্রশ্নের মূল বিষয়..." required />
                </FormField>
                <FormField label="ক্যাটাগরি">
                  <Input value={postCategory} onChange={(e) => setPostCategory(e.target.value)} placeholder="কৃষি পরামর্শ" required />
                </FormField>
                <FormField label="বিস্তারিত আলোচনা">
                  <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="আপনার সমস্যা বা অভিজ্ঞতা বিস্তারিত লিখুন..." required />
                </FormField>
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm">
                  পোস্ট প্রকাশ করুন
                </button>
              </form>
            )}
          </Modal>
        </div>
      )}

      {commTab === 'training' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Card key={c.id} className="flex flex-col justify-between overflow-hidden">
                <CardHeader>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit mb-1">
                    {c.category} ({c.duration_hours} ঘণ্টা)
                  </span>
                  <CardTitle>{c.title_bn}</CardTitle>
                  <CardDescription>প্রশিক্ষক: {c.instructor_bn}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{c.description_bn}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(c)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>ভিডিও ক্লাস দেখুন</span>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Modal
            isOpen={!!selectedCourse}
            onClose={() => setSelectedCourse(null)}
            title={selectedCourse?.title_bn || ''}
            subtitle={`প্রশিক্ষক: ${selectedCourse?.instructor_bn || ''}`}
          >
            {selectedCourse && (
              <div className="space-y-4 text-xs">
                {selectedCourse.video_url?.includes('youtube.com/embed/') ? (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                    <iframe
                      src={selectedCourse.video_url}
                      title={selectedCourse.title_bn}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100 text-center space-y-2">
                    <Video className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-semibold text-slate-800">অনলাইন ভিডিও কোর্স টিউটোরিয়াল</p>
                  </div>
                )}

                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedCourse.description_bn}
                </p>

                {selectedCourse.video_url && (
                  <a
                    href={selectedCourse.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm block text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ইউটিউবে (YouTube) সরাসরি খুলুন</span>
                  </a>
                )}
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  );
}
