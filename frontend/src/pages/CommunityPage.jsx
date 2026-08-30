import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Textarea } from '../components/ui/FormComponents';
import { MessageSquare, Video, Eye, User, PlusCircle, ExternalLink, Play, Heart, MessageCircle, Send, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Reaction & Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [loadingCommentsMap, setLoadingCommentsMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [submittingCommentMap, setSubmittingCommentMap] = useState({});

  const fetchPosts = async () => {
    try {
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const res = await fetch('/api/community/forum/posts', { headers });
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
  }, [authToken]);

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

  const handleToggleReaction = async (postId) => {
    if (!authToken) {
      openAuthModal('login');
      return;
    }

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const wasReacted = p.user_reacted;
        return {
          ...p,
          user_reacted: !wasReacted,
          reactions_count: wasReacted ? Math.max(0, (p.reactions_count || 1) - 1) : (p.reactions_count || 0) + 1
        };
      }
      return p;
    }));

    try {
      const res = await fetch(`/api/community/forum/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, user_reacted: data.user_reacted, reactions_count: data.reactions_count } : p));
      } else {
        fetchPosts(); // revert on failure
      }
    } catch (e) {
      fetchPosts();
    }
  };

  const fetchPostComments = async (postId) => {
    setLoadingCommentsMap(prev => ({ ...prev, [postId]: true }));
    try {
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const res = await fetch(`/api/community/forum/posts/${postId}/comments`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCommentsMap(prev => ({ ...prev, [postId]: data }));
      }
    } catch (e) {
    } finally {
      setLoadingCommentsMap(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleToggleComments = (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      if (!commentsMap[postId]) {
        fetchPostComments(postId);
      }
    }
  };

  const handleAddCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }

    const content = (commentInputs[postId] || '').trim();
    if (!content) {
      setCommentErrors(prev => ({ ...prev, [postId]: 'অনুগ্রহ করে মন্তব্যের বিবরণ লিখুন।' }));
      return;
    }

    setCommentErrors(prev => ({ ...prev, [postId]: '' }));
    setSubmittingCommentMap(prev => ({ ...prev, [postId]: true }));

    try {
      const res = await fetch(`/api/community/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const newComment = await res.json();
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        // increment post comments_count in UI
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
      } else {
        const err = await res.json();
        setCommentErrors(prev => ({ ...prev, [postId]: err.detail || 'মন্তব্য প্রকাশ ব্যর্থ হয়েছে।' }));
      }
    } catch (e) {
      setCommentErrors(prev => ({ ...prev, [postId]: 'সার্ভার সংযোগ ত্রুটি!' }));
    } finally {
      setSubmittingCommentMap(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/community/forum/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        setCommentsMap(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
        }));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) } : p));
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
            কৃষকদের পারস্পরিক অভিজ্ঞতা বিনিময়, প্রশ্ন-উত্তর আলোচনা এবং বাস্তবভিত্তিক ভিডিও টিউটোরিয়াল।
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
          <span>কৃষক ফোরাম ও আলোচনা (Q&A)</span>
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
            <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক প্রশ্ন ও কৃষক পরামর্শ</h3>
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
            {posts.map((post) => {
              const isCommentOpen = activeCommentPostId === post.id;
              const postComments = commentsMap[post.id] || [];
              const isLoadingComments = loadingCommentsMap[post.id];
              const isSubmittingComment = submittingCommentMap[post.id];
              const currentInput = commentInputs[post.id] || '';
              const commentError = commentErrors[post.id] || '';

              return (
                <Card key={post.id} className="flex flex-col justify-between hover:border-emerald-300 transition-all">
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
                    <CardTitle className="text-slate-900 font-bold">{post.title}</CardTitle>
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

                    {/* Interactive Action Bar: Like Button & Comment Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => handleToggleReaction(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          post.user_reacted
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                            : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.user_reacted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                        <span>{post.reactions_count || 0} লাইক</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComments(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isCommentOpen
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>{post.comments_count || 0} মন্তব্য</span>
                        {isCommentOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                      </button>
                    </div>

                    {/* Collapsible Comments Section */}
                    {isCommentOpen && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 space-y-3 bg-emerald-50/20 p-3 rounded-xl">
                        <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>মন্তব্য ও আলোচনা ({postComments.length}):</span>
                        </h4>

                        {isLoadingComments ? (
                          <div className="py-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            <span>মন্তব্য লোড হচ্ছে...</span>
                          </div>
                        ) : postComments.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic text-center py-2 bg-white/60 rounded border border-dashed border-slate-200">
                            এখনও কোন মন্তব্য করা হয়নি। আপনি প্রথম মন্তব্য করুন!
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {postComments.map((c) => (
                              <div key={c.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1 text-xs shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                                    <User className="w-3 h-3 text-emerald-600" />
                                    {c.author_name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">{formatDate(c.created_at)}</span>
                                    {c.can_delete && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(post.id, c.id)}
                                        title="মন্তব্য মুছুন"
                                        className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed pl-4">{c.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input Form */}
                        <form onSubmit={(e) => handleAddCommentSubmit(e, post.id)} className="space-y-1.5 pt-1">
                          {commentError && (
                            <p className="text-[10px] font-semibold text-rose-600">{commentError}</p>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={currentInput}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder={authToken ? "আপনার মতামত বা সমাধান লিখুন..." : "মন্তব্য করতে সাইন-ইন করুন..."}
                              disabled={!authToken || isSubmittingComment}
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                            />
                            <button
                              type="submit"
                              disabled={!authToken || isSubmittingComment}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              {isSubmittingComment ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>পাঠান</span>
                            </button>
                          </div>
                          {!authToken && (
                            <p className="text-[10px] text-slate-400">
                              * মন্তব্য প্রদান করতে <button type="button" onClick={() => openAuthModal('login')} className="text-emerald-700 font-semibold underline">সাইন-ইন</button> করুন।
                            </p>
                          )}
                        </form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
